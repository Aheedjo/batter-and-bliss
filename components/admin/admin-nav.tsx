"use client";

import { ClipboardList, Croissant, LayoutDashboard } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links: {
  href: string;
  label: string;
  match: "exact" | "prefix";
  Icon: LucideIcon;
}[] = [
  { href: "/admin", label: "Overview", match: "exact", Icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", match: "prefix", Icon: ClipboardList },
  { href: "/admin/menu", label: "Menu", match: "prefix", Icon: Croissant },
];

function isActive(pathname: string, href: string, match: "exact" | "prefix") {
  if (match === "exact") {
    return pathname === href || pathname === `${href}/`;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav() {
  const pathname = usePathname() ?? "";
  if (pathname.startsWith("/admin/login")) {
    return null;
  }
  const activeIndex = links.findIndex(({ href, match }) => isActive(pathname, href, match));
  const activeCenterPct =
    activeIndex >= 0 ? ((activeIndex + 0.5) / links.length) * 100 : null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-20 w-full border-t border-order-line/80 bg-order-bg/90 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl backdrop-saturate-150"
      aria-label="Admin sections"
    >
      <ul className="relative flex w-full items-stretch justify-between gap-1 px-3 sm:px-6">
        {links.map(({ href, label, match, Icon }) => {
          const active = isActive(pathname, href, match);
          return (
            <li key={href} className="min-w-0 flex-1">
              <Link
                href={href}
                className={`relative flex w-full flex-col items-center justify-center gap-0.5 px-1 pb-2.5 pt-1 text-center transition ${
                  active
                    ? "text-order-brownBtn"
                    : "text-order-taupe hover:text-order-brownInk"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <Icon
                  className="h-6 w-6 shrink-0"
                  strokeWidth={active ? 2.35 : 1.65}
                  aria-hidden
                />
                <span
                  className={`w-full truncate text-[10px] font-semibold leading-tight sm:text-[11px] ${
                    active ? "text-order-brownBtn" : "text-order-taupe"
                  }`}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
        {activeCenterPct !== null ? (
          <span
            className="pointer-events-none absolute bottom-0 h-[2px] w-9 -translate-x-1/2 bg-order-brownBtn transition-[left] duration-300 ease-out"
            style={{ left: `${activeCenterPct}%` }}
            aria-hidden
          />
        ) : null}
      </ul>
    </nav>
  );
}
