import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAdminClient } from "@/lib/supabase";
import { signToken, setSessionToken } from "@/lib/auth";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { name, email, password, phone } = parsed.data;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey);

    const { data: authData, error: authError } = await supabaseAuth.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          phone: phone || null,
        },
      },
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || "Registration failed" },
        { status: 400 }
      );
    }

    const supabase = getAdminClient();
    
    // Allow trigger to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { data: customer } = await supabase
      .from("customers")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (!customer) {
      return NextResponse.json(
        { error: "User registered but profile creation failed" },
        { status: 500 }
      );
    }

    const token = signToken({
      id: customer.id,
      email: customer.email,
      name: customer.full_name || "",
      role: "CUSTOMER",
    });

    await setSessionToken(token);

    return NextResponse.json(
      {
        user: {
          id: customer.id,
          email: customer.email,
          name: customer.full_name,
          role: "CUSTOMER",
        },
        message: "Registered successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
