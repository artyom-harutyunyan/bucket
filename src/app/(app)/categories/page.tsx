import { CategoriesManager } from "@/components/CategoriesManager";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { items: true } } },
  });

  return (
    <div>
      <h1 className="text-xl font-semibold text-stone-900">Categories</h1>
      <p className="mt-1 text-sm text-stone-500">
        Create, edit, or delete categories. Tap a category to see all its items.
      </p>
      <div className="mt-6">
        <CategoriesManager initialCategories={categories} />
      </div>
    </div>
  );
}
