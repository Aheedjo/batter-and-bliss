import { getAvailableStacks } from "@/lib/data/stacks-public";
import { getAvailableToppings } from "@/lib/data/toppings-public";
import { getDailyCapacityState } from "@/lib/order/daily-order-cap";
import { getCachedPublicOrderIntakeSnapshot } from "@/lib/order/order-intake";
import { CheckoutClient } from "./checkout-client";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const now = new Date();
  const [toppings, stacks, dailyCapacity, intakeSnapshot] = await Promise.all([
    getAvailableToppings(),
    getAvailableStacks(),
    getDailyCapacityState(now),
    getCachedPublicOrderIntakeSnapshot(),
  ]);
  return (
    <CheckoutClient
      toppings={toppings}
      stacks={stacks}
      dailyCapacity={{ cap: dailyCapacity.cap, used: dailyCapacity.used }}
      intake={{
        checkoutAllowed: intakeSnapshot.checkoutAllowed,
        blockedMessage: intakeSnapshot.checkoutBlockedMessage,
        orderForDayLabel: intakeSnapshot.orderForDayLabel,
      }}
    />
  );
}
