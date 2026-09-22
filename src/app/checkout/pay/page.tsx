import React from "react";
import { notFound, redirect } from "next/navigation";
import { getAdminClient } from "@/lib/supabase";
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
    return;
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(orderIdStr)) {
    notFound();
    return;
  }

  const supabase = getAdminClient();
  const { data } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderIdStr)
    .single();

  const orderData = data as any;

  if (!orderData) {
    notFound();
    return;
  }

  // If already paid, send directly to confirmation
  if (orderData.payment_status === "paid") {
    redirect(`/checkout/confirmation?orderId=${orderData.id}`);
  }

  const order = {
    ...orderData,
    id: orderData.id,
    total: Number(orderData.total),
    paymentStatus: orderData.payment_status.toUpperCase(),
    orderStatus: orderData.status.toUpperCase(),
    orderNumber: orderData.order_number,
    customerName: orderData.guest_name,
    customerEmail: orderData.guest_email,
    customerPhone: orderData.guest_phone,
    deliveryFee: Number(orderData.shipping_fee),
    deliveryMethod: orderData.delivery_method,
    items: orderData.order_items.map((item: any) => {
      let size = "";
      let color = "";
      if (item.variant_title) {
        const parts = item.variant_title.split(" / ");
        size = parts[0] || "";
        color = parts[1] || "";
      }
      return {
        ...item,
        productName: item.product_name,
        price: Number(item.price_at_purchase),
        size,
        color,
        quantity: item.quantity,
      };
    })
  };

  const reference = orderData.payment_reference || "";
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
