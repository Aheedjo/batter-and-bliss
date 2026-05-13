import { PlatterCustomizeClient } from "@/components/order/platter-customize-client";
import { getAvailableStacks } from "@/lib/data/stacks-public";
import { getAvailableToppingsByCategory } from "@/lib/data/toppings-public";

export const dynamic = "force-dynamic";

export default async function PlatterCustomizePage() {
  const [stacks, platterGlazing, platterToppings] = await Promise.all([
    getAvailableStacks(),
    getAvailableToppingsByCategory("platter_glazing"),
    getAvailableToppingsByCategory("platter_topping"),
  ]);

  return (
    <PlatterCustomizeClient
      stacks={stacks}
      platterGlazing={platterGlazing}
      platterToppings={platterToppings}
    />
  );
}
