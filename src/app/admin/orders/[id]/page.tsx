import React from "react";
import { notFound, redirect } from "next/navigation";
import { getAdminClient } from "@/lib/supabase";
import { formatNaira } from "@/lib/utils";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { ArrowLeft, Clock, User, Phone, Mail, MapPin, CreditCard, ChevronRight } from "lucide-react";

export const revalidate = 0;

interface OrderDetailPageProps {
  params: {
    id: string;
  };
}

export default async function AdminOrderDetailPage({ params }: OrderDetailPageProps) {
  const orderId = params.id;
  const supabase = getAdminClient();

  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .single();

  const order = data as any;

  if (!order) {
    notFound();
    return;
  }

  // Handle shipping_address parsing
  let addressData = { address: "", city: "", state: "" };
  if (typeof order.shipping_address === "string") {
    try {
      addressData = JSON.parse(order.shipping_address);
    } catch (e) {
      // ignore
    }
  } else if (order.shipping_address && typeof order.shipping_address === "object") {
    addressData = order.shipping_address as any;
  }

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <Link href="/admin/orders" className="inline-flex items-center text-xs uppercase tracking-widest text-brand-burgundy hover:text-brand-olive transition-colors font-medium">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
        </Link>
        <h1 className="font-serif text-3xl text-brand-burgundy mt-2">Order Details</h1>
        <p className="font-sans text-xs uppercase tracking-widest text-brand-charcoal/50 mt-1">
          Reference: {order.order_number}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-sm font-light text-brand-charcoal/80">
        
        {/* Detail Summary Panel (Col 8) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Order Summary & Customer Info */}
          <div className="bg-brand-cream border border-brand-burgundy/10 p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="font-serif text-lg text-brand-burgundy border-b border-brand-burgundy/5 pb-2">
              Customer & Delivery Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 leading-relaxed">
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-xs uppercase tracking-widest text-brand-charcoal/50 font-bold">
                  <User className="h-4 w-4 text-brand-olive" />
                  <span>Customer</span>
                </div>
                <p className="font-medium text-brand-charcoal">{order.guest_name}</p>
                <p className="flex items-center space-x-1.5"><Mail className="h-3.5 w-3.5 text-brand-olive" /> <span>{order.guest_email}</span></p>
                <p className="flex items-center space-x-1.5"><Phone className="h-3.5 w-3.5 text-brand-olive" /> <span>{order.guest_phone}</span></p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-xs uppercase tracking-widest text-brand-charcoal/50 font-bold">
                  <MapPin className="h-4 w-4 text-brand-olive" />
                  <span>Fulfillment</span>
                </div>
                <p className="font-medium text-brand-charcoal">
                  {order.delivery_method === "ABUJA_PICKUP" ? "Abuja Showroom Pickup" : "Nationwide Delivery"}
                </p>
                {order.delivery_method === "NATIONWIDE" ? (
                  <p className="text-brand-charcoal mt-1">
                    {addressData.address}, {addressData.city}, {addressData.state}
                  </p>
                ) : (
                  <p className="text-brand-olive italic">Pickup from Showroom Room Suite 12</p>
                )}
                {order.additional_instructions && (
                  <p className="text-xs italic bg-brand-burgundy/5 p-2 border-l border-brand-burgundy mt-2">
                    Note: &ldquo;{order.additional_instructions}&rdquo;
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Purchased Items details */}
          <div className="bg-brand-cream border border-brand-burgundy/10 p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="font-serif text-lg text-brand-burgundy border-b border-brand-burgundy/5 pb-2">
              Purchased Items
            </h2>

            <div className="space-y-4">
              {(order.order_items || []).map((item: any) => (
                <div key={item.id} className="flex justify-between items-center text-sm border-b border-brand-burgundy/5 pb-3">
                  <div>
                    <p className="font-serif text-base text-brand-burgundy leading-snug">{item.product_name}</p>
                    <p className="text-xs text-brand-charcoal/50 uppercase tracking-widest mt-0.5">
                      {item.variant_title} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-sans font-medium text-brand-charcoal">{formatNaira(Number(item.price_at_purchase) * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 flex flex-col items-end space-y-2 text-sm">
              <div className="flex justify-between w-full max-w-xs text-brand-charcoal/70">
                <span>Subtotal</span>
                <span>{formatNaira(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between w-full max-w-xs text-brand-charcoal/70">
                <span>Delivery Cost</span>
                <span>{Number(order.shipping_fee) === 0 ? "Free" : formatNaira(Number(order.shipping_fee))}</span>
              </div>
              <div className="flex justify-between w-full max-w-xs text-brand-burgundy font-semibold border-t border-brand-burgundy/10 pt-4 text-base">
                <span>Total Amount</span>
                <span className="text-lg">{formatNaira(Number(order.total))}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Action / Management Sidebar (Col 4) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Status management block */}
          <div className="bg-brand-cream border border-brand-burgundy/10 p-6 shadow-sm space-y-6">
            <h3 className="font-serif text-lg text-brand-burgundy border-b border-brand-burgundy/5 pb-2">
              Order Fulfillment
            </h3>

            {/* Order Status Display */}
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-wider text-brand-charcoal/50 font-bold block">Order Status</span>
              <span className="inline-block bg-brand-burgundy/10 text-brand-burgundy text-xs uppercase tracking-widest px-3 py-1.5 rounded font-semibold">
                {order.status.replace(/_/g, " ")}
              </span>
            </div>

            <hr className="border-brand-burgundy/10 my-4" />

            {/* Payment Status Display */}
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-wider text-brand-charcoal/50 font-bold block">Payment Status</span>
              <span className={`inline-block text-xs uppercase tracking-wider px-3 py-1.5 rounded font-semibold ${order.payment_status === "paid" ? "bg-brand-olive/15 text-brand-olive" : "bg-brand-burgundy/10 text-brand-burgundy"}`}>
                {order.payment_status}
              </span>
            </div>
          </div>

          {/* Payment Reference details block */}
          {order.payment_reference && (
            <div className="bg-brand-cream border border-brand-burgundy/10 p-6 shadow-sm space-y-4">
              <h3 className="font-serif text-lg text-brand-burgundy border-b border-brand-burgundy/5 pb-2 flex items-center space-x-2">
                <CreditCard className="h-4.5 w-4.5 text-brand-olive" />
                <span>Payment Reference</span>
              </h3>
              <div className="text-xs space-y-2 font-light text-brand-charcoal/70 leading-relaxed">
                <p><strong>Paystack Ref:</strong> <code className="bg-brand-burgundy/5 px-1 py-0.5 font-mono">{order.payment_reference}</code></p>
                <p><strong>Amount:</strong> {formatNaira(Number(order.total))}</p>
                <p><strong>Status:</strong> <span className={`uppercase font-bold ${order.payment_status === "paid" ? "text-brand-olive" : "text-brand-burgundy"}`}>{order.payment_status}</span></p>
                <p><strong>Channel:</strong> {order.payment_gateway || "paystack"}</p>
                <p><strong>Updated At:</strong> {new Date(order.updated_at).toLocaleString("en-NG")}</p>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
