import { CalendarClock, Phone } from "lucide-react";
import Link from "next/link";
import type { AdminOrderListItem } from "@/lib/admin/admin-order-types";
import { MarkDeliveredControl } from "@/components/admin/mark-delivered-control";
import { OrderReceiptButton } from "@/components/admin/order-receipt-modal";
import { StatusBadge } from "@/components/admin/admin-order-badges";
import { formatOrderSlotLabel, formatTime, summaryParts } from "@/lib/admin/order-display";
import { formatPrice } from "@/lib/order/money";

export function CompletedOrderCard({
  order,
  renderedAtMs,
}: {
  order: AdminOrderListItem;
  renderedAtMs: number;
}) {
  const { primary, extraPills } = summaryParts(
    order.summaryLines,
    order.customization,
  );
  const doneLabel = order.status === "confirmed" ? "Confirmed" : "Updated";
  const placedLabel = formatOrderSlotLabel(
    order.placedAt,
    order.etaLabel,
    renderedAtMs,
  );

  return (
    <li className="relative rounded-[1.5rem] border border-order-line/70 bg-order-card/95 p-4 opacity-95 shadow-soft ring-1 ring-white/70">
      <Link
        href={`/admin/orders/${order.id}`}
        className="absolute inset-0 z-0 cursor-pointer rounded-[1.5rem] outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-order-brownBtn/50"
        aria-label={`Order ${order.reference} for ${order.placedByName} — view details`}
      />
      <div className="pointer-events-none relative z-10">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-serif text-lg font-semibold italic text-order-brownInk">
              {order.placedByName}
            </p>
            <p className="mt-0.5 font-mono text-[11px] text-order-muted">{order.reference}</p>
          </div>
          <div className="flex shrink-0 items-start gap-2">
            <a
              href={`tel:${order.buyerPhone.replace(/\s/g, "")}`}
              className="pointer-events-auto relative z-20 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-order-line/80 bg-order-bg text-order-taupe transition hover:border-order-brownBtn/25 hover:text-order-brownInk"
              aria-label={`Call ${order.buyerPhone}`}
            >
              <Phone className="h-4 w-4" />
            </a>
            {order.status !== "rejected" ? (
              <OrderReceiptButton order={order} compact />
            ) : null}
            <span>
              <StatusBadge status={order.status} deliveredAt={order.deliveredAt} />
            </span>
          </div>
        </div>

        <div className="mt-3 space-y-3">
          <div className="flex items-center justify-between gap-2 rounded-xl bg-order-beige/40 px-3 py-2.5 font-sans text-sm text-order-brownInk ring-1 ring-order-line/30">
            <span className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 shrink-0 text-order-muted" aria-hidden />
              {placedLabel || formatTime(order.placedAt)}
            </span>
            <span className="text-xs font-medium text-order-muted">{doneLabel}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-sans text-sm text-order-brownInk">
            <span className="leading-snug">{primary}</span>
            {extraPills.map((p, i) => (
              <span
                key={`${order.id}-extra-${i}`}
                className="rounded-full bg-order-bg px-2.5 py-0.5 text-xs font-medium text-order-muted ring-1 ring-order-line/50"
              >
                + {p}
              </span>
            ))}
          </div>

          {order.status === "rejected" && order.rejectionReason ? (
            <p className="rounded-lg border border-order-red-border/70 bg-order-red-bg/60 px-2.5 py-2 font-sans text-xs text-order-red-deep">
              {order.rejectionReason}
            </p>
          ) : null}

          <p className="font-serif text-base font-semibold tabular-nums text-order-brownInk">
            {formatPrice(order.total)}
          </p>
        </div>
      </div>

      {order.status === "confirmed" ? (
        <div className="relative z-20 mt-4 border-t border-order-line/60 pt-4 pointer-events-auto">
          <MarkDeliveredControl
            orderId={order.id}
            deliveredAt={order.deliveredAt}
          />
        </div>
      ) : null}
    </li>
  );
}
