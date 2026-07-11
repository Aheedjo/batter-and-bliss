"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { getCustomerOrderStatuses } from "@/app/order/status/actions";
import { SectionHeading } from "@/components/brand/section-heading";
import { CartSummaryLineRow } from "@/components/order/cart-summary-line-row";
import { OrderPaymentFollowUp } from "@/components/order/order-payment-follow-up";
import { StickyAction } from "@/components/order/sticky-action";
import { reportTransferSent } from "@/app/order/checkout/actions";
import type { PublicStack } from "@/lib/data/stacks-public";
import { isUploadedImage } from "@/lib/media/image-src";
import { isActiveOrderVisibleToCustomer } from "@/lib/order/active-order";
import { formatPrice } from "@/lib/order/money";
import type { TrackedOrder } from "@/lib/order/tracked-order";
import { useOrderStore } from "@/lib/stores/order-store";

function formatPlacedAt(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function StatusBadge({ order }: { order: TrackedOrder }) {
  if (order.status === "pending") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-order-orange-bg px-3 py-1 font-sans text-xs font-semibold text-order-orange-text">
        <span className="text-order-orange-dot" aria-hidden>
          ●
        </span>
        Pending
      </span>
    );
  }
  if (order.status === "confirmed") {
    if (order.deliveredAt) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-order-confirmed-bg px-3 py-1 font-sans text-xs font-semibold text-order-confirmed-ink ring-1 ring-order-confirmed-accent/80">
          <span aria-hidden>✓</span> Delivered
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 font-sans text-xs font-semibold text-emerald-900 ring-1 ring-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-100 dark:ring-emerald-800/60">
        <span aria-hidden>✓</span> Confirmed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-order-red-bg px-3 py-1 font-sans text-xs font-semibold text-order-red-text">
      <span aria-hidden>✕</span> Rejected
    </span>
  );
}

function OrderEtaOrRejection({ order }: { order: TrackedOrder }) {
  if (order.status === "confirmed" && order.deliveredAt) {
    return (
      <div className="mt-5 rounded-2xl bg-order-confirmed-bg px-4 py-3 ring-1 ring-order-confirmed-accent/70">
        <p className="font-sans text-sm font-medium text-order-confirmed-ink">
          Your order has been delivered. Enjoy!
        </p>
      </div>
    );
  }
  if (order.status === "confirmed") {
    return (
      <div className="mt-5 rounded-2xl bg-emerald-50/90 px-4 py-3 ring-1 ring-emerald-200/70 dark:bg-emerald-950/30 dark:ring-emerald-800/50">
        <p className="font-sans text-sm font-medium text-emerald-950 dark:text-emerald-100">
          You&apos;re confirmed — your order is in this kitchen day&apos;s run.
        </p>
        {order.etaLabel ? (
          <p className="mt-2 font-serif text-base font-semibold text-emerald-950 dark:text-emerald-50">
            {order.etaLabel}
          </p>
        ) : null}
        <p className="mt-2 font-sans text-[12px] leading-snug text-emerald-800/90 dark:text-emerald-200/85">
          Handoff depends on prep queue and rider routing; we&apos;ll message you
          if anything changes.
        </p>
      </div>
    );
  }
  if (order.status === "pending" && order.etaLabel) {
    return (
      <div className="mt-5 rounded-2xl bg-order-bg px-4 py-3 ring-1 ring-black/[0.03]">
        <div className="flex gap-3">
          <span className="text-lg text-order-taupe" aria-hidden>
            🕐
          </span>
          <div>
            <p className="font-sans text-[10px] font-medium uppercase tracking-wide text-order-muted">
              Estimated delivery
            </p>
            <p className="mt-0.5 font-serif text-base font-semibold text-order-brown">
              {order.etaLabel}
            </p>
            <p className="mt-1 font-sans text-[11px] leading-snug text-order-taupe">
              We confirm your transfer, then slot prep and delivery into this
              kitchen day. If a window is shown above, treat it as an estimate—
              traffic and batch load can shift it slightly.
            </p>
          </div>
        </div>
      </div>
    );
  }
  if (order.status === "rejected" && order.rejectionReason) {
    return (
      <div className="mt-5 rounded-xl border border-order-red-border bg-order-red-bg/50 px-3 py-2.5">
        <p className="flex gap-2 font-sans text-[11px] leading-relaxed text-order-red-deep">
          <span className="shrink-0" aria-hidden>
            ⓘ
          </span>
          {order.rejectionReason}
        </p>
      </div>
    );
  }
  return null;
}

function OrderRow({
  order,
  selected,
  onSelect,
}: {
  order: TrackedOrder;
  selected: boolean;
  onSelect: () => void;
}) {
  const isPending = order.status === "pending";
  const isConfirmed = order.status === "confirmed";
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-start gap-3 rounded-[1.25rem] p-3.5 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-order-brown/20 ${
        selected
          ? "bg-order-card shadow-soft ring-1 ring-order-brown/[0.14]"
          : "bg-order-bg/80 ring-1 ring-black/[0.04] hover:bg-order-bg"
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-serif text-base font-semibold tabular-nums text-order-brownInk">
            {order.reference}
          </span>
          {isPending ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-order-orange-bg px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wide text-order-orange-text">
              <span className="text-order-orange-dot" aria-hidden>
                ●
              </span>
              Pending
            </span>
          ) : isConfirmed ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wide text-emerald-900 ring-1 ring-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-100 dark:ring-emerald-800/60">
              <span aria-hidden>✓</span> Confirmed
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-order-red-bg px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-wide text-order-red-text">
              <span aria-hidden>✕</span> Rejected
            </span>
          )}
        </div>
        <p className="mt-1 truncate font-sans text-[13px] text-order-taupe">
          {order.stackName}
        </p>
        <p className="mt-0.5 font-sans text-[11px] text-order-muted">
          {formatPlacedAt(order.placedAt)}
        </p>
      </div>
      <span className="shrink-0 pt-1 font-sans text-sm font-semibold tabular-nums text-order-brownDark">
        {formatPrice(order.total)}
      </span>
    </button>
  );
}

function ActiveOrderReceipt({
  order,
  stackById,
  className = "mt-8",
  showInlinePaymentAction = true,
}: {
  order: TrackedOrder;
  stackById: Map<string, PublicStack>;
  className?: string;
  showInlinePaymentAction?: boolean;
}) {
  const stackImage = stackById.get(order.stackId);

  return (
    <section
      className={`rounded-[1.75rem] bg-order-card p-5 shadow-card ring-1 ring-black/[0.05] ${className}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-order-muted">
            Order reference
          </p>
          <p className="mt-1 font-serif text-2xl font-semibold text-order-brownInk">
            {order.reference}
          </p>
          <p className="mt-2 font-sans text-[13px] text-order-taupe">
            {order.stackName}
            <span className="text-order-muted"> · </span>
            <span className="text-order-muted">
              {formatPlacedAt(order.placedAt)}
            </span>
          </p>
        </div>
        <StatusBadge order={order} />
      </div>

      <OrderEtaOrRejection order={order} />

      <div className="my-5 border-t border-order-line/80" />

      <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-order-muted">
        Items
      </p>
      {order.summaryLines?.length ? (
        <ul className="mt-3 space-y-4">
          {order.summaryLines.map((item, i) => (
            <CartSummaryLineRow
              key={`${item.kind}-${i}-${item.kind === "pancake" ? item.title : item.name}`}
              item={item}
            />
          ))}
        </ul>
      ) : (
        <div className="mt-3 flex gap-3">
          {stackImage ? (
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-1 ring-black/[0.06]">
              <Image
                src={stackImage.image}
                alt={stackImage.alt}
                fill
                className="object-cover"
                sizes="56px"
                unoptimized={isUploadedImage(stackImage.image)}
              />
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="font-sans text-sm font-bold text-order-brownDark">
                {order.stackName}
              </p>
              <span className="shrink-0 font-sans text-sm font-semibold text-order-taupe">
                x1
              </span>
            </div>
            <p className="mt-1 font-sans text-xs text-order-muted">
              {order.customization}
            </p>
          </div>
        </div>
      )}
      {order.note ? (
        <p className="mt-3 flex items-center gap-1 rounded-xl bg-order-bg/80 px-3 py-2 font-sans text-xs text-order-muted ring-1 ring-order-line/40">
          <span aria-hidden>✎</span>
          {order.note}
        </p>
      ) : null}
      {order.buyerPhone ? (
        <div className="mt-3 rounded-xl bg-order-bg/80 px-3 py-2.5 ring-1 ring-order-line/40">
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-order-muted">
            Your phone
          </p>
          <p className="mt-1 font-sans text-[13px] font-semibold tabular-nums text-order-brownDark">
            {order.buyerPhone}
          </p>
        </div>
      ) : null}
      {order.email ? (
        <div className="mt-3 rounded-xl bg-order-bg/80 px-3 py-2.5 ring-1 ring-order-line/40">
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-order-muted">
            Email
          </p>
          <p className="mt-1 break-all font-sans text-[13px] text-order-brownDark">
            {order.email}
          </p>
        </div>
      ) : null}
      {order.deliveryAddress ? (
        <div className="mt-3 rounded-xl bg-order-bg/80 px-3 py-2.5 ring-1 ring-order-line/40">
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-order-muted">
            Deliver to
          </p>
          <p className="mt-1 font-sans text-[13px] leading-relaxed text-order-brownDark">
            {order.deliveryAddress}
          </p>
        </div>
      ) : null}
      <div className="mt-3 border-t border-order-line/80 pt-3">
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-sans text-[13px] font-bold uppercase tracking-wide text-order-muted">
            Total
          </span>
          <span className="font-serif text-xl font-semibold tabular-nums tracking-tight text-order-brownInk">
            {formatPrice(order.total)}
          </span>
        </div>
      </div>

      <div id={`payment-${order.reference}`}>
        <OrderPaymentFollowUp
          order={order}
          showActionButton={showInlinePaymentAction}
        />
      </div>
    </section>
  );
}

export function StatusClient({ stacks }: { stacks: PublicStack[] }) {
  const searchParams = useSearchParams();
  const activeOrders = useOrderStore((s) => s.activeOrders);
  const trackSelectedRef = useOrderStore((s) => s.trackSelectedRef);
  const setTrackSelectedRef = useOrderStore((s) => s.setTrackSelectedRef);
  const pruneStaleActiveOrders = useOrderStore((s) => s.pruneStaleActiveOrders);
  const markTransferSent = useOrderStore((s) => s.markTransferSent);
  const mergeActiveOrderServerState = useOrderStore(
    (s) => s.mergeActiveOrderServerState,
  );
  const [stickyError, setStickyError] = useState<string | null>(null);
  const [stickyPending, startStickyReport] = useTransition();

  const refFromUrl = searchParams.get("ref");
  const focusParam = searchParams.get("focus");

  useEffect(() => {
    pruneStaleActiveOrders();
  }, [pruneStaleActiveOrders]);

  useEffect(() => {
    if (
      refFromUrl &&
      activeOrders.some(
        (o) => o.reference === refFromUrl && isActiveOrderVisibleToCustomer(o),
      )
    ) {
      setTrackSelectedRef(refFromUrl);
    }
  }, [refFromUrl, activeOrders, setTrackSelectedRef]);

  const visibleOrders = useMemo(
    () => activeOrders.filter(isActiveOrderVisibleToCustomer),
    [activeOrders],
  );
  const visibleRefsKey = useMemo(
    () => visibleOrders.map((o) => o.reference).sort().join("|"),
    [visibleOrders],
  );

  const selected = useMemo(() => {
    if (!visibleOrders.length) return null;
    const byRef = trackSelectedRef
      ? visibleOrders.find((o) => o.reference === trackSelectedRef)
      : null;
    return byRef ?? visibleOrders[0];
  }, [visibleOrders, trackSelectedRef]);

  const multiple = visibleOrders.length > 1;
  const stackById = useMemo(() => new Map(stacks.map((s) => [s.id, s])), [stacks]);
  const showStickyPaymentAction = Boolean(
    selected &&
      selected.status === "pending" &&
      !selected.transferReportedAt,
  );

  useEffect(() => {
    if (!selected || focusParam !== "payment") return;
    const id = `payment-${selected.reference}`;
    const t = window.setTimeout(() => {
      const el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 180);
    return () => window.clearTimeout(t);
  }, [focusParam, selected]);

  useEffect(() => {
    const refs = visibleRefsKey ? visibleRefsKey.split("|") : [];
    if (refs.length === 0) return;
    let cancelled = false;

    async function syncOnce() {
      try {
        const rows = await getCustomerOrderStatuses(refs);
        if (!cancelled) mergeActiveOrderServerState(rows);
      } catch {
        // keep local snapshot if sync fails
      }
    }

    void syncOnce();
    const iv = window.setInterval(() => {
      void syncOnce();
    }, 15000);
    return () => {
      cancelled = true;
      window.clearInterval(iv);
    };
  }, [visibleRefsKey, mergeActiveOrderServerState]);

  return (
    <div
      className={`mx-auto max-w-lg px-5 pt-6 sm:px-6 ${showStickyPaymentAction ? "pb-24" : "pb-16"}`}
    >
      <header className="flex items-start justify-between gap-4">
        <SectionHeading
          eyebrow="Track"
          title={multiple ? "Your orders" : "Your order"}
          description={
            multiple
              ? "Tap an order to see its status. Only recent in-progress orders show here; we keep full records on our side."
              : "In-progress orders only. When yours is done, it disappears from here after a while—no clutter. We keep full records on our side."
          }
          className="min-w-0"
        />
        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-order-line/60 bg-order-card text-order-brown shadow-soft"
          aria-label="Receipt"
        >
          <span className="text-lg" aria-hidden>
            🧾
          </span>
        </button>
      </header>

      {visibleOrders.length === 0 ? (
        <div className="mt-12 rounded-[1.75rem] bg-order-card px-6 py-10 text-center shadow-card ring-1 ring-black/[0.05]">
          <p className="font-serif text-lg text-order-brownInk">
            Nothing to track right now
          </p>
          <p className="mt-2 font-sans text-sm leading-relaxed text-order-taupe">
            Place an order and you&apos;ll see its status here until it&apos;s
            done.
          </p>
          <Link
            href="/order/stack"
            className="mt-8 inline-flex rounded-full bg-order-brownBtn px-6 py-3 font-serif text-sm font-semibold text-white shadow-order-btn ring-1 ring-order-brownBtn/15 transition hover:brightness-110"
          >
            Start an order
          </Link>
        </div>
      ) : (
        <>
          {multiple ? (
            <section className="mt-8">
              <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-order-muted">
                Choose an order
              </p>
              <ul className="mt-3 flex flex-col gap-2">
                {visibleOrders.map((order) => (
                  <li key={order.reference}>
                    <OrderRow
                      order={order}
                      selected={selected?.reference === order.reference}
                      onSelect={() => setTrackSelectedRef(order.reference)}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {selected ? (
            <>
              {multiple ? (
                <p className="mt-8 font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-order-muted">
                  Details — {selected.reference}
                </p>
              ) : null}
              <ActiveOrderReceipt
                order={selected}
                stackById={stackById}
                className={multiple ? "mt-3" : "mt-8"}
                showInlinePaymentAction={!showStickyPaymentAction}
              />
            </>
          ) : null}
        </>
      )}

      <Link
        href="/order/stack"
        className={`block text-center font-sans text-sm font-semibold text-order-brownInk underline-offset-4 hover:underline ${showStickyPaymentAction ? "mt-28" : "mt-10"}`}
      >
        Start a new order
      </Link>

      {showStickyPaymentAction && selected ? (
        <StickyAction>
          <>
            {stickyError ? (
              <p className="mb-2 rounded-xl border border-red-200/80 bg-red-50 px-3 py-2 text-center font-sans text-[12px] leading-snug text-red-800 dark:border-red-800/70 dark:bg-red-950/50 dark:text-red-100">
                {stickyError}
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => {
                setStickyError(null);
                startStickyReport(async () => {
                  const res = await reportTransferSent(selected.reference);
                  if (!res.ok) {
                    setStickyError(res.message);
                    return;
                  }
                  markTransferSent(selected.reference);
                });
              }}
              disabled={stickyPending}
              className={`w-full rounded-full bg-order-brownBtn py-[1.05rem] font-serif text-[15px] font-semibold tracking-[0.01em] text-white shadow-order-btn ring-1 ring-order-brownBtn/20 transition hover:brightness-110 active:scale-[0.99] ${stickyPending ? "pointer-events-none opacity-60" : ""}`}
            >
              {stickyPending ? "Saving…" : "I've sent the transfer"}
            </button>
          </>
        </StickyAction>
      ) : null}
    </div>
  );
}
