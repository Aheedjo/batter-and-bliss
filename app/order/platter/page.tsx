import { PlatterCustomizeClient } from "@/components/order/platter-customize-client";
import { getAvailableStacks } from "@/lib/data/stacks-public";
import { getPlatterAddOns } from "@/lib/data/toppings-public";

export const dynamic = "force-dynamic";

export default async function PlatterCustomizePage() {
  const [stacks, platterAddOns] = await Promise.all([
    getAvailableStacks(),
    getPlatterAddOns(),
  ]);

  return (
    <PlatterCustomizeClient stacks={stacks} platterAddOns={platterAddOns} />
  );
}
