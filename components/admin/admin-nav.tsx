"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links: { href: string; label: string; match: "exact" | "prefix" }[] = [
  { href: "/admin", label: "Overview", match: "exact" },
  { href: "/admin/menu", label: "Menu", match: "prefix" },
  { href: "/admin/orders", label: "Orders", match: "prefix" },
];

function isActive(pathname: string, href: string, match: "exact" | "prefix") {
  if (match === "exact") {
    return pathname === href || pathname === `${href}/`;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav() {
  const pathname = usePathname() ?? "";

  return (
    <nav
      className="border-b border-[var(--ui-border)] bg-[var(--ui-surface)]/60"
      aria-label="Admin sections"
    >
      <div className="mx-auto flex max-w-3xl flex-wrap gap-1 px-4 py-2 sm:px-6">
        {links.map(({ href, label, match }) => {
          const active = isActive(pathname, href, match);
          return (
            <Link
              key={href}
              href={href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-stone-200/90 text-stone-900 dark:bg-stone-700 dark:text-stone-50"
                  : "text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
              }`}
              aria-current={active ? "page" : undefined}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
