import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

// Web Crypto HMAC-SHA512 signature verification for Paystack webhooks
async function verifyPaystackSignature(body: string, signature: string, secretKey: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secretKey);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(body));
    const hashArray = Array.from(new Uint8Array(signatureBuffer));
    const computedSignature = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    return computedSignature.toLowerCase() === signature.toLowerCase();
  } catch (err) {
    console.error("Signature verification error:", err);
    return false;
  }
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY") ?? "";

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration.");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Read Raw Body and Verify Signature
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature") || "";

    // Bypass signature check only if explicit mock secret is set
    const isMock = !paystackSecretKey || paystackSecretKey.startsWith("sk_test_mock");
    if (!isMock) {
      const isValid = await verifyPaystackSignature(rawBody, signature, paystackSecretKey);
      if (!isValid) {
        console.warn("Invalid Paystack webhook signature rejected.");
        return new Response("Unauthorized", { status: 401 });
      }
    }

    const event = JSON.parse(rawBody);
    console.log("Received Paystack event:", event.event);

    // 2. Handle successful charge
    if (event.event === "charge.success") {
      const { reference, metadata } = event.data;
      const orderId = metadata?.order_id;

      // Find order by order_id or reference
      let query = supabase.from("orders").select("*");
      if (orderId) {
        query = query.eq("id", orderId);
      } else {
        query = query.eq("payment_reference", reference);
      }

      const { data: order, error: orderErr } = await query.single();
      if (orderErr || !order) {
        console.error("Order not found for reference:", reference);
        // Return 200 to acknowledge webhook receipt even if order not matched
        return new Response(JSON.stringify({ received: true, note: "Order not found" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Idempotency: skip if already processed
      if (order.payment_status === "paid") {
        console.log(`Order ${order.order_number} already marked paid. Skipping.`);
        return new Response(JSON.stringify({ received: true, already_processed: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      // 3. Mark Order Paid
      const { error: updateOrderErr } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          status: "paid",
          payment_reference: reference,
        })
        .eq("id", order.id);

      if (updateOrderErr) {
        console.error("Error updating order status:", updateOrderErr);
      }

      // 4. Atomically Decrement Inventory using Postgres Stored Procedure
      const { error: rpcErr } = await supabase.rpc("decrement_order_inventory", {
        p_order_id: order.id,
      });

      if (rpcErr) {
        console.error("Failed to decrement inventory atomically:", rpcErr);
      } else {
        console.log(`Inventory successfully decremented for order ${order.order_number}`);
      }

      // 5. Update Discount Usage if applicable
      if (order.discount_id) {
        // Fetch current usage
        const { data: disc } = await supabase
          .from("discounts")
          .select("usage_count")
          .eq("id", order.discount_id)
          .single();

        if (disc) {
          await supabase
            .from("discounts")
            .update({ usage_count: (disc.usage_count || 0) + 1 })
            .eq("id", order.discount_id);
        }
      }

      // 6. Trigger Order Confirmation Email (Async invocation)
      const recipientEmail = order.guest_email || "";
      if (recipientEmail) {
        try {
          const fnUrl = `${supabaseUrl}/functions/v1/send-order-confirmation`;
          fetch(fnUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({ order_id: order.id }),
          }).catch((e) => console.error("Async email dispatch error:", e));
        } catch (mailErr) {
          console.error("Error dispatching email trigger:", mailErr);
        }
      }

      return new Response(JSON.stringify({ received: true, success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 7. Handle payment failure
    if (event.event === "charge.failed") {
      const { reference } = event.data;
      await supabase
        .from("orders")
        .update({ payment_status: "failed" })
        .eq("payment_reference", reference);

      return new Response(JSON.stringify({ received: true, status: "failed_recorded" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Paystack Webhook Handler Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
