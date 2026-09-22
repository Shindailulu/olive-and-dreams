import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";
import { corsHeaders } from "../_shared/cors.ts";

interface DiscountRequest {
  code: string;
  subtotal: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase configuration.");
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const body: DiscountRequest = await req.json();
    const { code, subtotal } = body;

    if (!code || typeof code !== "string") {
      return new Response(
        JSON.stringify({ valid: false, error: "Please provide a valid coupon code." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (typeof subtotal !== "number" || subtotal < 0) {
      return new Response(
        JSON.stringify({ valid: false, error: "Invalid cart subtotal provided." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const cleanCode = code.trim().toUpperCase();
    const now = new Date().toISOString();

    // Query active discount from public.discounts
    const { data: discount, error } = await supabase
      .from("discounts")
      .select("*")
      .eq("code", cleanCode)
      .eq("is_active", true)
      .single();

    if (error || !discount) {
      return new Response(
        JSON.stringify({ valid: false, error: `Coupon code "${cleanCode}" does not exist or is inactive.` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check validity window
    if (discount.starts_at && new Date(discount.starts_at) > new Date()) {
      return new Response(
        JSON.stringify({ valid: false, error: `Coupon code "${cleanCode}" is not yet active.` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (discount.expires_at && new Date(discount.expires_at) <= new Date()) {
      return new Response(
        JSON.stringify({ valid: false, error: `Coupon code "${cleanCode}" has expired.` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check usage limits
    if (discount.usage_limit && discount.usage_count >= discount.usage_limit) {
      return new Response(
        JSON.stringify({ valid: false, error: `Coupon code "${cleanCode}" has reached its maximum usage limit.` }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check minimum purchase requirement
    const minPurchase = Number(discount.min_purchase_amount || 0);
    if (subtotal < minPurchase) {
      return new Response(
        JSON.stringify({
          valid: false,
          error: `Coupon code requires a minimum order subtotal of ₦${minPurchase.toLocaleString()}.`,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discount.type === "percent") {
      const raw = (subtotal * Number(discount.value)) / 100;
      discountAmount = discount.max_discount_amount
        ? Math.min(raw, Number(discount.max_discount_amount))
        : raw;
    } else {
      // Fixed amount
      discountAmount = Math.min(Number(discount.value), subtotal);
    }

    // Round to 2 decimals
    discountAmount = Math.round(discountAmount * 100) / 100;
    const finalSubtotal = Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100);

    return new Response(
      JSON.stringify({
        valid: true,
        discount: {
          id: discount.id,
          code: discount.code,
          type: discount.type,
          value: Number(discount.value),
          discount_amount: discountAmount,
          final_subtotal: finalSubtotal,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Apply Discount Error:", err);
    return new Response(
      JSON.stringify({ valid: false, error: err.message || "Failed to validate coupon code." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
