import React from "react";
import Link from "next/link";
import Image from "next/image";
import { getAdminClient } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";

export const revalidate = 0; // Fresh products stock status

export default async function HomePage() {
  const supabase = getAdminClient();
  const { data: rawProducts } = await supabase
    .from("products")
    .select("*, product_variants(*), product_images(*), product_categories!inner(category_id, categories!inner(name, slug))")
    .eq("status", "active")
    .eq("product_categories.categories.slug", "do-me-nice-do-me-jeje");

  const products = (rawProducts || []).map((p: any) => {
    const images = (p.product_images || [])
      .sort((a: any, b: any) => a.position - b.position)
      .map((img: any) => img.url)
      .join(",") || "/logo-colors.jpg";
    const category = p.product_categories?.[0]?.categories?.name || "Uncategorized";
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: Number(p.price),
      compareAtPrice: p.compare_at_price ? Number(p.compare_at_price) : null,
      images,
      category,
      material: p.material,
      fit: p.fit,
      careInstructions: p.care_instructions,
      sizeGuide: p.size_guide,
      variants: (p.product_variants || []).map((v: any) => ({
        id: v.id,
        size: v.size,
        color: v.color,
        stock: v.stock_quantity,
        sku: v.sku,
      })),
    };
  });

  return (
    <div className="pb-24 space-y-20 bg-brand-cream">
      {/* 1. Oh Polly Style Hero Section */}
      <section className="relative w-full h-[75vh] md:h-[85vh] flex items-center justify-center overflow-hidden bg-brand-burgundy/10">
        {/* Full-width editorial background image */}
        <div className="absolute inset-0">
          <Image
            src="/logo-dark-bg.jpg" // Dark premium background image placeholder
            alt="Olive & Dreams Collection Model Presentation"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center filter brightness-[0.7]"
          />
        </div>

        {/* Centered overlay copy */}
        <div className="relative z-10 text-center px-4 space-y-4 max-w-2xl">
          <span className="font-sans text-[10px] md:text-xs uppercase tracking-[0.25em] text-brand-cream/80 font-bold block">
            Debut Release
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-brand-cream tracking-tight leading-tight lowercase">
            many good <span className="italic font-light">things</span>
          </h1>
          <p className="font-sans text-xs md:text-sm text-brand-cream/70 leading-relaxed max-w-md mx-auto font-light">
            Designed for the confident, sophisticated woman. A sultry yet simple celebration of sweet femininity.
          </p>
          <div className="pt-6">
            <Link
              href="/shop"
              className="inline-block bg-brand-cream text-brand-burgundy text-xs uppercase tracking-[0.2em] px-8 py-3.5 font-medium hover:bg-brand-burgundy hover:text-brand-cream transition-colors duration-300 shadow-lg"
            >
              Shop Now
            </Link>
          </div>
        </div>

        {/* Top-level sub-hero announcement bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-brand-burgundy/40 backdrop-blur-xs py-2 text-center text-[10px] uppercase tracking-widest text-brand-cream">
          Free Showroom Pickup in Abuja | Nationwide Delivery
        </div>
      </section>

      {/* 2. Category Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center">
          <span className="font-sans text-xs uppercase tracking-widest text-brand-olive font-bold">Curated Categories</span>
          <h2 className="font-serif text-3xl text-brand-burgundy mt-1">Shop by Department</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: "Dresses", query: "/shop?category=Dresses", img: "/logo-colors.jpg" },
            { name: "Tops", query: "/shop?category=Tops", img: "/logo-white-bg.jpg" },
            { name: "Lifestyle", query: "/shop", img: "/logo-colors.jpg" },
            { name: "Accessories", query: "/shop", img: "/logo-white-bg.jpg" },
          ].map((cat, idx) => (
            <Link key={idx} href={cat.query} className="group relative aspect-[3/4] overflow-hidden bg-brand-burgundy/5 block">
              <Image
                src={cat.img}
                alt={`Shop ${cat.name}`}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-[0.9] group-hover:brightness-[0.8]"
              />
              <div className="absolute inset-0 flex items-end justify-center p-4 bg-gradient-to-t from-black/40 via-transparent to-transparent">
                <span className="font-sans text-xs md:text-sm uppercase tracking-widest text-brand-cream font-medium group-hover:underline">
                  {cat.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Bestsellers Showcase (Side-by-Side Editorial) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-brand-burgundy/10 pt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Large editorial layout image */}
          <div className="lg:col-span-6 relative aspect-[4/5] bg-brand-burgundy/5 overflow-hidden">
            <Image
              src="/logo-colors.jpg"
              alt="Featured Olive & Dreams Editorial Model styling"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          {/* Description Copy */}
          <div className="lg:col-span-6 space-y-6 lg:pl-8">
            <span className="font-sans text-xs uppercase tracking-widest text-brand-olive font-bold">The Edit</span>
            <h2 className="font-serif text-4xl text-brand-burgundy tracking-tight leading-snug">
              Bestsellers
            </h2>
            <p className="font-sans text-sm text-brand-charcoal/70 leading-relaxed font-light">
              Meet the ultimate Olive & Dreams icons. Crafted in Nigeria with premium textiles, our top-performing pieces are tailored for soft elegance, structured silhouettes, and daily luxury.
            </p>
            <div className="pt-2">
              <Link
                href="/shop"
                className="font-sans text-xs uppercase tracking-widest text-brand-burgundy border-b border-brand-burgundy pb-1 hover:text-brand-olive hover:border-brand-olive transition-all font-semibold"
              >
                Shop the Favorites
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Curated Product Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="border-t border-brand-burgundy/10 pt-16 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <span className="font-sans text-xs uppercase tracking-widest text-brand-olive font-bold">Trending Pieces</span>
            <h2 className="font-serif text-3xl text-brand-burgundy mt-1">Featured Items</h2>
          </div>
          <Link
            href="/shop"
            className="text-xs uppercase tracking-widest text-brand-burgundy font-semibold hover:text-brand-olive border-b border-brand-burgundy hover:border-brand-olive pb-1 transition-all"
          >
            View All Pieces
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
          {products.slice(0, 4).map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              slug={product.slug}
              image={product.images.split(",")[0]}
              category={product.category}
              variants={product.variants}
            />
          ))}
        </div>
      </section>

      {/* 5. Brand Promise Banner (Aesthetic Statement - Replaces collection-specific text) */}
      <section className="relative w-full h-[40vh] md:h-[50vh] flex items-center justify-center overflow-hidden bg-brand-burgundy/10">
        <div className="absolute inset-0">
          <Image
            src="/logo-white-bg.jpg" // Light neutral style layout
            alt="Designed for Ease & Sophistication"
            fill
            sizes="100vw"
            className="object-cover object-center filter opacity-40 brightness-95"
          />
        </div>
        
        <div className="relative z-10 text-center px-4 space-y-4 max-w-xl">
          <h2 className="font-serif text-3xl text-brand-burgundy">Designed for Ease & Sophistication</h2>
          <p className="font-sans text-xs md:text-sm text-brand-charcoal/80 leading-relaxed font-light">
            Olive & Dreams is a contemporary premium brand dedicated to soft elegance and high-quality finishes. Designed to celebrate femininity, our collections prioritize comfort, style, and meticulous tailoring.
          </p>
          <div className="flex justify-center space-x-6 pt-4 text-[10px] uppercase tracking-widest text-brand-burgundy font-bold">
            <span>Abuja Pickup</span>
            <span>•</span>
            <span>Nationwide Shipping</span>
            <span>•</span>
            <span>Secure Transactions</span>
          </div>
        </div>
      </section>
    </div>
  );
}
