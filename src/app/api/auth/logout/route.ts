import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";

console.log("SESSION_COOKIE", SESSION_COOKIE);

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
