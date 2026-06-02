import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/api";
import { prisma } from "@/lib/db";
import { withDecryptedSource } from "@/lib/source-crypto";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const item = await prisma.item.findUnique({
    where: { id },
    include: {
      categories: { include: { category: true } },
    },
  });

  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  return NextResponse.json(withDecryptedSource(item));
}

export async function DELETE(_request: Request, { params }: Params) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;

  const { id } = await params;
  try {
    await prisma.item.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }
}
