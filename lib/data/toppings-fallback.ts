import defaultMenu from "./default-menu.json";
import {
  compareToppingCategory,
  isToppingCategory,
  type ToppingCategory,
} from "@/lib/order/menu-categories";
import type { PublicTopping } from "./public-topping";

function stableToppingId(category: string, name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `bbl-${category}-${slug}`;
}

function rowToPublic(row: {
  name: string;
  price: number;
  category: string;
}): PublicTopping | null {
  if (!isToppingCategory(row.category)) return null;
  return {
    id: stableToppingId(row.category, row.name),
    name: row.name,
    price: row.price,
    category: row.category,
  };
}

/** Baked-in menu when Prisma/SQLite is unavailable (e.g. Vercel without a remote DB). */
export function getFallbackToppings(): PublicTopping[] {
  const rows = defaultMenu.toppings
    .map((r) => rowToPublic(r))
    .filter((x): x is PublicTopping => x !== null);
  rows.sort(
    (a, b) =>
      compareToppingCategory(a.category, b.category) ||
      a.name.localeCompare(b.name),
  );
  return rows;
}

export function getFallbackToppingsByCategory(
  category: ToppingCategory,
): PublicTopping[] {
  return defaultMenu.toppings
    .filter((r) => r.category === category)
    .map((r) => rowToPublic(r))
    .filter((x): x is PublicTopping => x !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}
