import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EditProductForm from "@/components/EditProductForm";

interface EditProductPageProps {
  params: {
    id: string;
  };
}

export const revalidate = 0; // Fetch fresh details

export default async function AdminEditProductPage({ params }: EditProductPageProps) {
  const productId = parseInt(params.id);
  if (isNaN(productId)) {
    notFound();
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      variants: true,
    },
  });

  if (!product) {
    notFound();
  }

  return <EditProductForm product={product} />;
}
