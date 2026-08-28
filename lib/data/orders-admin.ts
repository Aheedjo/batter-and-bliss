import type { Prisma } from "@prisma/client";
import { orderToAdminListItem } from "@/lib/admin/map-prisma-order";
import type { AdminOrderListItem } from "@/lib/admin/admin-order-types";
import { prisma } from "@/lib/db";

export const ORDER_HISTORY_PAGE_SIZE = 20;

export type OrderHistoryStatusFilter = "all" | "pending" | "confirmed" | "rejected";

export type OrderHistoryQuery = {
  status: OrderHistoryStatusFilter;
  /** Matches customer name, phone, or reference (contains, case-insensitive). */
  search: string;
  /** Inclusive, local calendar dates as "YYYY-MM-DD". */
  dateFrom: string | null;
  dateTo: string | null;
};

function parseLocalDate(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const [, y, mo, d] = m;
  const date = new Date(Number(y), Number(mo) - 1, Number(d));
  return Number.isNaN(date.getTime()) ? null : date;
}

function buildWhere(query: OrderHistoryQuery): Prisma.OrderWhereInput {
  const where: Prisma.OrderWhereInput = {};

  if (query.status !== "all") {
    where.status = query.status;
  }

  const search = query.search.trim();
  if (search) {
    where.OR = [
      { placedByName: { contains: search, mode: "insensitive" } },
      { buyerPhone: { contains: search, mode: "insensitive" } },
      { reference: { contains: search, mode: "insensitive" } },
    ];
  }

  const from = query.dateFrom ? parseLocalDate(query.dateFrom) : null;
  const to = query.dateTo ? parseLocalDate(query.dateTo) : null;
  if (from || to) {
    where.placedAt = {};
    if (from) where.placedAt.gte = from;
    if (to) {
      const end = new Date(to);
      end.setDate(end.getDate() + 1);
      where.placedAt.lt = end;
    }
  }

  return where;
}

export async function queryOrderHistory(
  query: OrderHistoryQuery,
  skip: number,
  take: number = ORDER_HISTORY_PAGE_SIZE,
): Promise<{ orders: AdminOrderListItem[]; hasMore: boolean }> {
  const where = buildWhere(query);
  const rows = await prisma.order.findMany({
    where,
    orderBy: { placedAt: "desc" },
    skip,
    take: take + 1,
  });
  const hasMore = rows.length > take;
  const page = hasMore ? rows.slice(0, take) : rows;
  return { orders: page.map(orderToAdminListItem), hasMore };
}
