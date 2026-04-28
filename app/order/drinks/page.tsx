import { getAvailableToppingsByCategory } from "@/lib/data/toppings-public";
import { DrinksClient } from "./drinks-client";

export const dynamic = "force-dynamic";

export default async function DrinksPage() {
  const drinks = await getAvailableToppingsByCategory("drink");
  return <DrinksClient drinks={drinks} />;
}
