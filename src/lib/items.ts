import { itemSearchFilter, parsePage } from "@/lib/api";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { withDecryptedSources } from "@/lib/source-crypto";

export async function fetchItems(options: {
  page?: string;
  q?: string;
  categoryId?: string;
}) {
  const page = parsePage(options.page);
  const where = {
    ...itemSearchFilter(options.q),
    ...(options.categoryId
      ? { categories: { some: { categoryId: options.categoryId } } }
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

  return {
    items: withDecryptedSources(items),
    total,
    page,
    pageSize: ITEMS_PER_PAGE,
    totalPages: Math.max(1, Math.ceil(total / ITEMS_PER_PAGE)),
  };
}
