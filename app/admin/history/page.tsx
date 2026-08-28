import { OrderHistoryClient } from "@/components/admin/order-history-client";
import { ORDER_HISTORY_PAGE_SIZE, queryOrderHistory } from "@/lib/data/orders-admin";

export const dynamic = "force-dynamic";

const initialQuery = {
  status: "all" as const,
  search: "",
  dateFrom: null,
  dateTo: null,
};

export default async function AdminOrderHistoryPage() {
  // eslint-disable-next-line react-hooks/purity -- per-request clock snapshot
  const renderedAtMs = Date.now();
  const { orders, hasMore } = await queryOrderHistory(
    initialQuery,
    0,
    ORDER_HISTORY_PAGE_SIZE,
  );

  return (
    <OrderHistoryClient
      initialOrders={orders}
      initialHasMore={hasMore}
      renderedAtMs={renderedAtMs}
    />
  );
}
