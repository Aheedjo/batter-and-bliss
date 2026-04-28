import type { TrackedOrder } from "@/lib/order/tracked-order";

/** How long the track page shows an order without a server “fulfilled” signal. */
export const CUSTOMER_ACTIVE_ORDER_TTL_MS = 72 * 60 * 60 * 1000;

/** Cap so the phone doesn’t accumulate a long client-side list. */
export const MAX_CUSTOMER_ACTIVE_ORDERS = 12;

export function isActiveOrderVisibleToCustomer(
  order: TrackedOrder | null,
): order is TrackedOrder {
  if (!order) return false;
  const t = Date.parse(order.placedAt);
  if (Number.isNaN(t)) return false;
  return Date.now() - t < CUSTOMER_ACTIVE_ORDER_TTL_MS;
}

export function pruneVisibleActiveOrders(
  orders: TrackedOrder[],
): TrackedOrder[] {
  return orders
    .filter((o) => isActiveOrderVisibleToCustomer(o))
    .slice(0, MAX_CUSTOMER_ACTIVE_ORDERS);
}
