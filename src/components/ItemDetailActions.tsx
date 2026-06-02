"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui";

export function ItemDetailActions({ itemId }: { itemId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function deleteItem() {
    if (!confirm("Delete this item permanently?")) return;
    setDeleting(true);
    const res = await fetch(`/api/items/${itemId}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) {
      router.push("/items");
      router.refresh();
    } else {
      alert("Could not delete item");
    }
  }

  return (
    <div className="mt-6 flex flex-wrap gap-2 border-t border-stone-100 pt-4">
      <Button
        type="button"
        variant="danger"
        disabled={deleting}
        onClick={deleteItem}
      >
        {deleting ? "Deleting…" : "Delete item"}
      </Button>
    </div>
  );
}
