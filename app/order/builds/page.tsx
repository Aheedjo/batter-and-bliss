import { getAvailableStacks } from "@/lib/data/stacks-public";
import { getAvailableToppings } from "@/lib/data/toppings-public";
import { BuildsClient } from "./builds-client";

export const dynamic = "force-dynamic";

export default async function BuildsPage() {
  const [catalog, stacks] = await Promise.all([
    getAvailableToppings(),
    getAvailableStacks(),
  ]);
  return <BuildsClient catalog={catalog} stacks={stacks} />;
}
