import Link from "next/link";

export function Pagination({
  page,
  totalPages,
  basePath,
  searchParams,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;
  console.log('ok', 11);
  
  function href(targetPage: number) {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    if (targetPage > 1) {
      params.set("page", String(targetPage));
    } else {
      params.delete("page");
    }
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 pt-4 text-sm text-stone-600">
      <span>
        Page {page} of {totalPages}
      </span>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link
            href={href(page - 1)}
            className="rounded-lg border border-stone-300 px-3 py-1.5 hover:bg-stone-100"
          >
            Previous
          </Link>
        ) : null}
        {page < totalPages ? (
          <Link
            href={href(page + 1)}
            className="rounded-lg border border-stone-300 px-3 py-1.5 hover:bg-stone-100"
          >
            Next
          </Link>
        ) : null}
      </div>
    </div>
  );
}
