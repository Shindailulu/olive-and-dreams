import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    // 1. Authorize Admin
    const user = await getSessionUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // 2. Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 3. Generate unique, safe filename
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${timestamp}_${safeName}`;

    // 4. Upload to Supabase Storage
    const supabase = getAdminClient();
    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(filename, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Supabase Storage Upload Error:", error);
      return NextResponse.json({ error: "Failed to upload file: " + error.message }, { status: 500 });
    }

    // 5. Get public URL
    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(data.path);

    return NextResponse.json({ success: true, url: urlData.publicUrl });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
