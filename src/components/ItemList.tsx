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
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id}>
          <Card className="flex flex-col gap-3 sm:flex-row">
            {item.imageData ? (
              <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-lg bg-stone-100 sm:h-24 sm:w-24">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageData}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            ) : null}
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-stone-900">{item.title}</h3>
              {item.description ? (
                <p className="mt-1 text-sm text-stone-600">{item.description}</p>
              ) : null}
              {item.source ? (
                <p className="mt-2 text-xs text-stone-500">
                  Source:{" "}
                  <a
                    href={item.source}
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    {item.source}
                  </a>
                </p>
              ) : null}
              {item.categories.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.categories.map(({ category }) => (
                    <span
                      key={category.id}
                      className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-700"
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="flex shrink-0 flex-col gap-2 self-start">
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => router.push(`/items/${item.id}`)}
              >
                View
              </Button>
              <Button
                variant="danger"
                disabled={deletingId === item.id}
                onClick={() => deleteItem(item.id)}
                type="button"
              >
                Delete
              </Button>
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
}
