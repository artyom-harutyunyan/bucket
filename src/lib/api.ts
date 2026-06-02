import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function requireApiAuth(): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token || !(await verifySessionToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export function parsePage(value: string | null | undefined): number {
  const page = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

export function itemSearchFilter(q: string | undefined) {
  const trimmed = q?.trim();
  if (!trimmed) {
    return {};
  }
  const needle = trimmed.toLowerCase().replace(/\s+/g, " ").trim();
  return {
    searchText: { contains: needle, mode: "insensitive" as const },
  };
}
