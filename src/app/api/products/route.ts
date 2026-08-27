import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    });

    if (existingProduct) {
      return NextResponse.json({ error: "Product slug already exists" }, { status: 409 });
    }

    // Create Product and variants inside transaction
    const newProduct = await prisma.$transaction(async (tx) => {
      return await tx.product.create({
        data: {
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
          variants: {
            create: variants.map((v: any) => ({
              size: v.size,
              color: v.color,
              stock: v.stock,
              sku: v.sku,
            })),
          },
        },
      });
    });

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

    const existingProduct = await prisma.product.findFirst({
      where: {
        slug,
        id: { not: id },
      },
    });

    if (existingProduct) {
      return NextResponse.json({ error: "Product slug already exists on another product" }, { status: 409 });
    }

    const updatedProduct = await prisma.$transaction(async (tx) => {
      // Delete existing variants
      await tx.productVariant.deleteMany({
        where: { productId: id },
      });

      // Update product details and create new variants
      return await tx.product.update({
        where: { id },
        data: {
          name,
          slug,
          description,
          category,
          price,
          compareAtPrice: null, // compareAtPrice is removed
          images,
          material,
          fit,
          careInstructions,
          sizeGuide,
          status,
          variants: {
            create: variants.map((v: any) => ({
              size: v.size,
              color: v.color,
              stock: v.stock,
              sku: v.sku,
            })),
          },
        },
      });
    });

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error: any) {
    console.error("Update Product API Error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}
