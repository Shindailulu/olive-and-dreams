"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useStore } from "@/components/StoreContext";
import { formatNaira } from "@/lib/utils";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartSubtotal, cartCount } = useStore();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="border-b border-brand-burgundy/10 pb-6 mb-10">
        <h1 className="font-serif text-3xl text-brand-burgundy">Your Cart</h1>
        <p className="font-sans text-xs uppercase tracking-widest text-brand-charcoal/50 mt-2">
          {cartCount} {cartCount === 1 ? "Piece" : "Pieces"} selected
        </p>
      </div>

      {cart.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Cart Items List (Col 8) */}
          <div className="md:col-span-8 space-y-6">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex items-center space-x-4 border-b border-brand-burgundy/5 pb-6"
              >
                {/* Image */}
                <div className="relative w-20 aspect-[3/4] overflow-hidden bg-brand-cream border border-brand-burgundy/5">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>

                {/* Info & controls */}
                <div className="flex-grow space-y-1">
                  <h3 className="font-serif text-base text-brand-burgundy hover:underline">
                    <Link href={`/product/${item.productId}`}>{item.name}</Link>
                  </h3>
                  
                  {/* Selected variants details */}
                  <div className="flex flex-wrap gap-x-3 text-xs text-brand-charcoal/60 font-light uppercase tracking-wider">
                    <span>Size: {item.size}</span>
                    <span>•</span>
                    <span>Color: {item.color}</span>
                  </div>

                  <p className="text-sm font-medium text-brand-charcoal">{formatNaira(item.price)}</p>

                  {/* Quantity adjustment & Remove */}
                  <div className="flex items-center space-x-4 pt-2">
                    <div className="flex items-center border border-brand-burgundy/20 bg-brand-cream">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2.5 py-1 text-brand-burgundy hover:bg-brand-burgundy/5 text-xs focus:outline-none"
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="px-3 py-0.5 text-xs font-sans text-brand-charcoal">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2.5 py-1 text-brand-burgundy hover:bg-brand-burgundy/5 text-xs focus:outline-none"
                        disabled={item.quantity >= item.maxStock}
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-brand-burgundy/60 hover:text-brand-burgundy p-1.5 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Subtotal per item */}
                <div className="text-right font-sans text-sm font-semibold text-brand-charcoal">
                  {formatNaira(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary Panel (Col 4) */}
          <div className="md:col-span-4 bg-brand-burgundy/5 p-6 border border-brand-burgundy/5 self-start space-y-6">
            <h2 className="font-serif text-lg text-brand-burgundy">Summary</h2>
            
            <div className="flex items-center justify-between text-sm border-b border-brand-burgundy/10 pb-4">
              <span className="font-light text-brand-charcoal/80">Subtotal</span>
              <span className="font-medium text-brand-charcoal">{formatNaira(cartSubtotal)}</span>
            </div>

            <p className="text-xs text-brand-charcoal/60 leading-relaxed font-light">
              Delivery fees are calculated during checkout based on your shipping address and selected method.
            </p>

            <div className="space-y-3 pt-2">
              <Link
                href="/checkout"
                className="w-full flex items-center justify-center space-x-2 bg-brand-burgundy text-brand-cream text-xs uppercase tracking-widest py-4 hover:bg-brand-burgundy/90 transition-colors focus-visible:ring-2 focus-visible:ring-brand-burgundy"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/shop"
                className="w-full flex items-center justify-center border border-brand-burgundy/20 text-brand-burgundy text-xs uppercase tracking-widest py-4 hover:border-brand-burgundy hover:bg-brand-burgundy/5 transition-all focus-visible:ring-2 focus-visible:ring-brand-burgundy"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto text-center py-20 bg-brand-burgundy/5 rounded-lg px-4 border border-brand-burgundy/5">
          <ShoppingBag className="h-10 w-10 text-brand-burgundy/50 mx-auto mb-4" />
          <h2 className="font-serif text-lg text-brand-burgundy">Your cart is currently empty.</h2>
          <p className="font-sans text-sm text-brand-charcoal/60 mt-2 font-light">
            Browse our debut collection and find your next favorite piece.
          </p>
          <div className="pt-8">
            <Link
              href="/shop"
              className="inline-block bg-brand-burgundy text-brand-cream text-xs uppercase tracking-widest px-8 py-4 font-medium hover:bg-brand-burgundy/90 transition-colors"
            >
              Shop the Collection
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
