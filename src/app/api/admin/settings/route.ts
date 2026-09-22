import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const supabase = getAdminClient();
    const { data: settings } = await supabase.from("delivery_methods").select("*");

    const mappedSettings = (settings || []).map((s: any) => ({
      ...s,
      method: s.code,
      fee: Number(s.fee),
      locationDetails: s.location_details,
    }));

    return NextResponse.json({ settings: mappedSettings, about: null });
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

    const supabase = getAdminClient();

    const abujaUpsert = supabase.from("delivery_methods").upsert(
      {
        code: "ABUJA_PICKUP",
        name: "Abuja Showroom Pickup",
        enabled: abujaEnabled,
        fee: abujaFee,
        instructions: abujaInstructions,
      },
      { onConflict: "code" }
    );

    const nationwideUpsert = supabase.from("delivery_methods").upsert(
      {
        code: "NATIONWIDE",
        name: "Nationwide Delivery",
        enabled: nationwideEnabled,
        fee: nationwideFee,
        instructions: nationwideInstructions,
      },
      { onConflict: "code" }
    );

    await Promise.all([abujaUpsert, nationwideUpsert]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Save Settings Error:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
