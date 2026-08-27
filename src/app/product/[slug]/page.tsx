import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductDetailClient from "@/components/ProductDetailClient";

export const revalidate = 0; // Don't cache product detail to fetch current stock live

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ProductPageProps) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
  });

  if (!product) return {};

  return {
    title: `${product.name} | Olive & Dreams`,
    description: product.description,
    openGraph: {
      title: `${product.name} | Olive & Dreams`,
      description: product.description,
      images: [
        {
          url: product.images.split(",")[0],
          alt: product.name,
        },
      ],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      variants: true,
    },
  });

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
