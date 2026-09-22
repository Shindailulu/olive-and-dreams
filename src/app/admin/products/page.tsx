import React from "react";
import { getAdminClient } from "@/lib/supabase";
import { formatNaira } from "@/lib/utils";
import Link from "next/link";
import { Plus, Box } from "lucide-react";
import ProductActionsDropdown from "@/components/ProductActionsDropdown";

export const revalidate = 0;

interface AdminProductsPageProps {
  searchParams: {
    tab?: string;
  };
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const currentTab = searchParams.tab === "drafts" ? "drafts" : "published";

  const supabase = getAdminClient();

  // Fetch products
  const { data } = await supabase
    .from("products")
    .select("*, product_variants(*), product_categories(categories(name))")
    .order("created_at", { ascending: false });

  const allProducts = (data || []) as any[];

  const publishedProducts = allProducts.filter((p) => p.status === "active");
  const draftProducts = allProducts.filter((p) => p.status === "draft");

  const displayProducts = currentTab === "drafts" ? draftProducts : publishedProducts;


  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl text-brand-burgundy">Products</h1>
          <p className="font-sans text-xs uppercase tracking-widest text-brand-charcoal/50 mt-1">
            Manage your boutique inventory
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center space-x-2 bg-brand-burgundy text-brand-cream text-xs uppercase tracking-widest px-5 py-3 font-medium hover:bg-brand-burgundy/90 transition-colors shadow-sm self-start"
        >
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-brand-burgundy/10">
        <Link
          href="/admin/products?tab=published"
          className={`px-6 py-3 text-xs uppercase tracking-widest font-semibold border-b-2 transition-all ${
            currentTab === "published"
              ? "border-brand-burgundy text-brand-burgundy font-bold"
              : "border-transparent text-brand-charcoal/50 hover:text-brand-charcoal"
          }`}
        >
          Published ({publishedProducts.length})
        </Link>
        <Link
          href="/admin/products?tab=drafts"
          className={`px-6 py-3 text-xs uppercase tracking-widest font-semibold border-b-2 transition-all ${
            currentTab === "drafts"
              ? "border-brand-burgundy text-brand-burgundy font-bold"
              : "border-transparent text-brand-charcoal/50 hover:text-brand-charcoal"
          }`}
        >
          Drafts ({draftProducts.length})
        </Link>
      </div>

      {/* Table Card */}
      <div className="bg-brand-cream border border-brand-burgundy/10 shadow-sm p-6 overflow-x-auto">
        {displayProducts.length > 0 ? (
          <table className="w-full text-left text-sm font-light">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-brand-charcoal/50 border-b border-brand-burgundy/10 pb-2">
                <th className="pb-3 font-bold">Product</th>
                <th className="pb-3 font-bold">Category</th>
                <th className="pb-3 font-bold">Price</th>
                <th className="pb-3 font-bold">Total Stock</th>
                <th className="pb-3 font-bold">Status</th>
                <th className="pb-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-burgundy/5">
              {displayProducts.map((product) => {
                const totalStock = (product.product_variants || []).reduce((sum: number, v: any) => sum + v.stock_quantity, 0);
                const categoryName = product.product_categories?.[0]?.categories?.name || 'Uncategorized';
                return (
                  <tr key={product.id} className="hover:bg-brand-burgundy/5 transition-colors">
                    <td className="py-4">
                      <div>
                        <Link href={`/product/${product.slug}`} target="_blank" className="font-serif text-base text-brand-burgundy hover:underline">
                          {product.name}
                        </Link>
                        <span className="text-[10px] text-brand-charcoal/50 block font-sans tracking-wide mt-0.5">
                          {product.slug}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-brand-charcoal/80 uppercase text-xs tracking-wider">{categoryName}</td>
                    <td className="py-4 font-sans font-medium">{formatNaira(Number(product.price))}</td>
                    <td className="py-4 font-sans">
                      <span className={totalStock === 0 ? "text-brand-burgundy font-semibold" : "text-brand-charcoal"}>
                        {totalStock} pcs
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-semibold ${product.status === "active" ? "bg-brand-olive/15 text-brand-olive" : "bg-brand-burgundy/10 text-brand-burgundy"}`}>
                        {product.status === "active" ? "PUBLISHED" : "DRAFT"}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end items-center">
                        <ProductActionsDropdown
                          productId={product.id}
                          productName={product.name}
                          status={product.status === "active" ? "PUBLISHED" : "DRAFT"}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16">
            <Box className="h-10 w-10 text-brand-burgundy/40 mx-auto mb-4" />
            <h2 className="font-serif text-lg text-brand-burgundy">
              {currentTab === "drafts" ? "No draft products." : "No products in catalog."}
            </h2>
            <p className="font-sans text-sm text-brand-charcoal/60 mt-1 font-light">
              {currentTab === "drafts"
                ? "Draft products will appear here until published."
                : "Add your first piece to make it visible on the storefront."}
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
