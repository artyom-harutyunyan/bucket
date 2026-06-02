import Link from "next/link";
import { notFound } from "next/navigation";
import { ItemDetailActions } from "@/components/ItemDetailActions";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ItemDetailPage({ params }: PageProps) {
  const { id } = await params;

  const item = await prisma.item.findUnique({
    where: { id },
    include: {
      categories: { include: { category: true } },
    },
  });

  if (!item) {
    notFound();
  }

  return (
    <div>
      <Link
        href="/items"
        className="text-sm text-stone-500 hover:text-stone-800"
      >
        ← All items
      </Link>

      <article className="mt-4 rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
        {item.imageData ? (
          <div className="mb-4 overflow-hidden rounded-lg bg-stone-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageData}
              alt=""
              className="max-h-80 w-full object-contain"
            />
          </div>
        ) : null}

        <h1 className="text-xl font-semibold text-stone-900">{item.title}</h1>

        {item.description ? (
          <p className="mt-3 whitespace-pre-wrap text-sm text-stone-600">
            {item.description}
          </p>
        ) : null}

        {item.source ? (
          <p className="mt-4 text-sm text-stone-500">
            Source:{" "}
            <a
              href={item.source}
              target="_blank"
              rel="noreferrer"
              className="break-all underline"
            >
              {item.source}
            </a>
          </p>
        ) : null}

        {item.categories.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {item.categories.map(({ category }) => (
              <Link
                key={category.id}
                href={`/categories/${category.id}`}
                className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-700 hover:bg-stone-200"
              >
                {category.name}
              </Link>
            ))}
          </div>
        ) : null}

        <ItemDetailActions itemId={item.id} />
      </article>
    </div>
  );
}
