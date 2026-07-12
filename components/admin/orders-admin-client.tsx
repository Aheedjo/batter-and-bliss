"use client";

import {
  ArrowDownUp,
  CalendarClock,
  ChevronDown,
  ChevronUp,
  Clock,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import type { AdminOrderListItem } from "@/lib/admin/admin-order-types";
import { setOrderStatus } from "@/app/admin/orders/actions";
import { MarkDeliveredControl } from "@/components/admin/mark-delivered-control";
import { OrderReceiptButton } from "@/components/admin/order-receipt-modal";
import { StatusBadge } from "@/components/admin/admin-order-badges";
import {
  COMPLETED_ORDERS_VISIBLE_DAYS,
  computeOrderStatusCounts,
  formatOrderSlotLabel,
  formatTime,
  isWithinRecentLocalDays,
  queueHint,
  summaryParts,
} from "@/lib/admin/order-display";
import { formatPrice } from "@/lib/order/money";

type Filter = "pending" | "all" | "confirmed" | "rejected";

function FilterTab({
  active,
  label,
  badge,
  onClick,
}: {
  active: boolean;
  label: string;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative shrink-0 rounded-full px-2.5 py-1.5 pr-3.5 font-sans text-[10px] font-semibold uppercase tracking-[0.14em] transition sm:px-3 sm:py-1.5 sm:pr-4 sm:text-[11px] ${
        active
          ? "bg-order-brownBtn text-white shadow-order-btn ring-1 ring-order-brownBtn/20"
          : "border border-order-line/90 bg-order-card text-order-taupe hover:bg-order-bg hover:text-order-brownInk"
      }`}
      aria-pressed={active}
    >
      {label}
      {badge != null && badge > 0 ? (
        <span
          className={`absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-0.5 font-sans text-[9px] font-bold tabular-nums sm:h-[1.125rem] sm:min-w-[1.125rem] sm:text-[10px] ${
            active
              ? "bg-order-orange-bg text-order-orange-text ring-1 ring-white/80"
              : "bg-order-orange-bg text-order-orange-text ring-1 ring-order-line/40"
          }`}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      ) : null}
    </button>
  );
}

function PendingOrderCard({
  order,
  renderedAtMs,
  rejectingId,
  rejectReason,
  pending,
  onRejectClick,
  onRejectReason,
  onCancelReject,
  onConfirmReject,
  onAccept,
}: {
  order: AdminOrderListItem;
  renderedAtMs: number;
  rejectingId: string | null;
  rejectReason: string;
  pending: boolean;
  onRejectClick: () => void;
  onRejectReason: (v: string) => void;
  onCancelReject: () => void;
  onConfirmReject: () => void;
  onAccept: () => void;
}) {
  const { primary, extraPills } = summaryParts(
    order.summaryLines,
    order.customization,
  );

  return (
    <li className="relative rounded-[1.5rem] border border-order-line/80 bg-order-card p-4 shadow-soft ring-1 ring-white/90">
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
              className="pointer-events-auto relative z-20 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-order-line/80 bg-order-bg text-order-taupe shadow-sm transition hover:border-order-brownBtn/25 hover:text-order-brownInk"
              aria-label={`Call ${order.buyerPhone}`}
            >
              <Phone className="h-4 w-4" />
            </a>
            <OrderReceiptButton order={order} compact />
            <span>
              <StatusBadge status={order.status} deliveredAt={order.deliveredAt} />
            </span>
          </div>
        </div>

        <div className="mt-3 space-y-3">
          <div className="flex items-center justify-between gap-2 rounded-xl bg-order-beige/50 px-3 py-2.5 font-sans text-sm text-order-brownInk ring-1 ring-order-line/35">
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0 text-order-muted" aria-hidden />
              {order.etaLabel ? (
                <span>{order.etaLabel}</span>
              ) : (
                <span>{formatTime(order.placedAt)}</span>
              )}
            </span>
            <span className="shrink-0 text-xs font-medium text-order-muted">
              {queueHint(order.placedAt, renderedAtMs)}
            </span>
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

          <p className="font-sans text-xs leading-relaxed text-order-muted">
            <span className="font-semibold text-order-taupe">Deliver to</span>{" "}
            {order.deliveryAddress}
          </p>

          {order.note ? (
            <p className="font-sans text-xs text-order-muted">
              <span className="font-semibold text-order-taupe">Box card</span>{" "}
              {order.note}
            </p>
          ) : null}

          <p className="font-serif text-base font-semibold tabular-nums text-order-brownInk">
            {formatPrice(order.total)}
          </p>
        </div>
      </div>

      <div className="relative z-20 mt-4 space-y-3 border-t border-order-line/60 pt-4 pointer-events-auto">
        {rejectingId === order.id ? (
          <div className="space-y-2">
            <label className="block font-sans text-xs font-medium text-order-taupe">
              Reason for the customer (required)
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => onRejectReason(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-order-line/90 bg-order-bg px-3 py-2 font-sans text-base text-order-brownInk outline-none transition placeholder:text-order-muted/55 focus:border-order-brownBtn/40 focus:ring-1 focus:ring-order-brownBtn/25"
              placeholder="e.g. We’re fully booked for this slot — try tomorrow?"
            />
            <div className="flex gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={onCancelReject}
                className="rounded-full border border-order-line/90 px-4 py-2.5 font-sans text-sm font-medium text-order-taupe transition hover:bg-order-bg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={pending || !rejectReason.trim()}
                onClick={onConfirmReject}
                className="rounded-full border-2 border-order-red-border bg-order-card px-4 py-2.5 font-sans text-sm font-semibold text-order-red-text transition hover:bg-order-red-bg/50 disabled:opacity-50"
              >
                Confirm reject
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={onRejectClick}
              className="flex-1 rounded-full border-2 border-order-red-border bg-order-card py-3 font-sans text-sm font-semibold text-order-red-text transition hover:bg-order-red-bg/35 disabled:opacity-50"
            >
              Reject
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={onAccept}
              className="flex-1 rounded-full bg-order-brownBtn py-3 font-sans text-sm font-semibold text-white shadow-order-btn ring-1 ring-order-brownBtn/20 transition hover:brightness-110 disabled:opacity-50"
            >
              Accept
            </button>
          </div>
        )}
      </div>
    </li>
  );
}

function CompletedOrderCard({
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

export function OrdersAdminClient({
  orders,
  renderedAtMs,
}: {
  orders: AdminOrderListItem[];
  renderedAtMs: number;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("pending");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [earliestFirst, setEarliestFirst] = useState(true);
  const [completedOpen, setCompletedOpen] = useState(true);

  const statusCounts = useMemo(
    () => computeOrderStatusCounts(orders, renderedAtMs),
    [orders, renderedAtMs],
  );

  const tabCounts = statusCounts;

  const pendingQueue = useMemo(() => {
    let list = orders.filter((o) => o.status === "pending");
    if (filter === "confirmed" || filter === "rejected") list = [];
    else if (filter === "pending") list = orders.filter((o) => o.status === "pending");
    else list = orders.filter((o) => o.status === "pending");
    list = [...list].sort((a, b) => {
      const ta = Date.parse(a.placedAt);
      const tb = Date.parse(b.placedAt);
      return earliestFirst ? ta - tb : tb - ta;
    });
    return list;
  }, [orders, filter, earliestFirst]);

  const recentCompleted = useMemo(() => {
    let list = orders.filter(
      (o) =>
        o.status !== "pending" &&
        isWithinRecentLocalDays(o.updatedAt, renderedAtMs),
    );
    if (filter === "pending") list = [];
    else if (filter === "confirmed")
      list = list.filter((o) => o.status === "confirmed");
    else if (filter === "rejected")
      list = list.filter((o) => o.status === "rejected");
    return [...list].sort((a, b) => {
      const aDelivered =
        a.status === "confirmed" && a.deliveredAt != null;
      const bDelivered =
        b.status === "confirmed" && b.deliveredAt != null;
      if (aDelivered !== bDelivered) return aDelivered ? 1 : -1;
      return Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
    });
  }, [orders, filter, renderedAtMs]);

  function submitStatus(id: string, status: "confirmed" | "rejected", reason?: string) {
    setMessage(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", id);
      fd.set("status", status);
      if (status === "rejected" && reason) fd.set("rejectionReason", reason);
      const res = await setOrderStatus(undefined, fd);
      if (!res.ok) setMessage(res.message);
      else {
        setRejectingId(null);
        setRejectReason("");
        router.refresh();
      }
    });
  }

  const showAction = filter === "all" || filter === "pending";
  const showCompleted =
    filter === "all" || filter === "confirmed" || filter === "rejected";

  return (
    <div className="space-y-5 pt-5 sm:pt-8">
      <h1 className="font-serif text-3xl font-semibold italic tracking-tight text-order-brownInk sm:text-[2rem]">
        Orders
      </h1>

      <p className="font-sans text-[10px] font-bold uppercase tracking-[0.18em] text-order-taupe">
        <span className="text-order-orange-text">{statusCounts.pending} pending</span>
        <span className="mx-1.5 font-normal text-order-muted">•</span>
        <span className="text-emerald-800">{statusCounts.confirmed} confirmed</span>
        <span className="mx-1.5 font-normal text-order-muted">•</span>
        <span className="text-order-red-text">{statusCounts.rejected} rejected</span>
        <span className="mt-0.5 block font-normal normal-case tracking-normal text-order-muted">
          Completed counts are for the last {COMPLETED_ORDERS_VISIBLE_DAYS} days.
        </span>
      </p>

      <div className="flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-2">
        <FilterTab
          active={filter === "pending"}
          label="Pending"
          badge={tabCounts.pending}
          onClick={() => setFilter("pending")}
        />
        <FilterTab
          active={filter === "all"}
          label="All"
          onClick={() => setFilter("all")}
        />
        <FilterTab
          active={filter === "confirmed"}
          label="Confirmed"
          onClick={() => setFilter("confirmed")}
        />
        <FilterTab
          active={filter === "rejected"}
          label="Rejected"
          onClick={() => setFilter("rejected")}
        />
      </div>

      {message ? (
        <p
          className="rounded-xl border border-order-red-border bg-order-red-bg px-3 py-2 font-sans text-sm text-order-red-deep"
          role="alert"
        >
          {message}
        </p>
      ) : null}

      {showAction ? (
        <section id="action-required" className="space-y-3 scroll-mt-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-sans text-sm font-bold text-order-brownInk">
              Action required
            </h2>
            <button
              type="button"
              onClick={() => setEarliestFirst((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-full border border-order-line/80 bg-order-card px-3 py-1.5 font-sans text-[10px] font-semibold uppercase tracking-wide text-order-taupe shadow-sm transition hover:bg-order-bg"
            >
              <ArrowDownUp className="h-3.5 w-3.5" aria-hidden />
              {earliestFirst ? "Earliest first" : "Latest first"}
            </button>
          </div>
          {pendingQueue.length === 0 ? (
            <p className="rounded-[1.25rem] border border-dashed border-order-line/70 bg-order-card/60 px-4 py-8 text-center font-sans text-sm text-order-muted">
              No pending orders in this view.
            </p>
          ) : (
            <ul className="space-y-3">
              {pendingQueue.map((order) => (
                <PendingOrderCard
                  key={order.id}
                  order={order}
                  renderedAtMs={renderedAtMs}
                  rejectingId={rejectingId}
                  rejectReason={rejectReason}
                  pending={pending}
                  onRejectClick={() => setRejectingId(order.id)}
                  onRejectReason={setRejectReason}
                  onCancelReject={() => {
                    setRejectingId(null);
                    setRejectReason("");
                  }}
                  onConfirmReject={() =>
                    submitStatus(order.id, "rejected", rejectReason.trim())
                  }
                  onAccept={() => submitStatus(order.id, "confirmed")}
                />
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {showCompleted ? (
        <section
          className={`space-y-3 ${showAction ? "border-t border-order-line/50 pt-6" : ""}`}
        >
          <button
            type="button"
            onClick={() => setCompletedOpen((o) => !o)}
            className="flex w-full items-center justify-between gap-2 text-left"
          >
            <h2 className="font-sans text-sm font-bold text-order-brownInk">
              Completed (last {COMPLETED_ORDERS_VISIBLE_DAYS} days)
            </h2>
            {completedOpen ? (
              <ChevronUp className="h-5 w-5 shrink-0 text-order-muted" aria-hidden />
            ) : (
              <ChevronDown className="h-5 w-5 shrink-0 text-order-muted" aria-hidden />
            )}
          </button>
          {completedOpen ? (
            recentCompleted.length === 0 ? (
              <p className="rounded-[1.25rem] border border-dashed border-order-line/70 bg-order-card/60 px-4 py-8 text-center font-sans text-sm text-order-muted">
                No completed orders in the last {COMPLETED_ORDERS_VISIBLE_DAYS} days.
              </p>
            ) : (
              <ul className="space-y-3">
                {recentCompleted.map((order) => (
                  <CompletedOrderCard
                    key={order.id}
                    order={order}
                    renderedAtMs={renderedAtMs}
                  />
                ))}
              </ul>
            )
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
