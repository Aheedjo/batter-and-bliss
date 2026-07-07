import { OverviewDashboard } from "@/components/admin/overview-dashboard";
import { orderToAdminListItem } from "@/lib/admin/map-prisma-order";
import { startOfLocalDay } from "@/lib/admin/order-display";
import { prisma } from "@/lib/db";
import { getDailyCapacityState } from "@/lib/order/daily-order-cap";
import { formatShopCapWindowSummary } from "@/lib/order/lagos-calendar";
import {
  buildPublicOrderIntakeSnapshot,
  shopSettingRowToIntakeSettings,
} from "@/lib/order/order-intake";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  // eslint-disable-next-line react-hooks/purity -- per-request clock snapshot
  const renderedAtMs = Date.now();
  const renderedAt = new Date(renderedAtMs);

  const [forStats, pendingRows, pendingInQueue, capacityState, shopRow] =
    await Promise.all([
      prisma.order.findMany({
        select: { placedAt: true, status: true },
      }),
      prisma.order.findMany({
        where: { status: "pending" },
        orderBy: { placedAt: "asc" },
        take: 5,
      }),
      prisma.order.count({ where: { status: "pending" } }),
      getDailyCapacityState(renderedAt),
      prisma.shopSetting.findUnique({ where: { id: "default" } }),
    ]);

  const t0 = startOfLocalDay(renderedAt);
  const todayOrders = forStats.filter(
    (o) => startOfLocalDay(o.placedAt) === t0,
  );

  const stats = {
    totalOrdersToday: todayOrders.length,
    pendingToday: todayOrders.filter((o) => o.status === "pending").length,
    confirmedToday: todayOrders.filter((o) => o.status === "confirmed").length,
    pendingInQueue,
  };

  const recentPending = pendingRows.map(orderToAdminListItem);

  const intakeSnapshot = buildPublicOrderIntakeSnapshot(
    renderedAt,
    shopSettingRowToIntakeSettings(shopRow),
  );

  return (
    <OverviewDashboard
      stats={stats}
      recentPending={recentPending}
      renderedAtMs={renderedAtMs}
      dailyCap={{
        dailyOrderCap: capacityState.cap,
        transferredSlotsToday: capacityState.used,
        capWindowSummary: formatShopCapWindowSummary(renderedAt),
      }}
      intakeSnapshot={intakeSnapshot}
      heroImageUrl={shopRow?.heroImageUrl ?? null}
    />
  );
}
