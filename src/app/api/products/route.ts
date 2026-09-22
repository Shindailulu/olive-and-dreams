import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      slug,
      description,
      category,
      price,
      compareAtPrice,
      images,
      material,
      fit,
      careInstructions,
      sizeGuide,
      status,
      variants, // array of { size, color, stock, sku }
    } = body;

    if (!name || !slug || !description || !price || !variants || variants.length === 0) {
      return NextResponse.json({ error: "Missing required product fields" }, { status: 400 });
    }

    const supabase = getAdminClient();

    const { data: existingProduct } = await supabase
      .from("products")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existingProduct) {
      return NextResponse.json({ error: "Product slug already exists" }, { status: 409 });
    }

    // Insert product
    const { data: newProduct, error: productError } = await supabase
      .from("products")
      .insert({
        name,
        slug,
        description,
        price,
        compare_at_price: compareAtPrice,
        sku: body.sku || variants[0]?.sku || "",
        status: status === "PUBLISHED" ? "active" : "draft",
        material,
        fit,
        care_instructions: careInstructions,
        size_guide: sizeGuide,
      })
      .select()
      .single();

    if (productError || !newProduct) {
      throw productError || new Error("Failed to insert product");
    }

    // Insert variants
    if (variants && variants.length > 0) {
      await supabase.from("product_variants").insert(
        variants.map((v: any) => ({
          product_id: newProduct.id,
          size: v.size,
          color: v.color,
          stock_quantity: v.stock,
          sku: v.sku,
        }))
      );
    }

    // Insert images
    if (images) {
      const imageArray = images.split(",").map((url: string, i: number) => ({
        product_id: newProduct.id,
        url: url.trim(),
        position: i + 1,
      }));
      if (imageArray.length > 0) {
        await supabase.from("product_images").insert(imageArray);
      }
    }

    // Insert category
    if (category) {
      const categorySlug = category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      let { data: catRecord } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", categorySlug)
        .maybeSingle();

      if (!catRecord) {
        const { data: newCat } = await supabase
          .from("categories")
          .insert({ name: category, slug: categorySlug })
          .select("id")
          .single();
        catRecord = newCat;
      }

      if (catRecord) {
        await supabase.from("product_categories").insert({
          product_id: newProduct.id,
          category_id: catRecord.id,
        });
      }
    }

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error: any) {
    console.error("Create Product API Error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const {
      id,
      name,
      slug,
      description,
      category,
      price,
      images,
      material,
      fit,
      careInstructions,
      sizeGuide,
      status,
      variants,
    } = body;

    if (!id || !name || !slug || !description || !price || !variants || variants.length === 0) {
      return NextResponse.json({ error: "Missing required product fields" }, { status: 400 });
    }

    const supabase = getAdminClient();

    const { data: existingProduct } = await supabase
      .from("products")
      .select("id")
      .eq("slug", slug)
      .neq("id", id)
      .maybeSingle();

    if (existingProduct) {
      return NextResponse.json({ error: "Product slug already exists on another product" }, { status: 409 });
    }

    // Delete old variants
    await supabase.from("product_variants").delete().eq("product_id", id);

    // Update product
    const { data: updatedProduct, error: updateError } = await supabase
      .from("products")
      .update({
        name,
        slug,
        description,
        price,
        compare_at_price: null,
        sku: body.sku || variants[0]?.sku || "",
        status: status === "PUBLISHED" ? "active" : "draft",
        material,
        fit,
        care_instructions: careInstructions,
        size_guide: sizeGuide,
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError || !updatedProduct) {
      throw updateError || new Error("Failed to update product");
    }

    // Insert new variants
    await supabase.from("product_variants").insert(
      variants.map((v: any) => ({
        product_id: id,
        size: v.size,
        color: v.color,
        stock_quantity: v.stock,
        sku: v.sku,
      }))
    );

    // Update images
    if (images) {
      await supabase.from("product_images").delete().eq("product_id", id);
      const imageArray = images.split(",").map((url: string, i: number) => ({
        product_id: id,
        url: url.trim(),
        position: i + 1,
      }));
      if (imageArray.length > 0) {
        await supabase.from("product_images").insert(imageArray);
      }
    }

    // Update category
    if (category) {
      await supabase.from("product_categories").delete().eq("product_id", id);
      const categorySlug = category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      let { data: catRecord } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", categorySlug)
        .maybeSingle();

      if (!catRecord) {
        const { data: newCat } = await supabase
          .from("categories")
          .insert({ name: category, slug: categorySlug })
          .select("id")
          .single();
        catRecord = newCat;
      }

      if (catRecord) {
        await supabase.from("product_categories").insert({
          product_id: id,
          category_id: catRecord.id,
        });
      }
    }

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error: any) {
    console.error("Update Product API Error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}
