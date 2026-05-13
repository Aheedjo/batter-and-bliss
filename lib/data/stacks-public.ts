import { cache } from "react";
import { prisma } from "@/lib/db";
import { STACKS } from "@/lib/order/stacks";

export type PublicStack = {
  id: string;
  kind: "pancake" | "platter";
  name: string;
  price: number;
  subtitle?: string;
  image: string;
  alt: string;
};

function fallbackStacks(): PublicStack[] {
  return STACKS.map((s) => ({
    id: s.id,
    kind: "pancake",
    name: s.name,
    price: s.price,
    subtitle: "subtitle" in s ? s.subtitle : undefined,
    image: s.image,
    alt: s.alt,
  }));
}

function fallbackForName(name: string) {
  const lower = name.trim().toLowerCase();
  return STACKS.find((s) => s.name.trim().toLowerCase() === lower) ?? null;
}

export const getAvailableStacks = cache(async function getAvailableStacks(
  kind?: "pancake" | "platter",
): Promise<PublicStack[]> {
  try {
    const rows = await prisma.stack.findMany({
      where: { available: true, ...(kind ? { kind } : {}) },
      orderBy: { name: "asc" },
      select: { id: true, kind: true, name: true, price: true, description: true },
    });
    if (rows.length === 0) {
      const fallback = fallbackStacks();
      return kind ? fallback.filter((s) => s.kind === kind) : fallback;
    }
    return rows.map((row) => {
      const fallback = fallbackForName(row.name);
      return {
        id: row.id,
        kind: row.kind === "platter" ? "platter" : "pancake",
        name: row.name,
        price: row.price ?? 0,
        subtitle:
          row.description ??
          (fallback && "subtitle" in fallback ? fallback.subtitle : undefined),
        image:
          fallback?.image ??
          "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=85&auto=format&fit=crop",
        alt:
          fallback?.alt ??
          `${row.name} ${row.kind === "platter" ? "platter" : "pancakes"}`,
      };
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown database error";
    console.error(
      "[stacks-public] Database unavailable; serving default stack catalog.",
      message,
    );
    const fallback = fallbackStacks();
    return kind ? fallback.filter((s) => s.kind === kind) : fallback;
  }
});
