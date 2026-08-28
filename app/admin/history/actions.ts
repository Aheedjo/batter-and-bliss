"use server";

import { z } from "zod";
import {
  ORDER_HISTORY_PAGE_SIZE,
  queryOrderHistory,
  type OrderHistoryQuery,
} from "@/lib/data/orders-admin";
import type { AdminOrderListItem } from "@/lib/admin/admin-order-types";

const querySchema = z.object({
  status: z.enum(["all", "pending", "confirmed", "rejected"]),
  search: z.string().max(200),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
});

export async function fetchOrderHistoryPage(
  rawQuery: OrderHistoryQuery,
  skip: number,
): Promise<{ orders: AdminOrderListItem[]; hasMore: boolean }> {
  const parsed = querySchema.safeParse(rawQuery);
  if (!parsed.success) {
    return { orders: [], hasMore: false };
  }
  const safeSkip = Number.isFinite(skip) && skip >= 0 ? Math.floor(skip) : 0;
  return queryOrderHistory(parsed.data, safeSkip, ORDER_HISTORY_PAGE_SIZE);
}
