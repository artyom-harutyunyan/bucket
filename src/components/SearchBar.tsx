"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { Button, Input } from "@/components/ui";

export function SearchBar({ placeholder = "Search by title or description" }: {
  placeholder?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    setQ(searchParams.get("q") ?? "");
  }, [searchParams]);

  const applySearch = useCallback(
    (query: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = query.trim();
      if (trimmed) {
        params.set("q", trimmed);
      } else {
        params.delete("q");
      }
      params.delete("page");
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [pathname, router, searchParams],
  );

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    applySearch(q);
  }

  function clearSearch() {
    setQ("");
    applySearch("");
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-2 sm:flex-row sm:items-center"
    >
      <Input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            applySearch(q);
          }
        }}
        placeholder={placeholder}
        aria-label="Search"
        enterKeyHint="search"
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
