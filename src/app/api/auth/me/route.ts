import { NextResponse } from "next/server";
import { getSessionUser, clearSessionToken } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
    return NextResponse.json({ authenticated: true, user });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await clearSessionToken();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
