import Link from "next/link";
import { Suspense } from "react";
import { AddItemForm } from "@/components/AddItemForm";
import { ItemList } from "@/components/ItemList";
import { Pagination } from "@/components/Pagination";
import { SearchBar } from "@/components/SearchBar";
import { withDecryptedCategory } from "@/lib/category-crypto";
import { fetchItems } from "@/lib/items";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; q?: string }>;
};

export default async function CategoryItemsPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { page: pageParam, q } = await searchParams;

  const row = await prisma.category.findUnique({ where: { id } });
  if (!row) {
    return (
      <div>
        <p className="text-stone-600">Category not found.</p>
        <Link href="/categories" className="mt-2 inline-block text-sm underline">
          Back to categories
        </Link>
      </div>
    );
  }

  const category = withDecryptedCategory(row);
  const result = await fetchItems({ page: pageParam, q, categoryId: id });

  return (
    <div>
      <Link
        href="/categories"
        className="text-sm text-stone-500 hover:text-stone-800"
      >
        ← Categories
      </Link>
      <h1 className="mt-2 text-xl font-semibold text-stone-900">
        {category.name}
      </h1>
      <p className="mt-1 text-sm text-stone-500">
        {result.total} item{result.total === 1 ? "" : "s"}
      </p>

      <div className="mt-6 space-y-4">
        <Suspense fallback={null}>
          <SearchBar />
        </Suspense>
        <AddItemForm defaultCategoryIds={[id]} />
        <ItemList items={result.items} />
        <Pagination
          page={result.page}
          totalPages={result.totalPages}
          basePath={`/categories/${id}`}
          searchParams={{ q }}
        />
      </div>
    </div>
  );
}
