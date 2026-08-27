import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

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
      const gatewayAmount = event.data.amount; // in kobo

      // Find the payment
      const payment = await prisma.payment.findUnique({
        where: { paystackReference: reference },
        include: {
          order: {
            include: {
              items: true,
            },
          },
        },
      });

      if (!payment) {
        return NextResponse.json({ error: "Payment reference not found" }, { status: 404 });
      }

      const order = payment.order;

      // If already paid, return 200 immediately
      if (order.paymentStatus === "PAID") {
        return NextResponse.json({ status: "already_processed" });
      }

      // Complete payment & decrement inventory
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: "SUCCESSFUL",
            method: event.data.channel || "card",
          },
        });

        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: "PAID",
            orderStatus: "PROCESSING",
          },
        });

        for (const item of order.items) {
          const variant = await tx.productVariant.findFirst({
            where: {
              productId: item.productId,
              size: item.size,
              color: item.color,
            },
          });

          if (variant) {
            const newStock = Math.max(0, variant.stock - item.quantity);
            await tx.productVariant.update({
              where: { id: variant.id },
              data: { stock: newStock },
            });
          }
        }
      });

      console.log(`Order ${order.orderNumber} successfully processed via Webhook.`);
    }

    return NextResponse.json({ status: "success" });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
