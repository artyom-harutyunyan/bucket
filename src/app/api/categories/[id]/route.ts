import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  try {
    const category = await prisma.category.update({
      where: { id },
      data: { name },
    });
    return NextResponse.json(category);
  } catch {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  try {
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }
}
