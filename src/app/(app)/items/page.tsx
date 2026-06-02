import { Suspense } from "react";
import { AddItemForm } from "@/components/AddItemForm";
import { ItemList } from "@/components/ItemList";
import { Pagination } from "@/components/Pagination";
import { SearchBar } from "@/components/SearchBar";
import { fetchItems } from "@/lib/items";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ page?: string; q?: string }>;
};

export default async function ItemsPage({ searchParams }: PageProps) {
  const { page: pageParam, q } = await searchParams;

  const result = await fetchItems({ page: pageParam, q });

  return (
    <div>
      <h1 className="text-xl font-semibold text-stone-900">Items</h1>
      <p className="mt-1 text-sm text-stone-500">
        All items across categories. Search by title or description.
      </p>

      <div className="mt-6 space-y-4">
        <Suspense fallback={null}>
          <SearchBar />
        </Suspense>
        <AddItemForm />
        <ItemList items={result.items} />
        <Pagination
          page={result.page}
          totalPages={result.totalPages}
          basePath="/items"
          searchParams={{ q }}
        />
      </div>
    </div>
  );
}
