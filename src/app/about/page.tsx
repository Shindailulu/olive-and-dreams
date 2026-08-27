import React from "react";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export const revalidate = 0; // Fetch fresh data on page load

export default async function AboutPage() {
  // Fetch settings from database
  const aboutSetting = await prisma.aboutPageSetting.findFirst();

  const title = aboutSetting?.title || "many good things";
  const subtitle = aboutSetting?.subtitle || "Our Story";
  const image = aboutSetting?.image || "/logo-colors.jpg";
  const rawContent = aboutSetting?.content || 
    `Olive & Dreams is a contemporary Nigerian lifestyle and ready-to-wear fashion house born out of a desire for sweet, soft, and confident expression.

We believe that clothing is an intimate form of expression. Our debut collection, *Do me nice, do me jeje*, embodies a mood that is sweet and sultry, feminine and elegant. Every piece is handcrafted in Nigeria with careful attention to tailoring, draping, and finish.

We avoid excessive trends, focusing instead on sophisticated simplicity. From flowy breathable linens that withstand the Lagos sun to cowl-neck mulberry silks designed for Abuja evenings, our ready-to-wear garments exist to make you feel desirable, rich, and effortlessly beautiful.

As a lifestyle brand, we look forward to introducing other categories in the future — games, devotional booklets, and lifestyle items — always maintaining our core promise: delivering many good things to our community.`;

  // Parse paragraphs split by double newline
  const paragraphs = rawContent.split("\n\n").filter(Boolean);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      
      {/* Editorial Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="font-sans text-xs uppercase tracking-widest text-brand-olive font-bold">
          {subtitle}
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl text-brand-burgundy tracking-tight">
          {title}
        </h1>
      </div>

      {/* Brand Ethos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="relative aspect-[4/5] bg-brand-burgundy/5 overflow-hidden border border-brand-burgundy/5">
          <Image
            src={image}
            alt="Olive & Dreams Brand Concept"
            fill
            className="object-cover"
          />
        </div>

        <div className="space-y-6 text-sm font-light text-brand-charcoal/80 leading-relaxed">
          <h2 className="font-serif text-2xl text-brand-burgundy">The Philosophy</h2>
          {paragraphs.map((p, index) => (
            <p key={index}>{p}</p>
          ))}
        </div>
      </div>

    </div>
  );
}
