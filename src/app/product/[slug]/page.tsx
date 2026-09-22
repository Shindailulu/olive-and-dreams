import { notFound } from "next/navigation";
import { getAdminClient } from "@/lib/supabase";
import ProductDetailClient from "@/components/ProductDetailClient";

export const revalidate = 0; // Don't cache product detail to fetch current stock live

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ProductPageProps) {
  const supabase = getAdminClient();
  const { data: product } = await supabase
    .from("products")
    .select("name, description, product_images(url, position)")
    .eq("slug", params.slug)
    .single();

  if (!product) return {};

  const images = (product.product_images || [])
      .sort((a: any, b: any) => a.position - b.position)
      .map((img: any) => img.url);

  return {
    title: `${product.name} | Olive & Dreams`,
    description: product.description,
    openGraph: {
      title: `${product.name} | Olive & Dreams`,
      description: product.description,
      images: [
        {
          url: images[0] || "/logo-colors.jpg",
          alt: product.name,
        },
      ],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const supabase = getAdminClient();
  const { data } = await supabase
    .from("products")
    .select("*, product_variants(*), product_images(*), product_categories(categories(name))")
    .eq("slug", params.slug)
    .single();

  const p = data as any;

  if (!p) {
    notFound();
    return;
  }

  const images = (p.product_images || [])
    .sort((a: any, b: any) => a.position - b.position)
    .map((img: any) => img.url)
    .join(",") || "/logo-colors.jpg";
  const category = p.product_categories?.[0]?.categories?.name || "Uncategorized";
  
  const product = {
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

  return <ProductDetailClient product={product} />;
}
