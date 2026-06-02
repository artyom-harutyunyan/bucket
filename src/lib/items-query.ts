import { itemSearchFilter, parsePage } from "@/lib/api";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { prisma } from "@/lib/db";
import {
  withDecryptedSource,
  withDecryptedSources,
} from "@/lib/source-crypto";

const itemInclude = {
  categories: { include: { category: true } },
} as const;

export async function listItems(options: {
  page?: string;
  q?: string;
  categoryId?: string;
}) {
  const page = parsePage(options.page);
  const categoryWhere = options.categoryId
    ? { categories: { some: { categoryId: options.categoryId } } }
    : {};

  const where = {
    ...itemSearchFilter(options.q),
    ...categoryWhere,
  };

  const [rows, total] = await Promise.all([
    prisma.item.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      include: itemInclude,
    }),
    prisma.item.count({ where }),
  ]);

  return {
    items: withDecryptedSources(rows),
    total,
    page,
    pageSize: ITEMS_PER_PAGE,
    totalPages: Math.max(1, Math.ceil(total / ITEMS_PER_PAGE)),
  };
}

export async function getItemById(id: string) {
  const item = await prisma.item.findUnique({
    where: { id },
    include: itemInclude,
  });

  if (!item) {
    return null;
  }

  return withDecryptedSource(item);
}
