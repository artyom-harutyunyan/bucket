import { NextResponse } from "next/server";
import { requireApiAuth, parsePage, itemSearchFilter } from "@/lib/api";
import {
  ITEMS_PER_PAGE,
  MAX_IMAGE_BYTES,
  MAX_IMAGE_MB,
} from "@/lib/constants";
import { prisma } from "@/lib/db";
import {
  encryptSourceAtRest,
  withDecryptedSource,
  withDecryptedSources,
} from "@/lib/source-crypto";

export async function GET(request: Request) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const page = parsePage(searchParams.get("page"));
  const q = searchParams.get("q") ?? undefined;
  const categoryId = searchParams.get("categoryId") ?? undefined;

  const where = {
    ...itemSearchFilter(q),
    ...(categoryId
      ? { categories: { some: { categoryId } } }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.item.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      include: {
        categories: { include: { category: true } },
      },
    }),
    prisma.item.count({ where }),
  ]);

  return NextResponse.json({
    items: withDecryptedSources(items),
    total,
    page,
    pageSize: ITEMS_PER_PAGE,
    totalPages: Math.max(1, Math.ceil(total / ITEMS_PER_PAGE)),
  });
}

async function readImageFromForm(formData: FormData): Promise<string | null> {
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return null;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(`Image must be ${MAX_IMAGE_MB}MB or smaller`);
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const mime = file.type || "image/jpeg";
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

export async function POST(request: Request) {
  const unauthorized = await requireApiAuth();
  if (unauthorized) return unauthorized;

  const formData = await request.formData();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const source = String(formData.get("source") ?? "").trim();
  const categoryIds = formData
    .getAll("categoryIds")
    .map((v) => String(v))
    .filter(Boolean);

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  let imageData: string | null = null;
  try {
    imageData = await readImageFromForm(formData);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid image";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const item = await prisma.item.create({
    data: {
      title,
      description,
      source: encryptSourceAtRest(source),
      imageData,
      categories: {
        create: categoryIds.map((categoryId) => ({ categoryId })),
      },
    },
    include: {
      categories: { include: { category: true } },
    },
  });

  return NextResponse.json(withDecryptedSource(item), { status: 201 });
}
