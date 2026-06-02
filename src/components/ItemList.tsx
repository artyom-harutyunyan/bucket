"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card } from "@/components/ui";

type ItemRow = {
  id: string;
  title: string;
  description: string;
  source: string;
  imageData: string | null;
  categories: { category: { id: string; name: string } }[];
};

export function ItemList({ items }: { items: ItemRow[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function deleteItem(id: string) {
    if (!confirm("Delete this item permanently?")) return;
    setDeletingId(id);
    const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
    setDeletingId(null);
    if (res.ok) {
      router.refresh();
    } else {
      alert("Could not delete item");
    }
  }

  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-stone-500">No items found.</p>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {items.map((item) => (
        <li key={item.id} className="min-w-0">
          <Card className="grid aspect-square grid-rows-[minmax(0,1fr)_auto] overflow-hidden p-0">
            <div className="relative min-h-0 bg-stone-100">
              {item.imageData ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={item.imageData}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-stone-400">
                  <span className="text-3xl font-light">—</span>
                </div>
              )}
            </div>
            <div className="flex shrink-0 flex-col gap-1.5 border-t border-stone-100 bg-white p-2.5 sm:p-3">
              <h3 className="line-clamp-2 shrink-0 text-sm font-medium leading-snug text-stone-900">
                {item.title}
              </h3>
              {item.categories.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {item.categories.slice(0, 2).map(({ category }) => (
                    <span
                      key={category.id}
                      className="truncate rounded-full bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-700 sm:text-xs"
                    >
                      {category.name}
                    </span>
                  ))}
                  {item.categories.length > 2 ? (
                    <span className="rounded-full bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-500 sm:text-xs">
                      +{item.categories.length - 2}
                    </span>
                  ) : null}
                </div>
              ) : null}
              <div className="flex gap-1.5 pt-0.5">
                <Button
                  type="button"
                  variant="secondary"
                  className="min-h-8 flex-1 px-2 py-1 text-xs"
                  onClick={() => router.push(`/items/${item.id}`)}
                >
                  View
                </Button>
                <Button
                  variant="danger"
                  className="min-h-8 px-2 py-1 text-xs"
                  disabled={deletingId === item.id}
                  onClick={() => deleteItem(item.id)}
                  type="button"
                >
                  {deletingId === item.id ? "…" : "Delete"}
                </Button>
              </div>
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
}
