import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import { formatNaira } from "@/lib/utils";

export const revalidate = 0;

interface ShopPageProps {
  searchParams: {
    category?: string;
    size?: string;
    color?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const category = searchParams.category || "all";
  const size = searchParams.size || "";
  const color = searchParams.color || "";
  const sort = searchParams.sort || "featured";
  const minPrice = parseFloat(searchParams.minPrice || "0");
  const maxPrice = parseFloat(searchParams.maxPrice || "200000");

  // Build Prisma Where Clause
  const whereClause: any = {
    status: "PUBLISHED",
    price: {
      gte: minPrice,
      lte: maxPrice,
    },
  };

  if (category !== "all") {
    whereClause.category = category;
  }

  // Filter by size and/or color inside variants
  if (size || color) {
    const variantFilter: any = {};
    if (size) variantFilter.size = size;
    if (color) variantFilter.color = color;
    
    whereClause.variants = {
      some: variantFilter,
    };
  }

  // Build Prisma Order By Clause
  let orderByClause: any = { createdAt: "desc" }; // default newest
  if (sort === "price-asc") {
    orderByClause = { price: "asc" };
  } else if (sort === "price-desc") {
    orderByClause = { price: "desc" };
  } else if (sort === "featured") {
    orderByClause = { id: "asc" };
  }

  // Fetch products
  const products = await prisma.product.findMany({
    where: whereClause,
    orderBy: orderByClause,
    include: {
      variants: true,
    },
  });

  // Extract unique sizes and colors for filter sidebar
  const allVariants = await prisma.productVariant.findMany({
    select: { size: true, color: true },
  });
  const uniqueSizes = Array.from(new Set(allVariants.map((v) => v.size)));
  const uniqueColors = Array.from(new Set(allVariants.map((v) => v.color)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="border-b border-brand-burgundy/10 pb-8 mb-8 text-center sm:text-left">
        <h1 className="font-serif text-4xl text-brand-burgundy">Shop the Pieces</h1>
        <p className="font-sans text-sm text-brand-charcoal/60 mt-2 font-light">
          Browse our modern feminine ready-to-wear clothing
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* FILTERS SIDEBAR */}
        <aside className="lg:col-span-3 space-y-8">
          
          {/* Category Filter */}
          <div className="space-y-3">
            <h3 className="font-sans text-xs uppercase tracking-widest text-brand-burgundy font-bold">Category</h3>
            <div className="flex flex-col space-y-2 text-sm font-light">
              <Link
                href={{ query: { ...searchParams, category: "all" } }}
                className={`hover:text-brand-olive transition-colors ${category === "all" ? "text-brand-burgundy font-medium" : "text-brand-charcoal/70"}`}
              >
                All Pieces
              </Link>
              <Link
                href={{ query: { ...searchParams, category: "Dresses" } }}
                className={`hover:text-brand-olive transition-colors ${category === "Dresses" ? "text-brand-burgundy font-medium" : "text-brand-charcoal/70"}`}
              >
                Dresses
              </Link>
              <Link
                href={{ query: { ...searchParams, category: "Tops" } }}
                className={`hover:text-brand-olive transition-colors ${category === "Tops" ? "text-brand-burgundy font-medium" : "text-brand-charcoal/70"}`}
              >
                Tops
              </Link>
            </div>
          </div>

          {/* Size Filter */}
          <div className="space-y-3">
            <h3 className="font-sans text-xs uppercase tracking-widest text-brand-burgundy font-bold">Size</h3>
            <div className="flex flex-wrap gap-2">
              <Link
                href={{ query: { ...searchParams, size: "" } }}
                className={`text-xs px-3 py-1.5 border tracking-wider transition-colors ${!size ? "border-brand-burgundy bg-brand-burgundy text-brand-cream" : "border-brand-burgundy/20 hover:border-brand-burgundy text-brand-charcoal/70"}`}
              >
                ALL
              </Link>
              {uniqueSizes.map((s) => (
                <Link
                  key={s}
                  href={{ query: { ...searchParams, size: s } }}
                  className={`text-xs px-3 py-1.5 border tracking-wider transition-colors ${size === s ? "border-brand-burgundy bg-brand-burgundy text-brand-cream" : "border-brand-burgundy/20 hover:border-brand-burgundy text-brand-charcoal/70"}`}
                >
                  {s}
                </Link>
              ))}
            </div>
          </div>

          {/* Color Filter */}
          <div className="space-y-3">
            <h3 className="font-sans text-xs uppercase tracking-widest text-brand-burgundy font-bold">Color</h3>
            <div className="flex flex-wrap gap-2">
              <Link
                href={{ query: { ...searchParams, color: "" } }}
                className={`text-xs px-3 py-1.5 border tracking-wider transition-colors ${!color ? "border-brand-burgundy bg-brand-burgundy text-brand-cream" : "border-brand-burgundy/20 hover:border-brand-burgundy text-brand-charcoal/70"}`}
              >
                ALL
              </Link>
              {uniqueColors.map((c) => (
                <Link
                  key={c}
                  href={{ query: { ...searchParams, color: c } }}
                  className={`text-xs px-3 py-1.5 border tracking-wider transition-colors ${color === c ? "border-brand-burgundy bg-brand-burgundy text-brand-cream" : "border-brand-burgundy/20 hover:border-brand-burgundy text-brand-charcoal/70"}`}
                >
                  {c}
                </Link>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3">
            <h3 className="font-sans text-xs uppercase tracking-widest text-brand-burgundy font-bold">Price</h3>
            <div className="flex flex-col space-y-2 text-sm font-light text-brand-charcoal/70">
              <Link
                href={{ query: { ...searchParams, minPrice: "0", maxPrice: "30000" } }}
                className={`hover:text-brand-olive transition-colors ${maxPrice === 30000 ? "text-brand-burgundy font-medium" : ""}`}
              >
                Under {formatNaira(30000)}
              </Link>
              <Link
                href={{ query: { ...searchParams, minPrice: "30000", maxPrice: "50000" } }}
                className={`hover:text-brand-olive transition-colors ${minPrice === 30000 && maxPrice === 50000 ? "text-brand-burgundy font-medium" : ""}`}
              >
                {formatNaira(30000)} - {formatNaira(50000)}
              </Link>
              <Link
                href={{ query: { ...searchParams, minPrice: "50000", maxPrice: "200000" } }}
                className={`hover:text-brand-olive transition-colors ${minPrice === 50000 ? "text-brand-burgundy font-medium" : ""}`}
              >
                Above {formatNaira(50000)}
              </Link>
              {(minPrice > 0 || maxPrice < 200000) && (
                <Link
                  href={{ query: { ...searchParams, minPrice: "0", maxPrice: "200000" } }}
                  className="text-xs text-brand-burgundy underline hover:text-brand-olive pt-2"
                >
                  Reset Price Filter
                </Link>
              )}
            </div>
          </div>
        </aside>

        {/* PRODUCTS CATALOG SECTION */}
        <main className="lg:col-span-9 space-y-6">
          {/* Catalog header controls */}
          <div className="flex items-center justify-between text-xs tracking-wider uppercase text-brand-charcoal/50 border-b border-brand-burgundy/5 pb-4">
            <p>{products.length} Pieces Found</p>
            
            {/* Sorting control */}
            <div className="flex items-center space-x-2">
              <span>Sort By:</span>
              <div className="flex space-x-3 text-brand-burgundy font-medium">
                <Link
                  href={{ query: { ...searchParams, sort: "featured" } }}
                  className={sort === "featured" ? "underline" : "hover:text-brand-olive"}
                >
                  Featured
                </Link>
                <Link
                  href={{ query: { ...searchParams, sort: "newest" } }}
                  className={sort === "newest" ? "underline" : "hover:text-brand-olive"}
                >
                  Newest
                </Link>
                <Link
                  href={{ query: { ...searchParams, sort: "price-asc" } }}
                  className={sort === "price-asc" ? "underline" : "hover:text-brand-olive"}
                >
                  ₦: Low to High
                </Link>
                <Link
                  href={{ query: { ...searchParams, sort: "price-desc" } }}
                  className={sort === "price-desc" ? "underline" : "hover:text-brand-olive"}
                >
                  ₦: High to Low
                </Link>
              </div>
            </div>
          </div>

          {/* Products list grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-12">
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
            <div className="text-center py-20 bg-brand-burgundy/5 rounded-lg">
              <h2 className="font-serif text-xl text-brand-burgundy">No pieces found matching your selections.</h2>
              <p className="font-sans text-sm text-brand-charcoal/60 mt-2 font-light">Try adjusting your filters or continue shopping.</p>
              <Link
                href="/shop"
                className="inline-block bg-brand-burgundy text-brand-cream text-xs uppercase tracking-widest px-6 py-3 mt-6 hover:bg-brand-burgundy/90 transition-colors"
              >
                Clear All Filters
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
