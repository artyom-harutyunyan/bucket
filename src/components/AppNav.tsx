"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui";

const links = [
  { href: "/categories", label: "Categories" },
  { href: "/items", label: "Items" },
];

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-2 text-sm font-semibold text-stone-800">
            Bucket
          </span>
          <nav className="flex flex-wrap gap-1">
            {links.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-1.5 text-sm transition ${
                    active
                      ? "bg-stone-200 text-stone-900"
                      : "text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <Button variant="secondary" onClick={logout} type="button">
          Log out
        </Button>
      </div>
    </header>
  );
}
