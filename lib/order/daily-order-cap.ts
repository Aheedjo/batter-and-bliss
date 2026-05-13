import { prisma } from "@/lib/db";
import { shopCapWindowBoundsUtc } from "@/lib/order/lagos-calendar";

const SHOP_ID = "default";

/** Count payment-reported slots in the current shop 6am–6am window (WAT). */
export async function countTransferredSlotsForShopCapWindow(
  now: Date = new Date(),
): Promise<number> {
  const { start, end } = shopCapWindowBoundsUtc(now);
  const startIso = start.toISOString();
  const endIso = end.toISOString();
  return prisma.order.count({
    where: {
      status: { in: ["pending", "confirmed"] },
      transferReportedAt: {
        not: null,
        gte: startIso,
        lt: endIso,
      },
    },
  });
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

export function isAtOrOverTransferredSlotCap(
  cap: number | null,
  used: number,
): boolean {
  return cap != null && used >= cap;
}
