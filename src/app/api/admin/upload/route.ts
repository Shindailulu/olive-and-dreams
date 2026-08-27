import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import fs from "fs";
import path from "path";

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

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3. Setup upload directory
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 4. Generate unique, safe filename
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${timestamp}_${safeName}`;
    const filePath = path.join(uploadDir, filename);

    // 5. Write file to public/uploads
    fs.writeFileSync(filePath, buffer);

    // 6. Return relative public path
    const url = `/uploads/${filename}`;
    return NextResponse.json({ success: true, url });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
