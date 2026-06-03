"use client";

import { FormEvent, useState, type MouseEvent } from "react";
import { useAppRouter } from "@/components/loading-provider";
import { Button, Card, Input } from "@/components/ui";

type Category = {
  id: string;
  name: string;
  _count: { items: number };
};

export function CategoriesManager({
  initialCategories,
}: {
  initialCategories: Category[];
}) {
  const router = useAppRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  function openCategory(id: string) {
    router.push(`/categories/${id}`);
  }

  function stopRowClick(event: MouseEvent) {
    event.stopPropagation();
  }

  async function createCategory(event: FormEvent) {
    event.preventDefault();
    setError("");
    const trimmed = name.trim();
    if (!trimmed) return;

    setCreating(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Could not create category",
        );
        return;
      }
      setCategories((prev) =>
        [...prev, { ...data, _count: { items: 0 } }].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      );
      setName("");
      router.refresh();
    } catch {
      setError("Could not create category");
    } finally {
      setCreating(false);
    }
  }

  async function saveEdit(id: string) {
    const trimmed = editName.trim();
    if (!trimmed) return;
    const res = await fetch(`/api/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });
    if (!res.ok) {
      setError("Could not update category");
      return;
    }
    const updated = await res.json();
    setCategories((prev) =>
      prev
        .map((c) => (c.id === id ? { ...c, name: updated.name } : c))
        .sort((a, b) => a.name.localeCompare(b.name)),
    );
    setEditingId(null);
    router.refresh();
  }

  async function removeCategory(id: string) {
    if (!confirm("Delete this category? Linked items will be unlinked.")) {
      return;
    }
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Could not delete category");
      return;
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Card>
        <form onSubmit={createCategory} className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New category name"
            aria-label="Category name"
          />
          <Button type="submit" className="shrink-0" disabled={creating}>
            {creating ? "Adding…" : "Add category"}
          </Button>
        </form>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      </Card>

      <ul className="space-y-2">
        {categories.map((category) => (
          <li key={category.id}>
            {editingId === category.id ? (
              <Card className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div
                  className="flex flex-1 flex-col gap-2 sm:flex-row"
                  onClick={stopRowClick}
                >
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    aria-label="Edit category name"
                  />
                  <div className="flex gap-2">
                    <Button type="button" onClick={() => saveEdit(category.id)}>
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card
                role="button"
                tabIndex={0}
                onClick={() => openCategory(category.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openCategory(category.id);
                  }
                }}
                className="flex cursor-pointer flex-col gap-3 transition hover:border-stone-300 hover:bg-stone-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-stone-900">{category.name}</p>
                  <p className="text-xs text-stone-500">
                    {category._count.items} item
                    {category._count.items === 1 ? "" : "s"} · tap to view
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      openCategory(category.id);
                    }}
                  >
                    View items
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(category.id);
                      setEditName(category.name);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCategory(category.id);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            )}
          </li>
        ))}
      </ul>

      {categories.length === 0 ? (
        <p className="text-center text-sm text-stone-500">
          No categories yet. Create one above.
        </p>
      ) : null}
    </div>
  );
}
