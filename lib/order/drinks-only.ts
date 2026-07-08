import type { CheckoutOrderPayload } from "@/lib/validations/checkout-order";

/**
 * Stack id used for carts that contain no pancake/platter, only drinks.
 * Drinks aren't part of the kitchen batch, so these orders bypass the
 * kitchen-day intake schedule, the manual pause, and the daily cap.
 */
export const DRINKS_ONLY_STACK_ID = "drinks-only";

/** A cart is "drinks-only" when it has at least one line and every line is a drink. */
export function isDrinksOnlySummary(
  lines: CheckoutOrderPayload["summaryLines"],
): boolean {
  return lines.length > 0 && lines.every((l) => l.kind === "drink");
}
