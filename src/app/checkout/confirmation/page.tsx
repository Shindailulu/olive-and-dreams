import React from "react";
import { notFound } from "next/navigation";
import { getAdminClient } from "@/lib/supabase";
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

  return <ConfirmationClient order={order} />;
}
