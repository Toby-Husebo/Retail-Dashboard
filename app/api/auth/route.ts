import { NextRequest, NextResponse } from "next/server";
import { signToken, isValidPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (!isValidPassword(password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = await signToken({ authenticated: true });

  const res = NextResponse.json({ success: true });
  res.cookies.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete("auth_token");
  return res;
}
