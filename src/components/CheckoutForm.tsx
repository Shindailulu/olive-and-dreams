"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useStore } from "./StoreContext";
import { formatNaira } from "@/lib/utils";

interface DeliveryOption {
  method: string;
  fee: number;
  instructions: string | null;
  locationDetails: string | null;
}

interface CheckoutFormProps {
  deliveryOptions: DeliveryOption[];
}

export default function CheckoutForm({ deliveryOptions }: CheckoutFormProps) {
  const { cart, cartSubtotal, cartCount } = useStore();
  const router = useRouter();

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState(
    deliveryOptions[0]?.method || "ABUJA_PICKUP"
  );
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [instructions, setInstructions] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Find active delivery option configuration
  const activeDelivery = deliveryOptions.find((d) => d.method === deliveryMethod);
  const shippingFee = activeDelivery ? activeDelivery.fee : 0;
  const total = cartSubtotal + shippingFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      setError("Your cart is empty");
      return;
    }

    if (!name || !email || !phone) {
      setError("Please fill out all required contact fields.");
      return;
    }

    if (deliveryMethod === "NATIONWIDE" && (!address || !city || !state)) {
      setError("Please fill out all shipping address fields.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          deliveryMethod,
          address: deliveryMethod === "NATIONWIDE" ? address : null,
          city: deliveryMethod === "NATIONWIDE" ? city : null,
          state: deliveryMethod === "NATIONWIDE" ? state : null,
          additionalInstructions: instructions,
          items: cart.map((item) => ({
            productId: item.productId,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create order");
      }

      // Redirect to review page with orderId and payment link
      router.push(`/checkout/pay?orderId=${data.orderId}&checkoutUrl=${encodeURIComponent(data.checkoutUrl)}`);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Checkout Input Form (Col 7) */}
      <div className="lg:col-span-7 space-y-8 bg-brand-cream">
        
        {/* Contact Info */}
        <div className="space-y-4">
          <h2 className="font-serif text-xl text-brand-burgundy border-b border-brand-burgundy/10 pb-2">1. Contact Information</h2>
          
          {error && (
            <div className="p-3 bg-brand-burgundy/5 border border-brand-burgundy/10 text-brand-burgundy text-xs uppercase tracking-widest font-light">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1">
              <label htmlFor="name" className="text-xs uppercase tracking-wider text-brand-charcoal/60">Full Name *</label>
              <input
                id="name"
                type="text"
                required
                autoComplete="name"
                placeholder="e.g. Chinelo Adebayo"
                className="bg-transparent border-b border-brand-burgundy/20 py-2 text-sm tracking-wide text-brand-burgundy focus:outline-none focus:border-brand-burgundy"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="flex flex-col space-y-1">
              <label htmlFor="email" className="text-xs uppercase tracking-wider text-brand-charcoal/60">Email Address *</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                spellCheck={false}
                placeholder="e.g. name@example.com"
                className="bg-transparent border-b border-brand-burgundy/20 py-2 text-sm tracking-wide text-brand-burgundy focus:outline-none focus:border-brand-burgundy"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <label htmlFor="phone" className="text-xs uppercase tracking-wider text-brand-charcoal/60">Phone Number *</label>
            <input
              id="phone"
              type="tel"
              required
              autoComplete="tel"
              placeholder="e.g. +234 812 345 6789"
              className="bg-transparent border-b border-brand-burgundy/20 py-2 text-sm tracking-wide text-brand-burgundy focus:outline-none focus:border-brand-burgundy"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        {/* Delivery Selection */}
        <div className="space-y-4">
          <h2 className="font-serif text-xl text-brand-burgundy border-b border-brand-burgundy/10 pb-2">2. Delivery Preference</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {deliveryOptions.map((opt) => (
              <label
                key={opt.method}
                className={`border p-4 flex flex-col justify-between cursor-pointer transition-all ${deliveryMethod === opt.method ? "border-brand-burgundy bg-brand-burgundy/5" : "border-brand-burgundy/10 hover:border-brand-burgundy/30 bg-transparent"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-serif text-brand-burgundy uppercase tracking-wider">
                    {opt.method === "ABUJA_PICKUP" ? "Abuja Showroom Pickup" : "Nationwide Delivery"}
                  </span>
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value={opt.method}
                    checked={deliveryMethod === opt.method}
                    onChange={() => setDeliveryMethod(opt.method)}
                    className="accent-brand-burgundy"
                  />
                </div>
                <p className="text-xs font-sans font-medium text-brand-charcoal mt-3">
                  {opt.fee === 0 ? "Free (₦0)" : formatNaira(opt.fee)}
                </p>
              </label>
            ))}
          </div>

          {/* Render details based on delivery choice */}
          {deliveryMethod === "ABUJA_PICKUP" && activeDelivery && (
            <div className="p-4 bg-brand-burgundy/5 border border-brand-burgundy/10 text-xs font-light space-y-1.5 leading-relaxed text-brand-charcoal/80">
              <span className="font-sans uppercase tracking-widest text-brand-burgundy font-bold block mb-1">Pickup Instructions</span>
              <p>{activeDelivery.instructions}</p>
              {activeDelivery.locationDetails && (
                <p className="font-medium mt-1">Location: {activeDelivery.locationDetails}</p>
              )}
            </div>
          )}

          {deliveryMethod === "NATIONWIDE" && (
            <div className="space-y-4 border border-brand-burgundy/10 p-4 bg-brand-burgundy/5">
              <span className="font-sans text-xs uppercase tracking-widest text-brand-burgundy font-bold block mb-1">Shipping Details</span>
              
              <div className="flex flex-col space-y-1">
                <label htmlFor="address" className="text-xs uppercase tracking-wider text-brand-charcoal/60">Street Address *</label>
                <input
                  id="address"
                  type="text"
                  placeholder="e.g. 15 Ikoyi Link Road"
                  className="bg-transparent border-b border-brand-burgundy/20 py-2 text-sm tracking-wide text-brand-burgundy focus:outline-none focus:border-brand-burgundy"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <label htmlFor="city" className="text-xs uppercase tracking-wider text-brand-charcoal/60">City *</label>
                  <input
                    id="city"
                    type="text"
                    placeholder="e.g. Lagos"
                    className="bg-transparent border-b border-brand-burgundy/20 py-2 text-sm tracking-wide text-brand-burgundy focus:outline-none focus:border-brand-burgundy"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label htmlFor="state" className="text-xs uppercase tracking-wider text-brand-charcoal/60">State *</label>
                  <input
                    id="state"
                    type="text"
                    placeholder="e.g. Lagos State"
                    className="bg-transparent border-b border-brand-burgundy/20 py-2 text-sm tracking-wide text-brand-burgundy focus:outline-none focus:border-brand-burgundy"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Delivery notes / additional instructions */}
          <div className="flex flex-col space-y-1 pt-2">
            <label htmlFor="instructions" className="text-xs uppercase tracking-wider text-brand-charcoal/60">Additional Instructions</label>
            <textarea
              id="instructions"
              rows={2}
              placeholder="e.g. Leave with gatekeeper or call before arrival…"
              className="bg-transparent border border-brand-burgundy/20 p-2 text-sm tracking-wide text-brand-burgundy focus:outline-none focus:border-brand-burgundy"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </div>
        </div>

      </div>

      {/* Cart Summary Column (Col 5) */}
      <div className="lg:col-span-5 bg-brand-burgundy/5 p-6 border border-brand-burgundy/5 self-start space-y-6">
        <h2 className="font-serif text-lg text-brand-burgundy border-b border-brand-burgundy/10 pb-2">Order Items</h2>
        
        {/* Items listing */}
        <div className="space-y-4 max-h-[40vh] overflow-y-auto">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center space-x-3 text-sm">
              <div className="relative w-12 aspect-[3/4] overflow-hidden bg-brand-cream border border-brand-burgundy/5">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-grow">
                <p className="font-serif text-brand-burgundy">{item.name}</p>
                <p className="text-xs text-brand-charcoal/60 font-light uppercase tracking-wider">
                  {item.size} / {item.color} × {item.quantity}
                </p>
              </div>
              <p className="font-medium text-brand-charcoal">{formatNaira(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>

        {/* Pricing calculations */}
        <div className="border-t border-brand-burgundy/10 pt-4 space-y-2 text-sm">
          <div className="flex items-center justify-between text-brand-charcoal/80">
            <span className="font-light">Subtotal</span>
            <span>{formatNaira(cartSubtotal)}</span>
          </div>

          <div className="flex items-center justify-between text-brand-charcoal/80">
            <span className="font-light">Delivery ({deliveryMethod === "ABUJA_PICKUP" ? "Showroom Pickup" : "Nationwide"})</span>
            <span>{shippingFee === 0 ? "Free (₦0)" : formatNaira(shippingFee)}</span>
          </div>

          <div className="flex items-center justify-between text-base font-semibold text-brand-burgundy border-t border-brand-burgundy/10 pt-4">
            <span>Total</span>
            <span className="text-lg">{formatNaira(total)}</span>
          </div>
        </div>

        {/* CTA */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading || cart.length === 0}
            className="w-full bg-brand-burgundy text-brand-cream text-xs uppercase tracking-widest py-4 font-medium hover:bg-brand-burgundy/90 transition-colors focus-visible:ring-2 focus-visible:ring-brand-burgundy disabled:opacity-50"
          >
            {loading ? "Processing Order…" : "Continue to Payment"}
          </button>
        </div>
      </div>
    </form>
  );
}
