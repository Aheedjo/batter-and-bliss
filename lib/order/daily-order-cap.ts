import { prisma } from "@/lib/db";
import { DRINKS_ONLY_STACK_ID } from "@/lib/order/drinks-only";
import { shopCapWindowBoundsUtc } from "@/lib/order/lagos-calendar";
import type { CartSummaryLine } from "@/lib/order/pricing";

const SHOP_ID = "default";

function parseSummaryLines(raw: unknown): CartSummaryLine[] | null {
  if (!Array.isArray(raw)) return null;
  return raw as CartSummaryLine[];
}

/** Pancake packages in a cart snapshot (one line per stack ordered). */
export function countPancakesInSummaryLines(
  lines: readonly CartSummaryLine[] | null | undefined,
): number {
  if (!lines?.length) return 0;
  return lines.filter((l) => l.kind === "pancake").length;
}

export function countPancakesInOrder(order: {
  summaryLines: unknown;
  stackId: string;
}): number {
  if (order.stackId === DRINKS_ONLY_STACK_ID) return 0;
  const fromLines = countPancakesInSummaryLines(parseSummaryLines(order.summaryLines));
  // Legacy orders before summaryLines existed: treat as one pancake package.
  return fromLines > 0 ? fromLines : 1;
}

export function wouldExceedPancakeCap(
  cap: number | null,
  used: number,
  additionalPancakes: number,
): boolean {
  return cap != null && used + additionalPancakes > cap;
}

/**
 * Count payment-reported pancake packages in the current shop 6am–6am window (WAT).
 * Drinks-only orders don't use the kitchen, so they never consume capacity.
 */
export async function countTransferredSlotsForShopCapWindow(
  now: Date = new Date(),
): Promise<number> {
  const { start, end } = shopCapWindowBoundsUtc(now);
  const startIso = start.toISOString();
  const endIso = end.toISOString();
  const orders = await prisma.order.findMany({
    where: {
      status: { in: ["pending", "confirmed"] },
      stackId: { not: DRINKS_ONLY_STACK_ID },
      transferReportedAt: {
        not: null,
        gte: startIso,
        lt: endIso,
      },
    },
    select: { summaryLines: true, stackId: true },
  });
  return orders.reduce((sum, order) => sum + countPancakesInOrder(order), 0);
}

export async function getDailyOrderCap(): Promise<number | null> {
  const row = await prisma.shopSetting.findUnique({
    where: { id: SHOP_ID },
    select: { dailyOrderCap: true },
  });
  const c = row?.dailyOrderCap;
  if (c == null) return null;
  if (!Number.isFinite(c) || c < 1) return null;
  return Math.floor(c);
}

export async function getDailyCapacityState(
  now: Date = new Date(),
): Promise<{ cap: number | null; used: number }> {
  const [cap, used] = await Promise.all([
    getDailyOrderCap(),
    countTransferredSlotsForShopCapWindow(now),
  ]);
  return { cap, used };
}
