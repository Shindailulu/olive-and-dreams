"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useStore } from "@/components/StoreContext";
import { formatNaira } from "@/lib/utils";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";

export default function WishlistPage() {
  const { wishlist, toggleWishlist } = useStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="border-b border-brand-burgundy/10 pb-6 mb-12">
        <h1 className="font-serif text-3xl text-brand-burgundy">Your Wishlist</h1>
        <p className="font-sans text-xs uppercase tracking-widest text-brand-charcoal/50 mt-2">
          saved editorial pieces
        </p>
      </div>

      {wishlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {wishlist.map((item) => (
            <div key={item.id} className="group relative flex flex-col justify-between border border-brand-burgundy/5 p-4 bg-brand-cream shadow-sm">
              
              {/* Product Image */}
              <Link
                href={`/product/${item.slug}`}
                className="block relative aspect-[3/4] overflow-hidden bg-brand-cream"
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-center w-full h-full transform transition-transform duration-700 group-hover:scale-103"
                />
              </Link>

              {/* Product Info */}
              <div className="mt-4 space-y-1">
                <div className="flex items-start justify-between">
                  <h3 className="font-serif text-sm text-brand-burgundy tracking-wide hover:text-brand-olive transition-colors leading-snug">
                    <Link href={`/product/${item.slug}`}>{item.name}</Link>
                  </h3>
                  <p className="font-sans text-xs font-semibold text-brand-charcoal">{formatNaira(item.price)}</p>
                </div>
                <p className="text-[10px] uppercase tracking-widest text-brand-charcoal/40 font-light">{item.category}</p>
              </div>

              {/* Actions Grid */}
              <div className="mt-6 flex space-x-2 pt-2 border-t border-brand-burgundy/5">
                <Link
                  href={`/product/${item.slug}`}
                  className="flex-grow flex items-center justify-center space-x-2 bg-brand-burgundy text-brand-cream text-[10px] uppercase tracking-widest py-2.5 hover:bg-brand-burgundy/90 transition-colors font-medium text-center"
                >
                  <ShoppingBag className="h-3 w-3" />
                  <span>Choose Options</span>
                </Link>

                <button
                  onClick={() => toggleWishlist(item)}
                  className="p-2 border border-brand-burgundy/20 text-brand-burgundy/60 hover:text-brand-burgundy hover:border-brand-burgundy transition-all"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="max-w-md mx-auto text-center py-20 bg-brand-burgundy/5 border border-brand-burgundy/5 rounded-lg px-4">
          <Heart className="h-10 w-10 text-brand-burgundy/40 mx-auto mb-4" />
          <h2 className="font-serif text-lg text-brand-burgundy">Your wishlist is currently empty.</h2>
          <p className="font-sans text-sm text-brand-charcoal/60 mt-2 font-light">
            Keep track of items you adore by clicking the heart button on any product card.
          </p>
          <div className="pt-8">
            <Link
              href="/shop"
              className="inline-block bg-brand-burgundy text-brand-cream text-xs uppercase tracking-widest px-8 py-4 font-medium hover:bg-brand-burgundy/90 transition-colors"
            >
              Discover Pieces
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
