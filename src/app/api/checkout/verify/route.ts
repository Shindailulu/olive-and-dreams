import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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
    // 1. Find the pending payment records
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
      if (isJson) {
        return NextResponse.json({ success: false, error: "payment_not_found" }, { status: 404 });
      }
      return NextResponse.redirect(new URL("/cart?error=payment_not_found", req.url));
    }

    const order = payment.order;

    // If order is already paid, just redirect to confirmation
    if (order.paymentStatus === "PAID") {
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
      // 3. Complete payment transactionally
      await prisma.$transaction(async (tx) => {
        // Update payment record
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: "SUCCESSFUL",
            method: verifyRes.data.channel || "card",
          },
        });

        // Update order status
        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: "PAID",
            orderStatus: "PROCESSING",
          },
        });

        // Reduce inventory
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

      if (isJson) {
        return NextResponse.json({ success: true, orderId: order.id });
      }
      return NextResponse.redirect(new URL(`/checkout/confirmation?orderId=${order.id}`, req.url));
    } else {
      // Payment failed
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: { status: "FAILED" },
        }),
        prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: "FAILED",
            orderStatus: "PENDING_PAYMENT", // Allow retry
          },
        }),
      ]);

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
