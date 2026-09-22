import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";
import { corsHeaders } from "../_shared/cors.ts";

interface RequestBody {
  order_id: string;
}

function formatNaira(amount: number): string {
  return "₦" + amount.toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const resendApiKey = Deno.env.get("RESEND_API_KEY") ?? "";
    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "orders@oliveanddreams.com";

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration.");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { order_id }: RequestBody = await req.json();
    if (!order_id) {
      return new Response(
        JSON.stringify({ error: "order_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Fetch Order and Line Items
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select(`
        *,
        items:order_items (*)
      `)
      .eq("id", order_id)
      .single();

    if (orderErr || !order) {
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const recipientEmail = order.guest_email;
    const customerName = order.guest_name || "Valued Customer";

    if (!recipientEmail) {
      return new Response(
        JSON.stringify({ error: "No recipient email found for this order" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Build items HTML rows
    const itemsHtml = (order.items || [])
      .map(
        (item: any) => `
        <tr style="border-bottom: 1px solid #f0e6e6;">
          <td style="padding: 14px 0; font-family: sans-serif; font-size: 14px; color: #2d2626;">
            <strong>${item.product_name}</strong><br/>
            <span style="font-size: 12px; color: #736262;">${item.variant_title}</span>
          </td>
          <td style="padding: 14px 0; text-align: center; font-family: sans-serif; font-size: 14px; color: #554444;">
            ${item.quantity}
          </td>
          <td style="padding: 14px 0; text-align: right; font-family: sans-serif; font-size: 14px; color: #2d2626; font-weight: 500;">
            ${formatNaira(Number(item.total))}
          </td>
        </tr>
      `
      )
      .join("");

    const shippingAddress = order.shipping_address || {};
    const addressStr = shippingAddress.address_line1
      ? `${shippingAddress.address_line1}, ${shippingAddress.city || ""}, ${shippingAddress.state || ""}`
      : "Abuja Showroom Pickup (Suite 12, Olive Plaza, Wuse II)";

    // 3. Branded Luxury HTML Email Template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - Olive & Dreams</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #faf7f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #faf7f5; padding: 40px 10px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #ebe4e4;">
                
                <!-- Brand Header -->
                <tr>
                  <td style="padding: 36px 40px; background-color: #3b1d24; text-align: center;">
                    <h1 style="margin: 0; font-family: Georgia, serif; font-size: 26px; letter-spacing: 2px; text-transform: uppercase; color: #ffffff; font-weight: 400;">
                      Olive &amp; Dreams
                    </h1>
                    <p style="margin: 6px 0 0 0; font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; color: #d4a373;">
                      many good things
                    </p>
                  </td>
                </tr>

                <!-- Thank You Note -->
                <tr>
                  <td style="padding: 36px 40px 20px 40px;">
                    <h2 style="margin: 0 0 12px 0; font-family: Georgia, serif; font-size: 20px; color: #3b1d24; font-weight: 500;">
                      Thank you for your order, ${customerName}.
                    </h2>
                    <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #554444;">
                      We are preparing your exquisite pieces with utmost care. You will receive an update once your package is on its way.
                    </p>
                  </td>
                </tr>

                <!-- Order Reference Details -->
                <tr>
                  <td style="padding: 0 40px 24px 40px;">
                    <table width="100%" cellpadding="12" cellspacing="0" style="background-color: #fdfaf9; border-radius: 6px; border: 1px solid #f2e9e8;">
                      <tr>
                        <td style="font-size: 13px; color: #736262; text-transform: uppercase; letter-spacing: 1px;">
                          Order Number: <strong style="color: #3b1d24; font-size: 14px;">${order.order_number}</strong>
                        </td>
                        <td align="right" style="font-size: 13px; color: #736262;">
                          Date: <strong style="color: #3b1d24;">${new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</strong>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Items Table -->
                <tr>
                  <td style="padding: 0 40px 24px 40px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <thead>
                        <tr style="border-bottom: 2px solid #3b1d24;">
                          <th align="left" style="padding-bottom: 10px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #3b1d24;">Item</th>
                          <th align="center" style="padding-bottom: 10px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #3b1d24;">Qty</th>
                          <th align="right" style="padding-bottom: 10px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #3b1d24;">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsHtml}
                      </tbody>
                    </table>
                  </td>
                </tr>

                <!-- Totals Section -->
                <tr>
                  <td style="padding: 0 40px 30px 40px;">
                    <table width="100%" cellpadding="4" cellspacing="0">
                      <tr>
                        <td align="right" style="font-size: 14px; color: #736262;">Subtotal:</td>
                        <td align="right" width="120" style="font-size: 14px; color: #332222;">${formatNaira(Number(order.subtotal))}</td>
                      </tr>
                      ${
                        Number(order.discount_total) > 0
                          ? `<tr>
                              <td align="right" style="font-size: 14px; color: #2e7d32;">Discount:</td>
                              <td align="right" width="120" style="font-size: 14px; color: #2e7d32;">-${formatNaira(Number(order.discount_total))}</td>
                            </tr>`
                          : ""
                      }
                      <tr>
                        <td align="right" style="font-size: 14px; color: #736262;">Delivery (${order.delivery_method}):</td>
                        <td align="right" width="120" style="font-size: 14px; color: #332222;">${formatNaira(Number(order.shipping_fee))}</td>
                      </tr>
                      <tr style="border-top: 2px solid #ebe4e4;">
                        <td align="right" style="padding-top: 10px; font-size: 16px; font-weight: bold; color: #3b1d24;">Total Paid:</td>
                        <td align="right" width="120" style="padding-top: 10px; font-size: 18px; font-weight: bold; color: #3b1d24;">${formatNaira(Number(order.total))}</td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Shipping / Delivery Details -->
                <tr>
                  <td style="padding: 24px 40px; background-color: #fcf9f9; border-top: 1px solid #f2e9e8;">
                    <h3 style="margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #3b1d24;">
                      Delivery Details
                    </h3>
                    <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #554444;">
                      <strong>Method:</strong> ${order.delivery_method}<br/>
                      <strong>Address:</strong> ${addressStr}<br/>
                      <strong>Contact:</strong> ${order.guest_phone || ""}
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 30px 40px; text-align: center; background-color: #ffffff; border-top: 1px solid #ebe4e4;">
                    <p style="margin: 0 0 8px 0; font-size: 13px; color: #736262;">
                      Need assistance with your order? Reply directly to this email or reach us on Instagram <a href="https://instagram.com" style="color: #3b1d24; text-decoration: none; font-weight: 500;">@oliveanddreams</a>.
                    </p>
                    <p style="margin: 0; font-size: 11px; color: #a89a9a; letter-spacing: 0.5px;">
                      &copy; ${new Date().getFullYear()} Olive &amp; Dreams. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    // 4. Send Email via Resend API
    if (!resendApiKey || resendApiKey.startsWith("re_mock")) {
      console.log(`Resend running in MOCK mode. Email to ${recipientEmail} for order ${order.order_number} simulated.`);
      return new Response(
        JSON.stringify({ success: true, mock: true, message: "Email logged in sandbox/mock mode." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [recipientEmail],
        subject: `Order Confirmed — ${order.order_number} | Olive & Dreams`,
        html: emailHtml,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.error("Resend API Error:", resendData);
      return new Response(
        JSON.stringify({ error: resendData.message || "Failed to dispatch email via Resend" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, email_id: resendData.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("Send Order Confirmation Error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Failed to send confirmation email." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
