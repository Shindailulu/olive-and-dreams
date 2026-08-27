import React from "react";
import { prisma } from "@/lib/prisma";
import CheckoutForm from "@/components/CheckoutForm";

export const revalidate = 0; // Fetch fresh delivery configurations live

export default async function CheckoutPage() {
  const deliveryOptions = await prisma.deliverySetting.findMany({
    where: { enabled: true },
    select: {
      method: true,
      fee: true,
      instructions: true,
      locationDetails: true,
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="border-b border-brand-burgundy/10 pb-6 mb-12">
        <h1 className="font-serif text-3xl text-brand-burgundy">Checkout</h1>
      </div>

      <CheckoutForm deliveryOptions={deliveryOptions} />
    </div>
  );
}
