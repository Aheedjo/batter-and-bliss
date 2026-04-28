import { compareToppingCategory } from "@/lib/order/menu-categories";
import type { ToppingCategory } from "@/lib/order/menu-categories";
import { prisma } from "@/lib/db";

export type PublicTopping = {
  id: string;
  name: string;
  price: number | null;
  category: string;
};

export async function getAvailableToppings(): Promise<PublicTopping[]> {
  const rows = await prisma.topping.findMany({
    where: { available: true },
    select: { id: true, name: true, price: true, category: true },
  });
  rows.sort(
    (a, b) =>
      compareToppingCategory(a.category, b.category) ||
      a.name.localeCompare(b.name),
  );
  return rows;
}

export async function getAvailableToppingsByCategory(
  category: ToppingCategory,
): Promise<PublicTopping[]> {
  return prisma.topping.findMany({
    where: { available: true, category },
    orderBy: { name: "asc" },
    select: { id: true, name: true, price: true, category: true },
  });
}
