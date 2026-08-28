import Link from "next/link";
import type { AdminOrderListItem } from "@/lib/admin/admin-order-types";
import { StatusBadge } from "@/components/admin/admin-order-badges";
import { formatOrderSlotLabel, summaryParts } from "@/lib/admin/order-display";
import { formatPrice } from "@/lib/order/money";

export function OrderHistoryRow({
  order,
  renderedAtMs,
}: {
  order: AdminOrderListItem;
  renderedAtMs: number;
}) {
  const { primary } = summaryParts(order.summaryLines, order.customization);
  const placedLabel = formatOrderSlotLabel(order.placedAt, order.etaLabel, renderedAtMs);

  return (
    <li className="relative rounded-2xl border border-order-line/70 bg-order-card/95 px-4 py-3 shadow-soft ring-1 ring-white/70">
      <Link
        href={`/admin/orders/${order.id}`}
        className="absolute inset-0 rounded-2xl outline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-order-brownBtn/50"
        aria-label={`Order ${order.reference} for ${order.placedByName} — view details`}
      />
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <p className="truncate font-serif text-[15px] font-semibold italic text-order-brownInk">
              {order.placedByName}
            </p>
            <span className="shrink-0 font-mono text-[10px] text-order-muted">
              {order.reference}
            </span>
          </div>
          <p className="mt-0.5 truncate font-sans text-xs text-order-muted">
            {placedLabel} · {primary}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <StatusBadge status={order.status} deliveredAt={order.deliveredAt} />
          <span className="font-serif text-sm font-semibold tabular-nums text-order-brownInk">
            {formatPrice(order.total)}
          </span>
        </div>
      </div>
    </li>
  );
}
