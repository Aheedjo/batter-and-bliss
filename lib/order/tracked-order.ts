import type { CartSummaryLine } from "@/lib/order/pricing";
import type { StackId } from "@/lib/order/stacks";

export type TrackedOrderStatus = "pending" | "confirmed" | "rejected";

/** Snapshot for customer track UI. Full history lives in your backend. */
export type TrackedOrder = {
  reference: string;
  stackId: StackId;
  stackName: string;
  customization: string;
  note: string;
  total: number;
  placedAt: string;
  status: TrackedOrderStatus;
  etaLabel?: string;
  rejectionReason?: string;
  /** Customer placing the order (may differ from payer). */
  placedByName?: string;
  /** Reach-by phone for the buyer (kitchen / rider callbacks). */
  buyerPhone?: string;
  /** Name expected on the bank transfer / statement. */
  expectedBankSenderName?: string;
  /** When the customer tapped “I’ve sent the transfer” (client-side ack only). */
  transferReportedAt?: string;
  /** When the shop marked the order delivered. */
  deliveredAt?: string;
  /** Optional — for order updates only. */
  email?: string;
  /** Delivery address (delivery-only flow). */
  deliveryAddress?: string;
  /** Per-line prices for receipt; older orders may omit and use `customization` only. */
  summaryLines?: CartSummaryLine[];
};
