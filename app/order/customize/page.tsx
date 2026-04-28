import { CustomizeAllClient } from "@/components/order/customize-all-client";
import { getAvailableToppingsByCategory } from "@/lib/data/toppings-public";

export const dynamic = "force-dynamic";

export default async function CustomizePage() {
  const [glazing, toppings, syrups] = await Promise.all([
    getAvailableToppingsByCategory("glazing"),
    getAvailableToppingsByCategory("topping"),
    getAvailableToppingsByCategory("syrup"),
  ]);

  return (
    <CustomizeAllClient glazing={glazing} toppings={toppings} syrups={syrups} />
  );
}
