import { NextResponse } from "next/server";
import crypto from "crypto";
import { getAdminClient } from "@/lib/supabase";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing Paystack signature" }, { status: 400 });
    }

    // Verify webhook signature (skip if mock key is active)
    if (!PAYSTACK_SECRET_KEY.startsWith("sk_test_mock")) {
      const hash = crypto
        .createHmac("sha512", PAYSTACK_SECRET_KEY)
        .update(rawBody)
        .digest("hex");

      if (hash !== signature) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const event = JSON.parse(rawBody);

    // We only care about charge.success
    if (event.event === "charge.success") {
      const reference = event.data.reference;

      const supabase = getAdminClient();

      // Find the order
      const { data: order } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("payment_reference", reference)
        .single();

      if (!order) {
        return NextResponse.json({ error: "Payment reference not found" }, { status: 404 });
      }

      // If already paid, return 200 immediately
      if (order.payment_status === "paid") {
        return NextResponse.json({ status: "already_processed" });
      }

      // Complete payment & decrement inventory
      await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          status: "paid",
          payment_gateway: event.data.channel || "card",
        })
        .eq("id", order.id);

      await supabase.rpc("decrement_order_inventory", { p_order_id: order.id });

      console.log(`Order ${order.order_number} successfully processed via Webhook.`);
    }

    return NextResponse.json({ status: "success" });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
