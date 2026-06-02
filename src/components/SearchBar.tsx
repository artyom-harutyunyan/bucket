"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button, Input } from "@/components/ui";

export function SearchBar({ placeholder = "Search by title or description" }: {
  placeholder?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = q.trim();
    if (trimmed) {
      params.set("q", trimmed);
    } else {
      params.delete("q");
    }
    params.delete("page");
    router.push(`?${params.toString()}`);
  }

  function clearSearch() {
    setQ("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.delete("page");
    router.push(`?${params.toString()}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-2 sm:flex-row sm:items-center"
    >
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        aria-label="Search"
      />
      <div className="flex gap-2">
        <Button type="submit">Search</Button>
        {searchParams.get("q") ? (
          <Button type="button" variant="secondary" onClick={clearSearch}>
            Clear
          </Button>
        ) : null}
      </div>
    </form>
  );
}
