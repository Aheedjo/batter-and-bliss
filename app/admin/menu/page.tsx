import { MenuSection } from "@/components/admin/menu-section";
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
  const [toppings, extras] = await Promise.all([
    prisma.topping.findMany({ orderBy: { name: "asc" } }),
    prisma.extra.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
          Toppings &amp; extras
        </h2>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Turn items on or off, set prices, and keep the menu up to date.
        </p>
      </div>

      <MenuSection
        title="Toppings"
        description="Add-ons customers can choose for their order."
        kind="topping"
        items={toppings}
        createAction={createTopping}
        updateAction={updateTopping}
        setAvailable={setToppingAvailable}
      />

      <MenuSection
        title="Extras"
        description="Sides, upgrades, and other add-ons."
        kind="extra"
        items={extras}
        createAction={createExtra}
        updateAction={updateExtra}
        setAvailable={setExtraAvailable}
      />
    </div>
  );
}
