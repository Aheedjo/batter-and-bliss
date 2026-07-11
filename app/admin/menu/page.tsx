import { MenuProductsClient } from "@/components/admin/menu-products-client";
import { compareToppingCategory } from "@/lib/order/menu-categories";
import { prisma } from "@/lib/db";
import {
  createStack,
  createExtra,
  createTopping,
  deleteStack,
  deleteExtra,
  deleteTopping,
  setStackAvailable,
  setExtraAvailable,
  setToppingAvailable,
  updateStack,
  updateExtra,
  updateTopping,
} from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  const [stacksRaw, toppingsRaw, extrasRaw] = await Promise.all([
    prisma.stack.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        kind: true,
        price: true,
        available: true,
        description: true,
        imageUrl: true,
      },
    }),
    prisma.topping.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        category: true,
        available: true,
        description: true,
        imageUrl: true,
        stackId: true,
      },
    }),
    prisma.extra.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        price: true,
        available: true,
        description: true,
      },
    }),
  ]);

  const toppings = [...toppingsRaw].sort(
    (a, b) =>
      compareToppingCategory(a.category, b.category) ||
      a.name.localeCompare(b.name),
  );
  const stacks = stacksRaw.map((s) => ({
    ...s,
    kind: (s.kind === "platter" ? "platter" : "pancake") as
      | "pancake"
      | "platter",
  }));

  return (
    <MenuProductsClient
      stacks={stacks}
      toppings={toppings}
      extras={extrasRaw}
      createStack={createStack}
      updateStack={updateStack}
      deleteStack={deleteStack}
      setStackAvailable={setStackAvailable}
      createTopping={createTopping}
      updateTopping={updateTopping}
      deleteTopping={deleteTopping}
      setToppingAvailable={setToppingAvailable}
      createExtra={createExtra}
      updateExtra={updateExtra}
      deleteExtra={deleteExtra}
      setExtraAvailable={setExtraAvailable}
    />
  );
}
