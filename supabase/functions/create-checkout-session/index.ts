import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";
import { corsHeaders } from "../_shared/cors.ts";

interface CheckoutItem {
  variant_id: string;
  quantity: number;
}

interface CheckoutPayload {
  items: CheckoutItem[];
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  delivery_method_code: string;
  shipping_address?: Record<string, any>;
  billing_address?: Record<string, any>;
  discount_code?: string;
  additional_instructions?: string;
  session_token?: string;
  callback_url?: string;
}

serve(async (req) => {
  // 1. Handle CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY") ?? "";
    const appUrl = Deno.env.get("SITE_URL") || "http://localhost:3000";

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase server configuration.");
    }

    // Use Service Role client for secure order creation and pricing lookups
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check optional authenticated user from header
    let customerId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await userClient.auth.getUser();
      if (user) {
        customerId = user.id;
      }
    }

    const payload: CheckoutPayload = await req.json();
    const {
      items,
      customer,
      delivery_method_code,
      shipping_address = {},
      billing_address = {},
      discount_code,
      additional_instructions,
      callback_url,
    } = payload;

    // 2. Validate basic input fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Cart is empty. Please add items to checkout." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!customer?.email || !customer?.name || !customer?.phone) {
      return new Response(
        JSON.stringify({ error: "Customer name, email, and phone number are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Look up Delivery Method
    const { data: deliveryMethod, error: deliveryErr } = await supabase
      .from("delivery_methods")
      .select("*")
      .eq("code", delivery_method_code)
      .eq("enabled", true)
      .single();

    if (deliveryErr || !deliveryMethod) {
      return new Response(
        JSON.stringify({ error: "Invalid or inactive delivery method selected." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const shippingFee = Number(deliveryMethod.fee) || 0;

    // 4. Fetch server-side product and variant details to calculate prices
    const variantIds = items.map((i) => i.variant_id);
    const { data: variants, error: variantErr } = await supabase
      .from("product_variants")
      .select(`
        id,
        size,
        color,
        sku,
        price_override,
        stock_quantity,
        product:products (
          id,
          name,
          price,
          status
        )
      `)
      .in("id", variantIds);

    if (variantErr || !variants || variants.length === 0) {
      return new Response(
        JSON.stringify({ error: "Failed to resolve product variants." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const variantMap = new Map(variants.map((v: any) => [v.id, v]));

    // Validate quantities and stock availability server-side
    let subtotal = 0;
    const resolvedOrderItems: Array<{
      variant_id: string;
      product_id: string;
      product_name: string;
      variant_title: string;
      sku: string | null;
      price_at_purchase: number;
      quantity: number;
      total: number;
    }> = [];

    for (const item of items) {
      const variant: any = variantMap.get(item.variant_id);
      if (!variant) {
        return new Response(
          JSON.stringify({ error: `Variant ${item.variant_id} is no longer available.` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (variant.product.status !== "active") {
        return new Response(
          JSON.stringify({ error: `Product "${variant.product.name}" is not currently available for purchase.` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (item.quantity <= 0) {
        return new Response(
          JSON.stringify({ error: "Invalid quantity specified." }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (variant.stock_quantity < item.quantity) {
        return new Response(
          JSON.stringify({
            error: `Insufficient stock for "${variant.product.name}" (${variant.size} / ${variant.color}). Available: ${variant.stock_quantity}.`,
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Determine accurate unit price (variant override takes precedence over base product price)
      const unitPrice = variant.price_override !== null && variant.price_override !== undefined
        ? Number(variant.price_override)
        : Number(variant.product.price);

      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;

      resolvedOrderItems.push({
        variant_id: variant.id,
        product_id: variant.product.id,
        product_name: variant.product.name,
        variant_title: `${variant.size} / ${variant.color}`,
        sku: variant.sku || null,
        price_at_purchase: unitPrice,
        quantity: item.quantity,
        total: lineTotal,
      });
    }

    // 5. Apply discount server-side if provided
    let discountTotal = 0;
    let discountId: string | null = null;

    if (discount_code) {
      const cleanCode = discount_code.trim().toUpperCase();
      const now = new Date().toISOString();

      const { data: discount } = await supabase
        .from("discounts")
        .select("*")
        .eq("code", cleanCode)
        .eq("is_active", true)
        .lte("starts_at", now)
        .single();

      if (discount) {
        const notExpired = !discount.expires_at || new Date(discount.expires_at) > new Date();
        const underLimit = !discount.usage_limit || discount.usage_count < discount.usage_limit;
        const meetsMinPurchase = subtotal >= Number(discount.min_purchase_amount || 0);

        if (notExpired && underLimit && meetsMinPurchase) {
          discountId = discount.id;
          if (discount.type === "percent") {
            const rawDiscount = (subtotal * Number(discount.value)) / 100;
            discountTotal = discount.max_discount_amount
              ? Math.min(rawDiscount, Number(discount.max_discount_amount))
              : rawDiscount;
          } else {
            discountTotal = Math.min(Number(discount.value), subtotal);
          }
        }
      }
    }

    const total = Math.max(0, subtotal - discountTotal + shippingFee);

    // 6. Generate unique order number
    const year = new Date().getFullYear();
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderNumber = `OD-${year}-${randomSuffix}`;
    const paymentReference = `REF_${orderNumber}_${Date.now()}`;

    // 7. Insert Order into Database
    const { data: newOrder, error: orderInsertErr } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_id: customerId,
        guest_name: customer.name,
        guest_email: customer.email,
        guest_phone: customer.phone,
        status: "pending",
        payment_status: "pending",
        currency: "NGN",
        subtotal,
        discount_total: discountTotal,
        shipping_fee: shippingFee,
        total,
        discount_id: discountId,
        delivery_method: deliveryMethod.name,
        shipping_address,
        billing_address,
        payment_gateway: "paystack",
        payment_reference: paymentReference,
        additional_instructions: additional_instructions || null,
      })
      .select("id")
      .single();

    if (orderInsertErr || !newOrder) {
      console.error("Order Insert Error:", orderInsertErr);
      throw new Error("Failed to create pending order record.");
    }

    // 8. Insert Order Items
    const itemsToInsert = resolvedOrderItems.map((item) => ({
      order_id: newOrder.id,
      ...item,
    }));

    const { error: itemsErr } = await supabase.from("order_items").insert(itemsToInsert);
    if (itemsErr) {
      console.error("Order Items Insert Error:", itemsErr);
      throw new Error("Failed to record order items.");
    }

    // 9. Initialize Paystack Transaction
    const effectiveCallbackUrl =
      callback_url || `${appUrl}/checkout/verify?order_id=${newOrder.id}&order_number=${orderNumber}`;

    let authorizationUrl = "";
    let accessCode = "";

    if (!paystackSecretKey || paystackSecretKey.startsWith("sk_test_mock")) {
      // Mock mode fallback for local sandbox testing without live keys
      console.log("Paystack running in MOCK mode.");
      authorizationUrl = `${effectiveCallbackUrl}&reference=${paymentReference}&mock=true`;
      accessCode = `mock_code_${Date.now()}`;
    } else {
      const amountInKobo = Math.round(total * 100);
      const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: customer.email,
          amount: amountInKobo,
          reference: paymentReference,
          callback_url: effectiveCallbackUrl,
          metadata: {
            order_id: newOrder.id,
            order_number: orderNumber,
            customer_name: customer.name,
            customer_phone: customer.phone,
          },
        }),
      });

      const paystackData = await paystackRes.json();
      if (!paystackRes.ok || !paystackData.status) {
        console.error("Paystack Error:", paystackData);
        // Mark order as cancelled due to gateway initialization failure
        await supabase
          .from("orders")
          .update({ status: "cancelled", payment_status: "failed" })
          .eq("id", newOrder.id);

        return new Response(
          JSON.stringify({
            error: paystackData.message || "Failed to initialize transaction with Paystack.",
          }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      authorizationUrl = paystackData.data.authorization_url;
      accessCode = paystackData.data.access_code;
    }

    return new Response(
      JSON.stringify({
        success: true,
        order_id: newOrder.id,
        order_number: orderNumber,
        reference: paymentReference,
        subtotal,
        discount_total: discountTotal,
        shipping_fee: shippingFee,
        total,
        authorization_url: authorizationUrl,
        access_code: accessCode,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Checkout Edge Function Error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "An unexpected error occurred during checkout." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
