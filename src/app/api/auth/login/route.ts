import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAdminClient } from "@/lib/supabase";
import { signToken, setSessionToken } from "@/lib/auth";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

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
    const { data: customer } = await supabase
      .from("customers")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (!customer) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    const token = signToken({
      id: customer.id,
      email: customer.email,
      name: customer.full_name || "",
      role: "CUSTOMER",
    });

    await setSessionToken(token);

    return NextResponse.json({
      user: {
        id: customer.id,
        email: customer.email,
        name: customer.full_name,
        role: "CUSTOMER",
      },
      message: "Logged in successfully",
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
