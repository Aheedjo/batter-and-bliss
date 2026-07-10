import { OrdersAdminClient } from "@/components/admin/orders-admin-client";
import { recentCompletedOrdersCutoff } from "@/lib/admin/order-display";
import { orderToAdminListItem } from "@/lib/admin/map-prisma-order";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  // eslint-disable-next-line react-hooks/purity -- per-request clock snapshot
  const renderedAtMs = Date.now();
  const cutoff = recentCompletedOrdersCutoff(renderedAtMs);
  const rows = await prisma.order.findMany({
    where: {
      OR: [{ status: "pending" }, { updatedAt: { gte: cutoff } }],
    },
    orderBy: { placedAt: "desc" },
  });

  const orders = rows.map(orderToAdminListItem);

  return (
    <OrdersAdminClient
      orders={orders}
      renderedAtMs={renderedAtMs}
    />
  );
}
