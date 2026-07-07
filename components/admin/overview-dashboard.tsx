"use client";

import {
  Bell,
  Check,
  Clock,
  Croissant,
  ListOrdered,
  Phone,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { AdminOrderListItem } from "@/lib/admin/admin-order-types";
import { setOrderStatus } from "@/app/admin/orders/actions";
import { StatusBadge } from "@/components/admin/admin-order-badges";
import {
  formatOrderSlotLabel,
  queueHint,
  summaryParts,
} from "@/lib/admin/order-display";
import { DailyCapSettings } from "@/components/admin/daily-cap-settings";
import { HeroImageSettings } from "@/components/admin/hero-image-settings";
import { OrderIntakeSettingsPanel } from "@/components/admin/order-intake-settings";
import type { PublicOrderIntakeSnapshot } from "@/lib/order/order-intake";

export type OverviewStats = {
  totalOrdersToday: number;
  pendingToday: number;
  confirmedToday: number;
  pendingInQueue: number;
};

export function OverviewDashboard({
  stats,
  recentPending,
  renderedAtMs,
  dailyCap,
  intakeSnapshot,
  heroImageUrl,
}: {
  stats: OverviewStats;
  recentPending: AdminOrderListItem[];
  renderedAtMs: number;
  dailyCap: {
    dailyOrderCap: number | null;
    transferredSlotsToday: number;
    capWindowSummary: string;
  };
  intakeSnapshot: PublicOrderIntakeSnapshot;
  heroImageUrl: string | null;
}) {
  const router = useRouter();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

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

  return (
    <div className="space-y-8 pt-5 sm:pt-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-order-brownInk sm:text-[2rem]">
            Overview
          </h1>
          <p className="mt-1.5 font-sans text-sm text-order-taupe">Welcome back, Admin</p>
        </div>
        <Link
          href="/admin/orders#action-required"
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-order-line/90 bg-order-card text-order-brownInk shadow-soft ring-1 ring-white/80 transition hover:bg-order-bg"
          aria-label={
            stats.pendingInQueue > 0
              ? `${stats.pendingInQueue} order${stats.pendingInQueue === 1 ? "" : "s"} need attention — open Orders`
              : "Open Orders"
          }
        >
          <Bell className="h-5 w-5" strokeWidth={1.75} />
          {stats.pendingInQueue > 0 ? (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-order-card" />
          ) : null}
        </Link>
      </div>

      <DailyCapSettings
        dailyOrderCap={dailyCap.dailyOrderCap}
        transferredSlotsToday={dailyCap.transferredSlotsToday}
        capWindowSummary={dailyCap.capWindowSummary}
      />

      <OrderIntakeSettingsPanel
        snapshot={intakeSnapshot}
        formKey={renderedAtMs}
      />

      <HeroImageSettings heroImageUrl={heroImageUrl} />

      <section className="space-y-3">
        <Link
          href="/admin/orders"
          className="flex items-center justify-between gap-4 rounded-[1.35rem] border border-order-line/80 bg-order-card px-5 py-5 shadow-soft ring-1 ring-white/85 transition hover:border-order-brownBtn/25 hover:bg-order-cream/50"
        >
          <div>
            <p className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-order-taupe">
              Total orders today
            </p>
            <p className="mt-1 font-serif text-4xl font-semibold tabular-nums tracking-tight text-order-brownInk">
              {stats.totalOrdersToday}
            </p>
          </div>
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-order-brownBtn/10 ring-1 ring-order-brownBtn/15">
            <TrendingUp className="h-6 w-6 text-order-brownBtn" strokeWidth={2} aria-hidden />
          </span>
        </Link>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[1.25rem] border border-order-line/75 bg-order-card px-4 py-4 shadow-soft ring-1 ring-white/85">
            <Clock className="h-4 w-4 text-order-brownBtn" strokeWidth={2} aria-hidden />
            <p className="mt-2 font-serif text-3xl font-semibold tabular-nums text-order-brownInk">
              {stats.pendingToday}
            </p>
            <p className="mt-0.5 font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-order-taupe">
              Pending
            </p>
          </div>
          <div className="rounded-[1.25rem] border border-order-confirmed-accent/80 bg-order-confirmed-bg px-4 py-4 shadow-soft ring-1 ring-white/70">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-order-confirmed-accent text-order-confirmed-ink ring-1 ring-order-confirmed-ink/10">
              <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
            </span>
            <p className="mt-2 font-serif text-3xl font-semibold tabular-nums text-order-confirmed-ink">
              {stats.confirmedToday}
            </p>
            <p className="mt-0.5 font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-order-confirmed-ink/85">
              Confirmed
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-lg font-semibold text-order-brownInk">Quick actions</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/admin/orders"
            className="flex flex-col items-center gap-2 rounded-[1.25rem] border border-order-line/80 bg-order-card px-4 py-6 text-center shadow-soft ring-1 ring-white/80 transition hover:border-order-brownBtn/30 hover:bg-order-cream/80"
          >
            <ListOrdered className="h-7 w-7 text-order-brownBtn" strokeWidth={1.75} aria-hidden />
            <span className="font-sans text-sm font-semibold text-order-brownInk">View orders</span>
          </Link>
          <Link
            href="/admin/menu"
            className="flex flex-col items-center gap-2 rounded-[1.25rem] border border-order-line/80 bg-order-card px-4 py-6 text-center shadow-soft ring-1 ring-white/80 transition hover:border-order-brownBtn/30 hover:bg-order-cream/80"
          >
            <Croissant className="h-7 w-7 text-order-brownBtn" strokeWidth={1.75} aria-hidden />
            <span className="font-sans text-sm font-semibold text-order-brownInk">Products</span>
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-serif text-lg font-semibold text-order-brownInk">Recent orders</h2>
          <Link
            href="/admin/orders"
            className="font-sans text-xs font-semibold text-order-brownBtn underline decoration-order-line/80 underline-offset-4 hover:decoration-order-brownBtn"
          >
            See all
          </Link>
        </div>

        {message ? (
          <p
            className="rounded-xl border border-order-red-border bg-order-red-bg px-3 py-2 font-sans text-sm text-order-red-deep"
            role="alert"
          >
            {message}
          </p>
        ) : null}

        {recentPending.length === 0 ? (
          <p className="rounded-[1.25rem] border border-dashed border-order-line/70 bg-order-card/60 px-4 py-10 text-center font-sans text-sm text-order-muted">
            No pending orders right now. New checkouts will show up here.
          </p>
        ) : (
          <ul className="space-y-3">
            {recentPending.map((order) => (
              <OverviewPendingCard
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
    </div>
  );
}

function OverviewPendingCard({
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
  const { primary, extraPills } = summaryParts(order.summaryLines, order.customization);
  const slot = formatOrderSlotLabel(order.placedAt, order.etaLabel, renderedAtMs);

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
            <span>
              <StatusBadge status={order.status} />
            </span>
          </div>
        </div>

        <div className="mt-3 space-y-3">
          <div className="flex items-center justify-between gap-2 rounded-xl bg-order-beige/50 px-3 py-2.5 font-sans text-sm text-order-brownInk ring-1 ring-order-line/35">
            <span className="flex min-w-0 items-center gap-2 truncate">
              <Clock className="h-4 w-4 shrink-0 text-order-muted" aria-hidden />
              <span className="truncate">{slot}</span>
            </span>
            <span className="shrink-0 text-xs font-medium text-order-muted">
              {queueHint(order.placedAt, renderedAtMs)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-sans text-sm text-order-brownInk">
            <span className="leading-snug">{primary}</span>
            {extraPills.map((p) => (
              <span
                key={p}
                className="rounded-full bg-order-bg px-2.5 py-0.5 text-xs font-medium text-order-muted ring-1 ring-order-line/50"
              >
                + {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="pointer-events-auto relative z-20 mt-4 space-y-3 border-t border-order-line/60 pt-4">
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
