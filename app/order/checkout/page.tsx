import { getAvailableToppings } from "@/lib/data/toppings-public";
import { CheckoutClient } from "./checkout-client";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const toppings = await getAvailableToppings();
  return <CheckoutClient toppings={toppings} />;
}
