import { OrdersAdminClient } from "@/components/admin/orders-admin-client";
import { computeTodayStrip } from "@/lib/admin/order-display";
import { orderToAdminListItem } from "@/lib/admin/map-prisma-order";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  // eslint-disable-next-line react-hooks/purity -- per-request clock snapshot
  const renderedAtMs = Date.now();
  const rows = await prisma.order.findMany({
    orderBy: { placedAt: "desc" },
  });

  const orders = rows.map(orderToAdminListItem);
  const todayStrip = computeTodayStrip(orders, renderedAtMs);

  return (
    <OrdersAdminClient
      orders={orders}
      renderedAtMs={renderedAtMs}
      todayStrip={todayStrip}
    />
  );
}
