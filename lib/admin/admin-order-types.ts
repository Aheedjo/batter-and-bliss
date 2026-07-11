import type { CartSummaryLine } from "@/lib/order/pricing";

export type AdminOrderStatus = "pending" | "confirmed" | "rejected";

export type AdminOrderListItem = {
  id: string;
  reference: string;
  status: AdminOrderStatus;
  placedAt: string;
  /** Used for “Completed today” (status changed same local day). */
  updatedAt: string;
  placedByName: string;
  buyerPhone: string;
  deliveryAddress: string;
  stackName: string;
  customization: string;
  note: string;
  total: number;
  etaLabel: string | null;
  rejectionReason: string | null;
  deliveredAt: string | null;
  summaryLines: CartSummaryLine[] | null;
};

export type AdminOrderDetail = AdminOrderListItem & {
  expectedBankSenderName: string;
  email: string | null;
  transferReportedAt: string | null;
};
