import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAdminClient } from "@/lib/supabase";
import { signToken, setSessionToken } from "@/lib/auth";
import { z } from "zod";

const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = adminLoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const { email, password } = parsed.data;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);

    const { data: authData, error: authError } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const supabase = getAdminClient();
    const { data: adminUser } = await supabase
      .from("admin_users")
      .select("*")
      .eq("user_id", authData.user.id)
      .single();

    if (!adminUser) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const token = signToken({
      id: authData.user.id,
      email: authData.user.email || email,
      name: authData.user.user_metadata?.full_name || "Admin",
      role: "ADMIN",
    });

    await setSessionToken(token);

    return NextResponse.json({
      user: {
        id: authData.user.id,
        email: authData.user.email || email,
        name: authData.user.user_metadata?.full_name || "Admin",
        role: "ADMIN",
      },
      message: "Logged in successfully",
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
