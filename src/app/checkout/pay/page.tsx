import React from "react";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PayClient from "@/components/PayClient";

export const revalidate = 0;

interface PayPageProps {
  searchParams: {
    orderId?: string;
    checkoutUrl?: string;
    error?: string;
  };
}

export default async function PayPage({ searchParams }: PayPageProps) {
  const orderIdStr = searchParams.orderId;
  const checkoutUrl = searchParams.checkoutUrl;
  const error = searchParams.error;

  if (!orderIdStr || !checkoutUrl) {
    notFound();
  }

  const orderId = parseInt(orderIdStr);
  if (isNaN(orderId)) {
    notFound();
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      payments: true,
    },
  });

  if (!order) {
    notFound();
  }

  // If already paid, send directly to confirmation
  if (order.paymentStatus === "PAID") {
    redirect(`/checkout/confirmation?orderId=${order.id}`);
  }

  const reference = order.payments[0]?.paystackReference || "";
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";

  return (
    <PayClient
      order={order}
      checkoutUrl={checkoutUrl}
      reference={reference}
      publicKey={publicKey}
      initialError={error}
    />
  );
}
