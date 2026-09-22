import React from "react";
import { notFound } from "next/navigation";
import { getAdminClient } from "@/lib/supabase";
import EditProductForm from "@/components/EditProductForm";

interface EditProductPageProps {
  params: {
    id: string;
  };
}

export const revalidate = 0; // Fetch fresh details

export default async function AdminEditProductPage({ params }: EditProductPageProps) {
  const productId = params.id;

  const supabase = getAdminClient();
  const { data } = await supabase
    .from("products")
    .select("*, product_variants(*)")
    .eq("id", productId)
    .single();

  const p = data as any;

  if (!p) {
    notFound();
    return;
  }

  const product = {
    ...p,
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: Number(p.price),
    compareAtPrice: p.compare_at_price ? Number(p.compare_at_price) : null,
    material: p.material,
    fit: p.fit,
    careInstructions: p.care_instructions,
    sizeGuide: p.size_guide,
    variants: (p.product_variants || []).map((v: any) => ({
      ...v,
      stock: v.stock_quantity,
    })),
  };

  return <EditProductForm product={product} />;
}
