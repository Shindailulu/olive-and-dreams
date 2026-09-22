import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { z } from "zod";

const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { email, password } = parsed.data;

    const supabase = getAdminClient();
    
    // Find the user by email first
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("id")
      .eq("email", email)
      .single();

    if (customerError || !customer) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update password using admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      customer.id,
      { password }
    );

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
