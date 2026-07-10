import type { AdminOrderListItem } from "@/lib/admin/admin-order-types";
import type { CartSummaryLine } from "@/lib/order/pricing";

/** Fixed locale + hour12 so SSR and browser match (undefined locale differs by runtime). */
const DISPLAY_LOCALE = "en-US";

/** How long confirmed/rejected orders stay visible in the admin completed list. */
export const COMPLETED_ORDERS_VISIBLE_DAYS = 7;

export function startOfLocalDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function isSameLocalDay(a: Date, b: Date) {
  return startOfLocalDay(a) === startOfLocalDay(b);
}

/** True when `iso` falls on today or the previous `days - 1` local calendar days. */
export function isWithinRecentLocalDays(
  iso: string,
  nowMs: number,
  days: number = COMPLETED_ORDERS_VISIBLE_DAYS,
): boolean {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return false;
  const now = new Date(nowMs);
  const cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  cutoff.setDate(cutoff.getDate() - (days - 1));
  return t >= cutoff.getTime();
}

/** Inclusive start of the oldest local day still shown in the completed list. */
export function recentCompletedOrdersCutoff(
  nowMs: number,
  days: number = COMPLETED_ORDERS_VISIBLE_DAYS,
): Date {
  const now = new Date(nowMs);
  const cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  cutoff.setDate(cutoff.getDate() - (days - 1));
  return cutoff;
}

export function formatTime(iso: string) {
  try {
    return new Intl.DateTimeFormat(DISPLAY_LOCALE, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

/** Header line: "Placed today at 2:15 PM" (stable locale; pass `nowMs` from server for "today"). */
export function formatPlacedSubtitle(iso: string, nowMs: number) {
  try {
    const d = new Date(iso);
    const now = new Date(nowMs);
    if (Number.isNaN(d.getTime())) return "";
    if (isSameLocalDay(d, now)) {
      const t = formatTime(iso);
      return t ? `Placed today at ${t}` : "Placed today";
    }
    const datePart = new Intl.DateTimeFormat(DISPLAY_LOCALE, {
      weekday: "long",
      month: "short",
      day: "numeric",
    }).format(d);
    const t = formatTime(iso);
    return t ? `Placed ${datePart} at ${t}` : `Placed ${datePart}`;
  } catch {
    return "";
  }
}

/** Right side of time bar for pending orders — lightweight queue hint. Pass `nowMs` from the server render for stable hydration. */
export function queueHint(placedAt: string, nowMs: number) {
  const t = Date.parse(placedAt);
  if (Number.isNaN(t)) return "";
  const now = new Date(nowMs);
  const mins = Math.round((nowMs - t) / 60000);
  if (mins < 45) return "Starts soon";
  if (mins < 24 * 60 && isSameLocalDay(new Date(t), now)) return "In queue";
  return "Scheduled";
}

export type TodayOrderStrip = {
  pending: number;
  confirmed: number;
  rejected: number;
};

/** Status counts aligned with the orders list: all pending + completed in the last 7 days. */
export function computeOrderStatusCounts(
  orders: Pick<AdminOrderListItem, "updatedAt" | "status">[],
  nowMs: number,
): TodayOrderStrip & { all: number } {
  const pending = orders.filter((o) => o.status === "pending").length;
  const confirmed = orders.filter(
    (o) =>
      o.status === "confirmed" &&
      isWithinRecentLocalDays(o.updatedAt, nowMs),
  ).length;
  const rejected = orders.filter(
    (o) =>
      o.status === "rejected" &&
      isWithinRecentLocalDays(o.updatedAt, nowMs),
  ).length;
  return { pending, confirmed, rejected, all: pending + confirmed + rejected };
}

/** @deprecated Use computeOrderStatusCounts */
export function computeTodayStrip(
  orders: Pick<AdminOrderListItem, "placedAt" | "updatedAt" | "status">[],
  nowMs: number,
): TodayOrderStrip {
  return computeOrderStatusCounts(orders, nowMs);
}

export function summaryParts(lines: CartSummaryLine[] | null, fallback: string) {
  if (!lines?.length) {
    return { primary: fallback, extraPills: [] as string[] };
  }
  const bits = lines.map((l) =>
    l.kind === "pancake"
      ? `${l.title}${l.details ? ` · ${l.details}` : ""}`
      : `${l.qty}× ${l.name}`,
  );
  const primary = bits[0] ?? fallback;
  const extraPills = bits.slice(1).map((b) => (b.length > 24 ? `${b.slice(0, 22)}…` : b));
  return { primary, extraPills };
}

/** e.g. "Today, 4:30 PM" or a short date when not today */
export function formatOrderSlotLabel(
  iso: string,
  etaLabel: string | null,
  nowMs: number,
) {
  if (etaLabel) return etaLabel;
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    if (isSameLocalDay(d, new Date(nowMs))) {
      const t = formatTime(iso);
      return t ? `Today, ${t}` : "Today";
    }
    return new Intl.DateTimeFormat(DISPLAY_LOCALE, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  } catch {
    return "";
  }
}
