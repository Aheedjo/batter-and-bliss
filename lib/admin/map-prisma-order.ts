import type { Order } from "@prisma/client";
import type {
  AdminOrderDetail,
  AdminOrderListItem,
  AdminOrderStatus,
} from "@/lib/admin/admin-order-types";
import type { CartSummaryLine } from "@/lib/order/pricing";

function parseStatus(s: string): AdminOrderStatus {
  if (s === "pending" || s === "confirmed" || s === "rejected") return s;
  return "pending";
}

function parseSummaryLines(raw: unknown): CartSummaryLine[] | null {
  if (!Array.isArray(raw)) return null;
  return raw as CartSummaryLine[];
}

export function orderToAdminListItem(o: Order): AdminOrderListItem {
  return {
    id: o.id,
    reference: o.reference,
    status: parseStatus(o.status),
    placedAt: o.placedAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    placedByName: o.placedByName,
    buyerPhone: o.buyerPhone,
    deliveryAddress: o.deliveryAddress,
    stackName: o.stackName,
    customization: o.customization,
    note: o.note,
    total: o.total,
    etaLabel: o.etaLabel,
    rejectionReason: o.rejectionReason,
    deliveredAt: o.deliveredAt,
    summaryLines: parseSummaryLines(o.summaryLines),
  };
}

export function orderToAdminDetail(o: Order): AdminOrderDetail {
  return {
    ...orderToAdminListItem(o),
    expectedBankSenderName: o.expectedBankSenderName,
    email: o.email,
    transferReportedAt: o.transferReportedAt,
  };
}
