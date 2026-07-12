import type { AdminOrderListItem } from "@/lib/admin/admin-order-types";

/** Data needed to render a thermal packing slip. */
export type ReceiptOrder = Pick<
  AdminOrderListItem,
  | "reference"
  | "status"
  | "placedAt"
  | "placedByName"
  | "buyerPhone"
  | "deliveryAddress"
  | "note"
  | "total"
  | "customization"
  | "summaryLines"
>;

export const THERMAL_RECEIPT_WIDTH_MM = 72;
