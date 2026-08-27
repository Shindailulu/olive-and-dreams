const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Seed Delivery Settings
  console.log("Seeding delivery settings...");
  await prisma.deliverySetting.upsert({
    where: { method: "ABUJA_PICKUP" },
    update: {},
    create: {
      method: "ABUJA_PICKUP",
      enabled: true,
      fee: 0,
      instructions: "Pickup available from our Abuja showroom: Suite 12, Olive Plaza, Wuse II, Abuja. Open Mon-Sat, 9AM - 6PM.",
      locationDetails: "Wuse II Showroom, Abuja",
    },
  });

  await prisma.deliverySetting.upsert({
    where: { method: "NATIONWIDE" },
    update: {},
    create: {
      method: "NATIONWIDE",
      enabled: true,
      fee: 4500,
      instructions: "Delivery to your doorstep across Nigeria. Shipping takes 2-4 business days in Lagos & Abuja, and 3-7 days for other states.",
    },
  });

  // 2. Seed Default Admin User
  console.log("Seeding admin user...");
  const adminEmail = process.env.ADMIN_EMAIL || "admin@oliveanddreams.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin_dreams_2026";
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
    },
    create: {
      email: adminEmail,
      name: "Olive & Dreams Admin",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  // 3. Seed Collection
  console.log("Seeding collections...");
  const collection = await prisma.collection.upsert({
    where: { slug: "do-me-nice-do-me-jeje" },
    update: {},
    create: {
      name: "Do me nice, do me jeje",
      slug: "do-me-nice-do-me-jeje",
      description: "Our debut ready-to-wear collection. Feminine silhouettes, rich fabrics, and effortless elegance for the modern Nigerian woman.",
      image: "/logo-colors.jpg",
      status: "PUBLISHED",
    },
  });

  // 4. Seed Products
  console.log("Seeding products...");
  
  // Product 1: Jeje Linen Midi Dress
  const p1 = await prisma.product.upsert({
    where: { slug: "jeje-linen-midi-dress" },
    update: {},
    create: {
      name: "Jeje Linen Midi Dress",
      slug: "jeje-linen-midi-dress",
      description: "An elegant, flowy midi dress crafted from premium breathable linen. Designed to bring ease, comfort, and sophisticated style to warm sunny days. Features a soft back tie closure and dynamic side slits.",
      category: "Dresses",
      collectionId: collection.id,
      price: 45000,
      compareAtPrice: 50000,
      images: "/logo-colors.jpg", // Using logo color asset as temporary placeholder
      material: "100% Premium African Linen",
      fit: "Relaxed flowy silhouette, fits true to size.",
      careInstructions: "Hand wash cold or dry clean. Warm iron on reverse side.",
      sizeGuide: "XS: Bust 32, Waist 25 | S: Bust 34, Waist 27 | M: Bust 36, Waist 29 | L: Bust 39, Waist 32 | XL: Bust 42, Waist 35",
      status: "PUBLISHED",
    },
  });

  // Product 1 Variants
  await prisma.productVariant.deleteMany({ where: { productId: p1.id } });
  await prisma.productVariant.createMany({
    data: [
      { productId: p1.id, size: "S", color: "Olive", stock: 10, sku: "JLM-OLV-S" },
      { productId: p1.id, size: "M", color: "Olive", stock: 8, sku: "JLM-OLV-M" },
      { productId: p1.id, size: "L", color: "Olive", stock: 3, sku: "JLM-OLV-L" },
      { productId: p1.id, size: "S", color: "Wine", stock: 5, sku: "JLM-WNE-S" },
      { productId: p1.id, size: "M", color: "Wine", stock: 2, sku: "JLM-WNE-M" },
      { productId: p1.id, size: "L", color: "Wine", stock: 0, sku: "JLM-WNE-L" }, // Out of stock variant
    ],
  });

  // Product 2: Do Me Nice Silk Slip Dress
  const p2 = await prisma.product.upsert({
    where: { slug: "do-me-nice-silk-slip-dress" },
    update: {},
    create: {
      name: "Do Me Nice Silk Slip Dress",
      slug: "do-me-nice-silk-slip-dress",
      description: "A sultry, sophisticated slip dress with a cowl neckline and adjustable cross-back straps. Crafted from lightweight, premium silk satin that skims the body beautifully.",
      category: "Dresses",
      collectionId: collection.id,
      price: 55000,
      images: "/logo-colors.jpg",
      material: "100% Premium Mulberry Silk Satin",
      fit: "Slim-fit bias cut, hugs curves gently. Model is wearing size S.",
      careInstructions: "Dry clean only. Do not bleach. Steam iron on low heat.",
      sizeGuide: "XS: Bust 32, Waist 25 | S: Bust 34, Waist 27 | M: Bust 36, Waist 29 | L: Bust 39, Waist 32 | XL: Bust 42, Waist 35",
      status: "PUBLISHED",
    },
  });

  // Product 2 Variants
  await prisma.productVariant.deleteMany({ where: { productId: p2.id } });
  await prisma.productVariant.createMany({
    data: [
      { productId: p2.id, size: "S", color: "Wine", stock: 4, sku: "DMS-WNE-S" },
      { productId: p2.id, size: "M", color: "Wine", stock: 6, sku: "DMS-WNE-M" },
      { productId: p2.id, size: "L", color: "Wine", stock: 2, sku: "DMS-WNE-L" },
      { productId: p2.id, size: "S", color: "Charcoal", stock: 3, sku: "DMS-CHR-S" },
      { productId: p2.id, size: "M", color: "Charcoal", stock: 0, sku: "DMS-CHR-M" }, // Out of stock variant
      { productId: p2.id, size: "L", color: "Charcoal", stock: 5, sku: "DMS-CHR-L" },
    ],
  });

  // Product 3: Jeje Asymmetric Wrap Top
  const p3 = await prisma.product.upsert({
    where: { slug: "jeje-asymmetric-wrap-top" },
    update: {},
    create: {
      name: "Jeje Asymmetric Wrap Top",
      slug: "jeje-asymmetric-wrap-top",
      description: "A gorgeous asymmetric wrap top featuring a statement side bow. Crafted from structured cotton poplin, this piece transitions seamlessly from daytime sophistication to evening elegance.",
      category: "Tops",
      collectionId: collection.id,
      price: 25000,
      images: "/logo-colors.jpg",
      material: "97% Cotton, 3% Elastane",
      fit: "Structured stretch fit, fully adjustable wrap enclosure.",
      careInstructions: "Machine wash cold with similar colors. Warm iron.",
      sizeGuide: "XS: Bust 32 | S: Bust 34 | M: Bust 36 | L: Bust 39 | XL: Bust 42",
      status: "PUBLISHED",
    },
  });

  // Product 3 Variants
  await prisma.productVariant.deleteMany({ where: { productId: p3.id } });
  await prisma.productVariant.createMany({
    data: [
      { productId: p3.id, size: "S", color: "Olive", stock: 12, sku: "JAW-OLV-S" },
      { productId: p3.id, size: "M", color: "Olive", stock: 15, sku: "JAW-OLV-M" },
      { productId: p3.id, size: "L", color: "Olive", stock: 7, sku: "JAW-OLV-L" },
      { productId: p3.id, size: "S", color: "Mustard", stock: 8, sku: "JAW-MST-S" },
      { productId: p3.id, size: "M", color: "Mustard", stock: 10, sku: "JAW-MST-M" },
      { productId: p3.id, size: "L", color: "Mustard", stock: 4, sku: "JAW-MST-L" },
    ],
  });

  // Product 4: Sultry Sweet Corset Top
  const p4 = await prisma.product.upsert({
    where: { slug: "sultry-sweet-corset-top" },
    update: {},
    create: {
      name: "Sultry Sweet Corset Top",
      slug: "sultry-sweet-corset-top",
      description: "A sweet, structured corset top with delicate shoulder ties. Built with a supportive boned bodice and finalized with a beautiful criss-cross ribbon back enclosure.",
      category: "Tops",
      collectionId: collection.id,
      price: 30000,
      images: "/logo-colors.jpg",
      material: "100% Cotton Jacquard with Satin lining",
      fit: "Tight corseted fit. We recommend sizing up if between sizes.",
      careInstructions: "Dry clean recommended. Gentle hand wash cold only.",
      sizeGuide: "XS: Bust 32 | S: Bust 34 | M: Bust 36 | L: Bust 39 | XL: Bust 42",
      status: "PUBLISHED",
    },
  });

  // Product 4 Variants
  await prisma.productVariant.deleteMany({ where: { productId: p4.id } });
  await prisma.productVariant.createMany({
    data: [
      { productId: p4.id, size: "S", color: "Mustard", stock: 5, sku: "SSC-MST-S" },
      { productId: p4.id, size: "M", color: "Mustard", stock: 4, sku: "SSC-MST-M" },
      { productId: p4.id, size: "L", color: "Mustard", stock: 2, sku: "SSC-MST-L" },
      { productId: p4.id, size: "S", color: "Charcoal", stock: 6, sku: "SSC-CHR-S" },
      { productId: p4.id, size: "M", color: "Charcoal", stock: 3, sku: "SSC-CHR-M" },
      { productId: p4.id, size: "L", color: "Charcoal", stock: 1, sku: "SSC-CHR-L" },
    ],
  });

  // 5. Seed About Page Content
  console.log("Seeding about page settings...");
  await prisma.aboutPageSetting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      title: "many good things",
      subtitle: "Our Story",
      content: `Olive & Dreams is a contemporary Nigerian lifestyle and ready-to-wear fashion house born out of a desire for sweet, soft, and confident expression.

We believe that clothing is an intimate form of expression. Our debut collection, *Do me nice, do me jeje*, embodies a mood that is sweet and sultry, feminine and elegant. Every piece is handcrafted in Nigeria with careful attention to tailoring, draping, and finish.

We avoid excessive trends, focusing instead on sophisticated simplicity. From flowy breathable linens that withstand the Lagos sun to cowl-neck mulberry silks designed for Abuja evenings, our ready-to-wear garments exist to make you feel desirable, rich, and effortlessly beautiful.

As a lifestyle brand, we look forward to introducing other categories in the future — games, devotional booklets, and lifestyle items — always maintaining our core promise: delivering many good things to our community.`,
      image: "/logo-colors.jpg",
    },
  });

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
