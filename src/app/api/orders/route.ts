import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { getSessionUser } from "@/lib/auth";
import { initializeTransaction } from "@/lib/paystack";
import { generateOrderNumber } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      deliveryMethod,
      address,
      city,
      state,
      additionalInstructions,
      items, // array of { productId, size, color, quantity }
    } = body;

    if (!customerName || !customerEmail || !customerPhone || !deliveryMethod || !items || items.length === 0) {
      return NextResponse.json({ error: "Missing required checkout fields" }, { status: 400 });
    }

    // 1. Authenticate user if logged in
    const user = await getSessionUser();
    const userId = user ? user.id : null;
    const supabase = getAdminClient();

    // 2. Fetch shipping rate from settings
    const { data: shippingSetting } = await supabase
      .from("delivery_methods")
      .select("*")
      .eq("code", deliveryMethod)
      .eq("enabled", true)
      .single();

    if (!shippingSetting) {
      return NextResponse.json({ error: "Selected delivery method is currently unavailable" }, { status: 400 });
    }
    const deliveryFee = shippingSetting.fee;

    // 3. Process products & verify stock
    let subtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const { data: productInfo, error } = await supabase
        .from("products")
        .select("*, product_variants!inner(*)")
        .eq("id", item.productId)
        .eq("product_variants.size", item.size)
        .eq("product_variants.color", item.color)
        .single();

      if (error || !productInfo) {
        return NextResponse.json(
          { error: `Variant not found: (${item.size}/${item.color}) for Product ID ${item.productId}` },
          { status: 400 }
        );
      }

      const variant = productInfo.product_variants[0];

      if (variant.stock_quantity < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${productInfo.name} (${item.size}/${item.color}). Only ${variant.stock_quantity} left.`,
          },
          { status: 400 }
        );
      }

      const itemPrice = productInfo.price;
      subtotal += itemPrice * item.quantity;

      orderItemsData.push({
        productId: productInfo.id,
        variantId: variant.id,
        productName: productInfo.name,
        size: item.size,
        color: item.color,
        price: itemPrice,
        quantity: item.quantity,
      });
    }

    const total = subtotal + deliveryFee;
    const orderNumber = generateOrderNumber();

    // 4. Create Order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_id: userId,
        guest_name: customerName,
        guest_email: customerEmail,
        guest_phone: customerPhone,
        subtotal,
        shipping_fee: deliveryFee,
        total,
        delivery_method: deliveryMethod,
        shipping_address: { address, city, state },
        additional_instructions: additionalInstructions,
        status: "pending",
        payment_status: "pending",
        payment_gateway: "paystack",
      })
      .select()
      .single();

    if (orderError || !order) {
      throw orderError || new Error("Failed to create order");
    }

    // 5. Insert order items
    const { error: itemsError } = await supabase.from("order_items").insert(
      orderItemsData.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        variant_id: item.variantId,
        product_name: item.productName,
        variant_title: `${item.size} / ${item.color}`,
        price_at_purchase: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity,
      }))
    );

    if (itemsError) {
      throw itemsError;
    }

    // 6. Initiate Paystack Transaction
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host");
    const callbackUrl = `${protocol}://${host}/api/checkout/verify`;
    const reference = `REF_${orderNumber}_${Date.now()}`;

    const paystackRes = await initializeTransaction(customerEmail, total, reference, callbackUrl);

    if (!paystackRes.status) {
      // Clean up/cancel order if payment initiation failed completely
      await supabase
        .from("orders")
        .update({
          status: "cancelled",
          payment_status: "failed",
        })
        .eq("id", order.id);

      return NextResponse.json({ error: "Failed to initialize payment gateway: " + paystackRes.message }, { status: 522 });
    }

    // Save payment reference
    await supabase
      .from("orders")
      .update({ payment_reference: reference })
      .eq("id", order.id);

    return NextResponse.json({
      success: true,
      checkoutUrl: paystackRes.data.authorization_url,
      orderId: order.id,
      orderNumber,
    });
  } catch (error: any) {
    console.error("Create Order Error:", error);
    return NextResponse.json({ error: "Failed to process order" }, { status: 500 });
  }
}
