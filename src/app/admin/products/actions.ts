"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function handleDeleteProduct(formData: FormData) {
  const productIdStr = formData.get("productId") as string;
  if (!productIdStr) return;
  
  const productId = parseInt(productIdStr);
  
  try {
    // Deletes cascadingly due to Prisma schema setup
    await prisma.product.delete({
      where: { id: productId },
    });
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/");
  } catch (err) {
    console.error("Delete product error:", err);
  }
}

export async function handlePublishProduct(formData: FormData) {
  const productIdStr = formData.get("productId") as string;
  if (!productIdStr) return;
  
  const productId = parseInt(productIdStr);
  
  try {
    await prisma.product.update({
      where: { id: productId },
      data: { status: "PUBLISHED" },
    });
    revalidatePath("/admin/products");
    revalidatePath("/shop");
    revalidatePath("/");
  } catch (err) {
    console.error("Publish product error:", err);
  }
}
