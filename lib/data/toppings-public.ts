import { cache } from "react";
import { compareToppingCategory, isPlatterAddOnCategory } from "@/lib/order/menu-categories";
import type { ToppingCategory } from "@/lib/order/menu-categories";
import { prisma } from "@/lib/db";
import type { PublicTopping } from "./public-topping";
import {
  getFallbackToppings,
  getFallbackToppingsByCategory,
} from "./toppings-fallback";

export type { PublicTopping } from "./public-topping";

const PLATTER_ADD_ON_CATEGORIES = ["platter_drizzle", "platter_topping"] as const;

const toppingSelect = {
  id: true,
  name: true,
  price: true,
  category: true,
  imageUrl: true,
  stackId: true,
} as const;

function logDbUnavailable(error: unknown) {
  const message =
    error instanceof Error ? error.message : "Unknown database error";
  console.error(
    "[toppings-public] Database unavailable; serving default menu catalog.",
    message,
  );
}

async function withToppingFallback(
  query: () => Promise<PublicTopping[]>,
  fallback: () => PublicTopping[],
): Promise<PublicTopping[]> {
  try {
    return await query();
  } catch (error) {
    logDbUnavailable(error);
    return fallback();
  }
}

export const getAvailableToppings = cache(async function getAvailableToppings(): Promise<PublicTopping[]> {
  return withToppingFallback(
    async () => {
      const rows = await prisma.topping.findMany({
        where: { available: true },
        select: toppingSelect,
      });
      rows.sort(
        (a: PublicTopping, b: PublicTopping) =>
          compareToppingCategory(a.category, b.category) ||
          a.name.localeCompare(b.name),
      );
      return rows;
    },
    getFallbackToppings,
  );
});

export const getAvailableToppingsByCategory = cache(
  async function getAvailableToppingsByCategory(
  category: ToppingCategory,
): Promise<PublicTopping[]> {
  return withToppingFallback(
    async () => {
      const rows = await prisma.topping.findMany({
        where: { available: true, category },
        orderBy: { name: "asc" },
        select: toppingSelect,
      });
      // Platter add-ons are managed in admin — no baked-in fallback menu.
      if (
        rows.length === 0 &&
        !isPlatterAddOnCategory(category)
      ) {
        const fallback = getFallbackToppingsByCategory(category);
        if (fallback.length > 0) return fallback;
      }
      return rows;
    },
    () => getFallbackToppingsByCategory(category),
  );
});

/** All platter toppings and drizzles (filtered per platter on the client). */
export const getPlatterAddOns = cache(async function getPlatterAddOns(): Promise<
  PublicTopping[]
> {
  return withToppingFallback(
    async () => {
      const rows = await prisma.topping.findMany({
        where: {
          available: true,
          category: { in: [...PLATTER_ADD_ON_CATEGORIES] },
        },
        orderBy: [{ category: "asc" }, { name: "asc" }],
        select: toppingSelect,
      });
      return rows;
    },
    () => [],
  );
});
