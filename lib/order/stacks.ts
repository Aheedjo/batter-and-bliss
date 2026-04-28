export const STACKS = [
  {
    id: "morado" as const,
    name: "~Morado",
    subtitle: "Dubai Chocolate inspired pancakes",
    price: 7000,
    image:
      "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=85&auto=format&fit=crop",
    alt: "Chocolate pancakes stack",
  },
  {
    id: "regular" as const,
    name: "Regular Pancakes",
    price: 2500,
    image:
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=85&auto=format&fit=crop",
    alt: "Classic stack of pancakes with syrup",
  },
  {
    id: "chocolate-filled" as const,
    name: "Chocolate filled Pancakes",
    price: 3000,
    image:
      "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=800&q=85&auto=format&fit=crop",
    alt: "Chocolate filled pancakes",
  },
  {
    id: "white-chocolate-filled" as const,
    name: "White chocolate filled Pancakes",
    price: 3200,
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=85&auto=format&fit=crop",
    alt: "Pancakes with white chocolate",
  },
  {
    id: "jam-filled" as const,
    name: "Jam filled Pancakes",
    price: 2800,
    image:
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=85&auto=format&fit=crop",
    alt: "Pancakes with jam and berries",
  },
  {
    id: "chocolate-chip" as const,
    name: "Chocolate chip Pancakes",
    price: 3000,
    image:
      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=85&auto=format&fit=crop",
    alt: "Chocolate chip pancakes",
  },
] as const;

export type StackId = (typeof STACKS)[number]["id"];

export function getStackById(id: StackId | null) {
  if (!id) return null;
  return STACKS.find((s) => s.id === id) ?? null;
}
