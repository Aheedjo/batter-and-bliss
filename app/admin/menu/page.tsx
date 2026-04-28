import { MenuSection } from "@/components/admin/menu-section";
import { compareToppingCategory } from "@/lib/order/menu-categories";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
import {
  createExtra,
  createTopping,
  setExtraAvailable,
  setToppingAvailable,
  updateExtra,
  updateTopping,
} from "./actions";

export default async function AdminMenuPage() {
  const [toppingsRaw, extras] = await Promise.all([
    prisma.topping.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        category: true,
        available: true,
      },
    }),
    prisma.extra.findMany({ orderBy: { name: "asc" } }),
  ]);

  const toppings = [...toppingsRaw].sort(
    (a, b) =>
      compareToppingCategory(a.category, b.category) ||
      a.name.localeCompare(b.name),
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
          Menu add-ons
        </h2>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Glazing, toppings, syrups, and drinks—same sections as the printed
          menu. Toggle availability anytime.
        </p>
      </div>

      <MenuSection
        title="Glazing · Topping · Syrup · Drinks"
        description="Items appear on the customer customize step, grouped by section."
        kind="topping"
        items={toppings}
        createAction={createTopping}
        updateAction={updateTopping}
        setAvailable={setToppingAvailable}
      />

      <MenuSection
        title="Extras"
        description="Other add-ons (optional)."
        kind="extra"
        items={extras}
        createAction={createExtra}
        updateAction={updateExtra}
        setAvailable={setExtraAvailable}
      />
    </div>
  );
}
