import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { verifyTransaction } from "@/lib/paystack";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference");
  const isJson = searchParams.get("json") === "true";

  if (!reference) {
    if (isJson) {
      return NextResponse.json({ success: false, error: "missing_reference" }, { status: 400 });
    }
    return NextResponse.redirect(new URL("/cart?error=missing_reference", req.url));
  }

  try {
    const supabase = getAdminClient();

    // 1. Find the order by payment reference
    const { data: order } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("payment_reference", reference)
      .single();

    if (!order) {
      if (isJson) {
        return NextResponse.json({ success: false, error: "payment_not_found" }, { status: 404 });
      }
      return NextResponse.redirect(new URL("/cart?error=payment_not_found", req.url));
    }

    // If order is already paid, just redirect to confirmation
    if (order.payment_status === "paid") {
      if (isJson) {
        return NextResponse.json({ success: true, orderId: order.id });
      }
      return NextResponse.redirect(new URL(`/checkout/confirmation?orderId=${order.id}`, req.url));
    }

    // 2. Query Paystack
    const verifyRes = await verifyTransaction(reference);

    const statusParam = searchParams.get("status");
    const isMockFailure = statusParam === "failed";
    const isSuccess = verifyRes.status && verifyRes.data.status === "success" && !isMockFailure;

    if (isSuccess) {
      // 3. Complete payment
      await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          status: "paid",
          payment_gateway: verifyRes.data.channel || "card",
        })
        .eq("id", order.id);

      // Reduce inventory via RPC
      await supabase.rpc("decrement_order_inventory", { p_order_id: order.id });

      if (isJson) {
        return NextResponse.json({ success: true, orderId: order.id });
      }
      return NextResponse.redirect(new URL(`/checkout/confirmation?orderId=${order.id}`, req.url));
    } else {
      // Payment failed
      await supabase
        .from("orders")
        .update({
          payment_status: "failed",
          status: "pending", // Allow retry
        })
        .eq("id", order.id);

      if (isJson) {
        return NextResponse.json({ success: false, error: "payment_failed" }, { status: 400 });
      }
      return NextResponse.redirect(
        new URL(`/checkout/pay?error=payment_failed&orderId=${order.id}`, req.url)
      );
    }
  } catch (error) {
    console.error("Verify Payment Error:", error);
    if (isJson) {
      return NextResponse.json({ success: false, error: "internal_verification_error" }, { status: 500 });
    }
    return NextResponse.redirect(new URL("/cart?error=internal_verification_error", req.url));
  }
}
