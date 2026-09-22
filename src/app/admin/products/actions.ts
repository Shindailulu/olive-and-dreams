"use server";

import { getAdminClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function handleDeleteProduct(formData: FormData) {
  const productId = formData.get("productId") as string;
  if (!productId) return;
  const supabase = getAdminClient();
  
  try {
    // Delete variants first (cascade), then product
    await supabase.from('product_variants').delete().eq('product_id', productId);
    await supabase.from('product_images').delete().eq('product_id', productId);
    await supabase.from('product_categories').delete().eq('product_id', productId);
    await supabase.from('products').delete().eq('id', productId);
    revalidatePath('/admin/products');
    revalidatePath('/shop');
    revalidatePath('/');
  } catch (err) {
    console.error("Delete product error:", err);
  }
}

export async function handlePublishProduct(formData: FormData) {
  const productId = formData.get("productId") as string;
  if (!productId) return;
  const supabase = getAdminClient();
  
  try {
    await supabase.from('products').update({ status: 'active' }).eq('id', productId);
    revalidatePath('/admin/products');
    revalidatePath('/shop');
    revalidatePath('/');
  } catch (err) {
    console.error("Publish product error:", err);
  }
}
