import { cache } from "react";
import { compareToppingCategory } from "@/lib/order/menu-categories";
import type { ToppingCategory } from "@/lib/order/menu-categories";
import { prisma } from "@/lib/db";
import type { PublicTopping } from "./public-topping";
import {
  getFallbackToppings,
  getFallbackToppingsByCategory,
} from "./toppings-fallback";

export type { PublicTopping } from "./public-topping";

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
        select: { id: true, name: true, price: true, category: true, imageUrl: true },
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
    () =>
      prisma.topping.findMany({
        where: { available: true, category },
        orderBy: { name: "asc" },
        select: { id: true, name: true, price: true, category: true, imageUrl: true },
      }),
    () => getFallbackToppingsByCategory(category),
  );
});
