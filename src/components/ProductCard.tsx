"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useStore, WishlistItem } from "./StoreContext";
import { formatNaira } from "@/lib/utils";
import { Heart } from "lucide-react";

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  slug: string;
  image: string;
  category: string;
  variants: {
    color: string;
    stock: number;
  }[];
}

export default function ProductCard({ id, name, price, slug, image, category, variants }: ProductCardProps) {
  const { toggleWishlist, isInWishlist } = useStore();

  const isSaved = isInWishlist(id);

  // Extract unique colors that are in stock
  const colors = Array.from(new Set(variants.map((v) => v.color)));

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const item: WishlistItem = { id, name, price, image, category, slug };
    toggleWishlist(item);
  };

  return (
    <div className="group relative flex flex-col justify-between">
      {/* Product Image Container */}
      <Link href={`/product/${slug}`} className="block relative aspect-[3/4] overflow-hidden bg-brand-cream border border-brand-burgundy/5">
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-center w-full h-full transform transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Wishlist Button Overlay */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-4 right-4 p-2 bg-brand-cream/80 backdrop-blur-sm rounded-full text-brand-burgundy hover:bg-brand-cream hover:scale-110 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-burgundy"
          aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`h-4.5 w-4.5 ${isSaved ? "fill-brand-burgundy" : "text-brand-burgundy"}`} />
        </button>

        {/* Categories indicator */}
        <span className="absolute bottom-4 left-4 bg-brand-burgundy/80 text-brand-cream text-[10px] uppercase tracking-widest px-2 py-0.5 font-light">
          {category}
        </span>
      </Link>

      {/* Product Info */}
      <div className="mt-4 flex flex-col space-y-1">
        <div className="flex items-start justify-between">
          <h3 className="font-serif text-base text-brand-burgundy tracking-wide hover:text-brand-olive transition-colors">
            <Link href={`/product/${slug}`}>{name}</Link>
          </h3>
          <p className="font-sans text-sm font-medium text-brand-charcoal">{formatNaira(price)}</p>
        </div>

        {/* Unique Colors Display */}
        {colors.length > 0 && (
          <div className="flex items-center space-x-1.5 pt-1">
            <span className="text-[10px] uppercase tracking-widest text-brand-charcoal/50">Colors:</span>
            <div className="flex items-center space-x-1">
              {colors.map((color, idx) => (
                <span
                  key={idx}
                  title={color}
                  className="text-[11px] font-sans font-light text-brand-charcoal/70 bg-brand-burgundy/5 px-1.5 py-0.5 rounded"
                >
                  {color}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
