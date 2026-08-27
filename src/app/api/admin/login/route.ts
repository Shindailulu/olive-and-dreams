import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, signToken, setSessionToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = signToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    await setSessionToken(token);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Admin Login Error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
