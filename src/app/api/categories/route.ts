import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api";
import {
  prepareCategoryForDb,
  sortCategoriesByName,
  withDecryptedCategories,
} from "@/lib/category-crypto";
import { prisma } from "@/lib/db";

export async function GET() {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;

  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { items: true } } },
  });
  return NextResponse.json(
    sortCategoriesByName(withDecryptedCategories(categories)),
  );
}

export async function POST(request: Request) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const category = await prisma.category.create({
    data: prepareCategoryForDb(name),
  });
  return NextResponse.json(withDecryptedCategories([category])[0], {
    status: 201,
  });
}
