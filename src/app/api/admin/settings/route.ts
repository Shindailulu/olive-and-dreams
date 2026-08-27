import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const settings = await prisma.deliverySetting.findMany();
    const about = await prisma.aboutPageSetting.findFirst();
    return NextResponse.json({ settings, about });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      abujaEnabled,
      abujaFee,
      abujaInstructions,
      nationwideEnabled,
      nationwideFee,
      nationwideInstructions,
      aboutTitle,
      aboutSubtitle,
      aboutContent,
      aboutImage,
    } = await req.json();

    await prisma.$transaction([
      prisma.deliverySetting.upsert({
        where: { method: "ABUJA_PICKUP" },
        update: {
          enabled: abujaEnabled,
          fee: abujaFee,
          instructions: abujaInstructions,
        },
        create: {
          method: "ABUJA_PICKUP",
          enabled: abujaEnabled,
          fee: abujaFee,
          instructions: abujaInstructions,
        },
      }),
      prisma.deliverySetting.upsert({
        where: { method: "NATIONWIDE" },
        update: {
          enabled: nationwideEnabled,
          fee: nationwideFee,
          instructions: nationwideInstructions,
        },
        create: {
          method: "NATIONWIDE",
          enabled: nationwideEnabled,
          fee: nationwideFee,
          instructions: nationwideInstructions,
        },
      }),
      prisma.aboutPageSetting.upsert({
        where: { id: 1 },
        update: {
          title: aboutTitle,
          subtitle: aboutSubtitle,
          content: aboutContent,
          image: aboutImage,
        },
        create: {
          id: 1,
          title: aboutTitle,
          subtitle: aboutSubtitle,
          content: aboutContent,
          image: aboutImage,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Save Settings Error:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
