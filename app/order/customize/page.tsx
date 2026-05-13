import { CustomizeAllClient } from "@/components/order/customize-all-client";
import { getAvailableStacks } from "@/lib/data/stacks-public";
import { getAvailableToppingsByCategory } from "@/lib/data/toppings-public";

export const dynamic = "force-dynamic";

export default async function CustomizePage() {
  const [stacks, glazing, toppings, syrups] = await Promise.all([
    getAvailableStacks(),
    getAvailableToppingsByCategory("glazing"),
    getAvailableToppingsByCategory("topping"),
    getAvailableToppingsByCategory("syrup"),
  ]);

  return (
    <CustomizeAllClient
      stacks={stacks}
      glazing={glazing}
      toppings={toppings}
      syrups={syrups}
    />
  );
}
