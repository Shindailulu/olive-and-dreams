"use client";

import React, { useEffect } from "react";
import { useStore } from "./StoreContext";
import { formatNaira } from "@/lib/utils";
import Link from "next/link";
import { CheckCircle, ShoppingBag, Truck, Calendar } from "lucide-react";

interface ConfirmationClientProps {
  order: {
    id: number;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryMethod: string;
    deliveryFee: number;
    subtotal: number;
    total: number;
    address: string | null;
    city: string | null;
    state: string | null;
    additionalInstructions: string | null;
    items: {
      id: number;
      productName: string;
      size: string;
      color: string;
      price: number;
      quantity: number;
    }[];
  };
}

export default function ConfirmationClient({ order }: ConfirmationClientProps) {
  const { clearCart } = useStore();

  // Clear cart on successful order confirmation page mount
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center sm:text-left space-y-12">
      
      {/* 1. Header Success Banner */}
      <div className="flex flex-col items-center sm:items-start space-y-4">
        <CheckCircle className="h-14 w-14 text-brand-olive animate-pulse" />
        <div className="space-y-1">
          <h1 className="font-serif text-4xl text-brand-burgundy tracking-tight">Order Confirmed</h1>
          <p className="font-sans text-sm text-brand-charcoal/70 leading-relaxed font-light pt-1">
            Thank you for shopping with Olive & Dreams. Your order has been received and is being processed.
          </p>
        </div>
      </div>

      {/* 2. Order Metadata Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-b border-brand-burgundy/10 py-6 text-sm font-light text-brand-charcoal/70">
        <div>
          <span className="block font-sans text-xs uppercase tracking-widest text-brand-burgundy font-bold mb-1">Order Number</span>
          <span className="font-medium text-brand-charcoal">{order.orderNumber}</span>
        </div>
        <div>
          <span className="block font-sans text-xs uppercase tracking-widest text-brand-burgundy font-bold mb-1">Status</span>
          <span className="bg-brand-olive/15 text-brand-olive text-xs font-semibold px-2.5 py-0.5 rounded tracking-wide uppercase">
            Paid & Processing
          </span>
        </div>
      </div>

      {/* 3. Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-sm text-brand-charcoal/80 font-light">
        
        {/* Left: Summary and Delivery Details */}
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="font-sans text-xs uppercase tracking-widest text-brand-burgundy font-bold border-b border-brand-burgundy/5 pb-2">
              Delivery Information
            </h3>
            <p className="font-medium text-brand-charcoal">{order.customerName}</p>
            <p>{order.customerEmail}</p>
            <p>{order.customerPhone}</p>
            <p className="pt-2">
              Method: <span className="font-semibold text-brand-charcoal">
                {order.deliveryMethod === "ABUJA_PICKUP" ? "Abuja Showroom Pickup" : "Nationwide Delivery"}
              </span>
            </p>
            {order.deliveryMethod === "NATIONWIDE" && (
              <p className="mt-1 font-sans text-brand-charcoal">
                {order.address}, {order.city}, {order.state}
              </p>
            )}
          </div>

          {order.deliveryMethod === "ABUJA_PICKUP" && (
            <div className="p-4 bg-brand-olive/5 border border-brand-olive/20 text-xs text-brand-olive space-y-1">
              <span className="font-sans uppercase tracking-widest font-bold block mb-1">Pickup Details</span>
              <p>Showroom Address: Suite 12, Olive Plaza, Wuse II, Abuja.</p>
              <p>We will contact you via phone/SMS once your pieces are packed and ready for collection.</p>
            </div>
          )}
        </div>

        {/* Right: Items Listing */}
        <div className="space-y-4">
          <h3 className="font-sans text-xs uppercase tracking-widest text-brand-burgundy font-bold border-b border-brand-burgundy/5 pb-2">
            Items Purchased
          </h3>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <div>
                  <p className="font-serif text-brand-burgundy leading-snug">{item.productName}</p>
                  <p className="text-xs text-brand-charcoal/50 uppercase tracking-widest mt-0.5">
                    {item.size} / {item.color} × {item.quantity}
                  </p>
                </div>
                <span className="font-sans text-brand-charcoal font-medium">{formatNaira(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-brand-burgundy/10 pt-4 space-y-2 text-sm text-brand-charcoal/80">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatNaira(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Cost</span>
              <span>{order.deliveryFee === 0 ? "Free" : formatNaira(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold text-brand-burgundy border-t border-brand-burgundy/10 pt-4">
              <span>Total Paid</span>
              <span className="text-lg">{formatNaira(order.total)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* 4. Action Buttons */}
      <div className="pt-8 border-t border-brand-burgundy/10 flex flex-col sm:flex-row gap-4 justify-center sm:justify-start">
        <Link
          href="/shop"
          className="inline-block bg-brand-burgundy text-brand-cream text-xs uppercase tracking-widest px-8 py-4 font-medium hover:bg-brand-burgundy/90 transition-colors text-center"
        >
          Continue Shopping
        </Link>
        <Link
          href="/account"
          className="inline-block border border-brand-burgundy/20 text-brand-burgundy text-xs uppercase tracking-widest px-8 py-4 font-medium hover:border-brand-burgundy hover:bg-brand-burgundy/5 transition-all text-center"
        >
          View Order History
        </Link>
      </div>

    </div>
  );
}
