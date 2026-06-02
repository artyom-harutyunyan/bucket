import Link from "next/link";

export default function ItemNotFound() {
  return (
    <div>
      <p className="text-stone-600">Item not found.</p>
      <Link href="/items" className="mt-2 inline-block text-sm underline">
        Back to all items
      </Link>
    </div>
  );
}
