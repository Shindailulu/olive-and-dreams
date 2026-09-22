import React from "react";
import Link from "next/link";
import { getAdminClient } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";

export const revalidate = 0;

interface SearchPageProps {
  searchParams: {
    q?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || "";

  let products: any[] = [];

  if (query.trim()) {
    const supabase = getAdminClient();
    const { data: rawProducts } = await supabase
      .from("products")
      .select("*, product_variants(*), product_images(*), product_categories(categories(name))")
      .eq("status", "active")
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,material.ilike.%${query}%`);
      
    if (rawProducts) {
      products = rawProducts.map((p: any) => {
        const images = (p.product_images || [])
          .sort((a: any, b: any) => a.position - b.position)
          .map((img: any) => img.url)
          .join(",") || "/logo-colors.jpg";
        const category = p.product_categories?.[0]?.categories?.name || "Uncategorized";
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: Number(p.price),
          images,
          category,
          variants: (p.product_variants || []).map((v: any) => ({
            id: v.id,
            size: v.size,
            color: v.color,
            stock: v.stock_quantity,
          })),
        };
      });
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="border-b border-brand-burgundy/10 pb-6 mb-12">
        <span className="text-xs uppercase tracking-widest text-brand-olive font-bold">Search Results</span>
        <h1 className="font-serif text-3xl text-brand-burgundy mt-2">
          {query ? `Showing results for “${query}”` : "Search our collection"}
        </h1>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12">
          {products.map((product) => (
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
      ) : (
        <div className="max-w-md mx-auto text-center py-20">
          <p className="font-serif text-lg text-brand-burgundy">No pieces found for your search.</p>
          <p className="font-sans text-sm text-brand-charcoal/60 mt-2 font-light">
            We couldn&apos;t find anything matching your term. Check your spelling or explore our catalog.
          </p>
          <div className="pt-8">
            <Link
              href="/shop"
              className="inline-block bg-brand-burgundy text-brand-cream text-xs uppercase tracking-widest px-8 py-4 font-medium hover:bg-brand-burgundy/90 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
