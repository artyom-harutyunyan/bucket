"use client";

import Link from "next/link";
import { MAX_IMAGE_MB } from "@/lib/constants";
import { FormEvent, useEffect, useState } from "react";
import { useAppRouter } from "@/components/loading-provider";
import { Button, Card, Input, Label, Textarea } from "@/components/ui";

type Category = { id: string; name: string };

export function AddItemForm({
  defaultCategoryIds = [],
}: {
  defaultCategoryIds?: string[];
}) {
  const router = useAppRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<string[]>(defaultCategoryIds);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const defaultIdsKey = defaultCategoryIds.join(",");

  useEffect(() => {
    if (!open) return;

    setSelected(defaultCategoryIds);
    setCategoriesLoading(true);

    fetch("/api/categories")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Category[]) =>
        setCategories(data.map(({ id, name }) => ({ id, name }))),
      )
      .catch(() => setCategories([]))
      .finally(() => setCategoriesLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset selection when defaults change
  }, [open, defaultIdsKey]);

  function toggleCategory(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  }

  function openForm() {
    setError("");
    setOpen(true);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    selected.forEach((id) => formData.append("categoryIds", id));

    const res = await fetch("/api/items", { method: "POST", body: formData });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to add item");
      return;
    }
    form.reset();
    setSelected(defaultCategoryIds);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <Button type="button" onClick={openForm}>
        Add item
      </Button>
    );
  }

  return (
    <Card className="mt-4">
      <form onSubmit={onSubmit} className="space-y-3">
        <h2 className="text-sm font-semibold text-stone-800">New item</h2>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div>
          <Label>Title</Label>
          <Input name="title" required />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea name="description" rows={3} />
        </div>
        <div>
          <Label>Source (URL or text)</Label>
          <Input name="source" type="text" />
        </div>
        <div>
          <Label>Image (optional, max {MAX_IMAGE_MB}MB)</Label>
          <Input name="image" type="file" accept="image/*" />
        </div>
        <div>
          <Label>Categories</Label>
          {categoriesLoading ? (
            <p className="mt-1 text-sm text-stone-500">Loading categories…</p>
          ) : categories.length === 0 ? (
            <p className="mt-1 text-sm text-stone-500">
              No categories yet.{" "}
              <Link href="/categories" className="font-medium underline">
                Create a category first
              </Link>
            </p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {categories.map((cat) => {
                const isSelected = selected.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    aria-pressed={isSelected}
                    className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                      isSelected
                        ? "border-stone-800 bg-stone-800 text-white"
                        : "border-stone-300 bg-white text-stone-700 hover:border-stone-400"
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          )}
          {selected.length > 0 ? (
            <p className="mt-2 text-xs text-stone-500">
              {selected.length} selected — tap again to remove
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving…" : "Save item"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
