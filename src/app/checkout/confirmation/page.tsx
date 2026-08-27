import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ConfirmationClient from "@/components/ConfirmationClient";

export const revalidate = 0; // Fetch fresh order details

interface ConfirmationPageProps {
  searchParams: {
    orderId?: string;
  };
}

export default async function ConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const orderIdStr = searchParams.orderId;

  if (!orderIdStr) {
    notFound();
  }

  const orderId = parseInt(orderIdStr);
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
    },
  });

  if (!order) {
    notFound();
  }

  return <ConfirmationClient order={order} />;
}
