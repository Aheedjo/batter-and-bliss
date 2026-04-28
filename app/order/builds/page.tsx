import { getAvailableToppings } from "@/lib/data/toppings-public";
import { BuildsClient } from "./builds-client";

export const dynamic = "force-dynamic";

export default async function BuildsPage() {
  const catalog = await getAvailableToppings();
  return <BuildsClient catalog={catalog} />;
}
