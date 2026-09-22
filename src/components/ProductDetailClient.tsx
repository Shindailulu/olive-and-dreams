"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useStore, WishlistItem } from "./StoreContext";
import { formatNaira } from "@/lib/utils";
import { Heart, ShoppingBag, ArrowLeft, Check, Sparkles, Truck, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ProductDetailClientProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    category: string;
    price: number;
    compareAtPrice: number | null;
    images: string;
    material: string | null;
    fit: string | null;
    careInstructions: string | null;
    sizeGuide: string | null;
    variants: {
      id: string;
      size: string;
      color: string;
      stock: number;
      sku: string | null;
    }[];
  };
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const router = useRouter();

  const imageList = product.images.split(",");
  const [selectedImage, setSelectedImage] = useState(imageList[0]);
  
  // Extract unique sizes and colors
  const sizes = Array.from(new Set(product.variants.map((v) => v.size)));
  const colors = Array.from(new Set(product.variants.map((v) => v.color)));

  // States
  const [selectedSize, setSelectedSize] = useState(sizes[0] || "");
  const [selectedColor, setSelectedColor] = useState(colors[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState(false);

  // Find active variant matching size & color
  const activeVariant = product.variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor
  );

  const stockAvailable = activeVariant ? activeVariant.stock : 0;
  const isOutOfStock = stockAvailable === 0;

  const isSaved = isInWishlist(product.id);

  const handleBuyNow = () => {
    if (isOutOfStock || !activeVariant) return;

    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: imageList[0],
      size: selectedSize,
      color: selectedColor,
      quantity,
      maxStock: stockAvailable,
    });

    router.push("/checkout");
  };

  const handleAddToCart = () => {
    if (isOutOfStock || !activeVariant) return;

    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: imageList[0],
      size: selectedSize,
      color: selectedColor,
      quantity,
      maxStock: stockAvailable,
    });

    setAddedMessage(true);
    setTimeout(() => setAddedMessage(false), 3000);
  };

  const handleWishlistToggle = () => {
    const item: WishlistItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: imageList[0],
      category: product.category,
      slug: product.slug,
    };
    toggleWishlist(item);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back to Shop */}
      <div className="mb-8">
        <Link href="/shop" className="inline-flex items-center text-xs uppercase tracking-widest text-brand-burgundy hover:text-brand-olive transition-colors font-medium">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Shop
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* IMAGE GALLERY (Left - Col 6) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-[3/4] overflow-hidden bg-brand-cream border border-brand-burgundy/5">
            <Image
              src={selectedImage}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center w-full h-full transition-all"
              priority
            />
          </div>

          {/* Thumbnail row */}
          {imageList.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto py-2">
              {imageList.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-20 aspect-[3/4] overflow-hidden border transition-all ${selectedImage === img ? "border-brand-burgundy ring-1 ring-brand-burgundy" : "border-brand-burgundy/10 hover:border-brand-burgundy/50"}`}
                >
                  <Image src={img} alt={`${product.name} - Thumbnail ${idx + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* DETAILS SECTION (Right - Col 6) */}
        <div className="lg:col-span-6 space-y-8">
          <div>
            <span className="text-xs uppercase tracking-widest text-brand-olive font-bold">{product.category}</span>
            <h1 className="font-serif text-4xl text-brand-burgundy mt-2 tracking-tight">{product.name}</h1>
            <p className="font-sans text-xl font-medium mt-3 text-brand-charcoal">{formatNaira(product.price)}</p>
          </div>

          <div className="border-t border-b border-brand-burgundy/10 py-6">
            <p className="font-sans text-sm text-brand-charcoal/80 leading-relaxed font-light">{product.description}</p>
          </div>

          {/* SELECTION WIDGETS */}
          <div className="space-y-6">
            {/* Color selection */}
            <div>
              <span className="block text-xs uppercase tracking-widest text-brand-charcoal/50 mb-3 font-bold">Color: {selectedColor}</span>
              <div className="flex gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setSelectedColor(c);
                      setQuantity(1); // reset quantity to avoid exceeding new variant stock
                    }}
                    className={`text-xs px-4 py-2 border tracking-wider uppercase transition-colors ${selectedColor === c ? "border-brand-burgundy bg-brand-burgundy text-brand-cream" : "border-brand-burgundy/20 hover:border-brand-burgundy text-brand-charcoal/70"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Size selection */}
            <div>
              <span className="block text-xs uppercase tracking-widest text-brand-charcoal/50 mb-3 font-bold">Size: {selectedSize}</span>
              <div className="flex gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setSelectedSize(s);
                      setQuantity(1); // reset
                    }}
                    className={`text-xs px-4 py-2 border tracking-wider uppercase transition-colors ${selectedSize === s ? "border-brand-burgundy bg-brand-burgundy text-brand-cream" : "border-brand-burgundy/20 hover:border-brand-burgundy text-brand-charcoal/70"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity selector */}
            {!isOutOfStock && (
              <div className="flex items-center space-x-4">
                <span className="text-xs uppercase tracking-widest text-brand-charcoal/50 font-bold">Quantity</span>
                <div className="flex items-center border border-brand-burgundy/20 bg-brand-cream">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-brand-burgundy hover:bg-brand-burgundy/5 text-sm focus:outline-none"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-1 text-sm font-sans text-brand-charcoal">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(stockAvailable, quantity + 1))}
                    className="px-3 py-1.5 text-brand-burgundy hover:bg-brand-burgundy/5 text-sm focus:outline-none"
                    disabled={quantity >= stockAvailable}
                  >
                    +
                  </button>
                </div>
                
                {/* Stock alert */}
                <span className="text-xs text-brand-olive font-light">
                  {stockAvailable < 5 ? `Only ${stockAvailable} pieces left!` : "In Stock"}
                </span>
              </div>
            )}

            {/* OUT OF STOCK ALERT */}
            {isOutOfStock && (
              <div className="p-3 bg-brand-burgundy/5 border border-brand-burgundy/10 text-brand-burgundy text-xs uppercase tracking-widest font-light text-center">
                This variant (Size {selectedSize} in {selectedColor}) is currently sold out.
              </div>
            )}

            {/* ACTIONS */}
            <div className="flex flex-col gap-3 pt-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 flex items-center justify-center space-x-2 text-xs uppercase tracking-widest py-4 border transition-all focus-visible:ring-2 focus-visible:ring-brand-burgundy ${isOutOfStock ? "bg-brand-burgundy/10 text-brand-burgundy/40 border-brand-burgundy/5 cursor-not-allowed" : "border-brand-burgundy text-brand-burgundy hover:bg-brand-burgundy hover:text-brand-cream"}`}
                >
                  <ShoppingBag className="h-4.5 w-4.5" />
                  <span>{isOutOfStock ? "Out of Stock" : "Add to Cart"}</span>
                </button>

                {/* Buy It Now */}
                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className={`flex-1 flex items-center justify-center space-x-2 text-xs uppercase tracking-widest py-4 transition-all focus-visible:ring-2 focus-visible:ring-brand-burgundy ${isOutOfStock ? "bg-brand-burgundy/20 text-brand-burgundy/50 cursor-not-allowed" : "bg-brand-burgundy text-brand-cream hover:bg-brand-burgundy/90 font-medium"}`}
                >
                  <span>{isOutOfStock ? "Out of Stock" : "Buy It Now"}</span>
                </button>
              </div>

              {/* Wishlist Toggle */}
              <button
                onClick={handleWishlistToggle}
                className={`w-full py-4 border text-xs uppercase tracking-widest flex items-center justify-center space-x-2 transition-colors focus-visible:ring-2 focus-visible:ring-brand-burgundy ${isSaved ? "border-brand-burgundy bg-brand-burgundy text-brand-cream" : "border-brand-burgundy/20 hover:border-brand-burgundy text-brand-burgundy"}`}
                aria-label="Add to Wishlist"
              >
                <Heart className={`h-4.5 w-4.5 ${isSaved ? "fill-brand-cream" : ""}`} />
                <span>{isSaved ? "Saved" : "Save Piece"}</span>
              </button>
            </div>

            {/* Success Toast */}
            {addedMessage && (
              <div className="bg-brand-olive/15 text-brand-olive border border-brand-olive/30 px-4 py-3 text-xs tracking-wider uppercase font-medium flex items-center space-x-2 animate-fade-in" role="alert" aria-live="polite">
                <Check className="h-4 w-4" />
                <span>Piece added to your cart successfully.</span>
              </div>
            )}
          </div>

          {/* ACCORDION/TABS SPECIFICATIONS */}
          <div className="border-t border-brand-burgundy/10 pt-8 space-y-6 text-sm font-light text-brand-charcoal/80">
            {/* Fabric */}
            {product.material && (
              <div className="flex items-start space-x-4">
                <Sparkles className="h-5 w-5 text-brand-olive mt-0.5" />
                <div>
                  <h4 className="font-sans text-xs uppercase tracking-widest text-brand-burgundy font-bold">Fabric & Material</h4>
                  <p className="mt-1">{product.material}</p>
                </div>
              </div>
            )}

            {/* Fit */}
            {product.fit && (
              <div className="flex items-start space-x-4">
                <Sparkles className="h-5 w-5 text-brand-olive mt-0.5" />
                <div>
                  <h4 className="font-sans text-xs uppercase tracking-widest text-brand-burgundy font-bold">Fit Details</h4>
                  <p className="mt-1">{product.fit}</p>
                </div>
              </div>
            )}

            {/* Care */}
            {product.careInstructions && (
              <div className="flex items-start space-x-4">
                <RefreshCw className="h-5 w-5 text-brand-olive mt-0.5" />
                <div>
                  <h4 className="font-sans text-xs uppercase tracking-widest text-brand-burgundy font-bold">Care Instructions</h4>
                  <p className="mt-1">{product.careInstructions}</p>
                </div>
              </div>
            )}

            {/* Shipping details */}
            <div className="flex items-start space-x-4">
              <Truck className="h-5 w-5 text-brand-olive mt-0.5" />
              <div>
                <h4 className="font-sans text-xs uppercase tracking-widest text-brand-burgundy font-bold">Delivery & Returns</h4>
                <p className="mt-1">Abuja Pickup (Showroom Pickup) available. Nationwide shipping across Nigeria. Returns accepted within 7 days of delivery in original, unworn condition.</p>
              </div>
            </div>

            {/* Size Guide Info Modal toggle/placeholder */}
            {product.sizeGuide && (
              <div className="border-t border-brand-burgundy/10 pt-6">
                <h4 className="font-sans text-xs uppercase tracking-widest text-brand-burgundy font-bold mb-2">Size Guide Reference</h4>
                <div className="p-3 bg-brand-burgundy/5 text-xs text-brand-burgundy/80 font-sans tracking-wide leading-relaxed">
                  {product.sizeGuide}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
