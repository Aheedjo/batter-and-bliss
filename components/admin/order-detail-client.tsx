"use client";

import {
  ArrowLeft,
  Check,
  Clock,
  MapPin,
  PenLine,
  Phone,
  User,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { AdminOrderDetail } from "@/lib/admin/admin-order-types";
import { setOrderStatus } from "@/app/admin/orders/actions";
import { StatusBadge } from "@/components/admin/admin-order-badges";
import type { CartSummaryLine } from "@/lib/order/pricing";
import { formatPrice } from "@/lib/order/money";

function ItemBlock({ line, index }: { line: CartSummaryLine; index: number }) {
  if (line.kind === "pancake") {
    return (
      <div key={index} className="border-b border-order-line/50 py-5 last:border-b-0">
        <div className="flex items-start justify-between gap-3">
          <p className="font-sans text-sm font-semibold text-order-brownInk">
            1× {line.title}
          </p>
          <p className="shrink-0 font-serif text-sm font-semibold tabular-nums text-order-brownInk">
            {formatPrice(line.lineTotal)}
          </p>
        </div>
        <p className="mt-1.5 font-sans text-xs leading-relaxed text-order-muted">
          {line.details ? `+ ${line.details}` : "No extras"}
        </p>
      </div>
    );
  }
  return (
    <div
      key={index}
      className="flex items-start justify-between gap-3 border-b border-order-line/50 py-5 last:border-b-0"
    >
      <p className="font-sans text-sm font-semibold text-order-brownInk">
        {line.qty}× {line.name}
      </p>
      <p className="shrink-0 font-serif text-sm font-semibold tabular-nums text-order-brownInk">
        {formatPrice(line.lineTotal)}
      </p>
    </div>
  );
}

export function OrderDetailClient({
  order,
  placedSubtitle,
  deliverySlotLabel,
}: {
  order: AdminOrderDetail;
  placedSubtitle: string;
  deliverySlotLabel: string;
}) {
  const router = useRouter();
  const [rejectReason, setRejectReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const lines = order.summaryLines ?? [];
  const showNote = order.note.trim().length > 0;
  const isPending = order.status === "pending";

  function submit(status: "confirmed" | "rejected", reason?: string) {
    setMessage(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", order.id);
      fd.set("status", status);
      if (status === "rejected" && reason) fd.set("rejectionReason", reason);
      const res = await setOrderStatus(undefined, fd);
      if (!res.ok) setMessage(res.message);
      else {
        setRejectReason("");
        router.refresh();
      }
    });
  }

  const paymentHeadline = order.transferReportedAt
    ? "Customer reported bank transfer"
    : order.status === "confirmed"
      ? "Order confirmed"
      : order.status === "rejected"
        ? "Order rejected"
        : "Awaiting transfer confirmation";

  const paymentIcon =
    order.transferReportedAt || order.status === "confirmed" ? (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200/80">
        <Check className="h-5 w-5" strokeWidth={2.5} aria-hidden />
      </span>
    ) : order.status === "rejected" ? (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-order-red-bg text-order-red-text ring-1 ring-order-red-border/60">
        <Wallet className="h-5 w-5" aria-hidden />
      </span>
    ) : (
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-order-bg text-order-muted ring-1 ring-order-line/70">
        <Wallet className="h-5 w-5" aria-hidden />
      </span>
    );

  return (
    <div className="space-y-6 pb-28 pt-5 sm:space-y-8 sm:pb-32 sm:pt-8">
      <div className="flex items-start gap-3">
        <Link
          href="/admin/orders"
          className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-order-line/90 bg-order-card text-order-brownInk shadow-sm ring-1 ring-white/80 transition hover:bg-order-bg"
          aria-label="Back to orders"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h1 className="font-serif text-2xl font-semibold tracking-tight text-order-brownInk sm:text-3xl">
                Order {order.reference}
              </h1>
              <p className="mt-1 font-sans text-sm text-order-muted">{placedSubtitle}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>
        </div>
      </div>

      <section className="space-y-2">
        <h2 className="font-serif text-lg font-semibold text-order-brownInk">Customer</h2>
        <div className="rounded-[1.35rem] border border-order-line/80 bg-order-card p-4 shadow-soft ring-1 ring-white/90">
          <div className="flex gap-3 border-b border-order-line/50 py-3 first:pt-0">
            <User className="mt-0.5 h-4 w-4 shrink-0 text-order-muted" aria-hidden />
            <p className="font-sans text-sm text-order-brownInk">{order.placedByName}</p>
          </div>
          <div className="flex gap-3 border-b border-order-line/50 py-3">
            <Phone className="mt-0.5 h-4 w-4 shrink-0 text-order-muted" aria-hidden />
            <a
              href={`tel:${order.buyerPhone.replace(/\s/g, "")}`}
              className="font-sans text-sm font-medium text-order-brownBtn hover:underline"
            >
              {order.buyerPhone}
            </a>
          </div>
          <div className="flex gap-3 border-b border-order-line/50 py-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-order-muted" aria-hidden />
            <p className="font-sans text-sm leading-relaxed text-order-brownInk">
              {order.deliveryAddress}
            </p>
          </div>
          <div className="flex gap-3 pt-3">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-order-muted" aria-hidden />
            <div>
              <p className="font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-order-taupe">
                Delivery time
              </p>
              <p className="mt-0.5 font-sans text-sm font-semibold text-order-brownInk">
                {deliverySlotLabel}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="font-serif text-lg font-semibold text-order-brownInk">Order items</h2>
        <div className="rounded-[1.35rem] border border-order-line/80 bg-order-card px-4 shadow-soft ring-1 ring-white/90">
          {lines.length > 0 ? (
            lines.map((line, i) => <ItemBlock key={i} line={line} index={i} />)
          ) : (
            <p className="px-1 py-8 font-sans text-sm text-order-muted">{order.customization}</p>
          )}
        </div>
      </section>

      {showNote ? (
        <section className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-serif text-lg font-semibold text-order-brownInk">Box note</h2>
            <span className="rounded-full bg-order-brownBtn px-2.5 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wide text-white">
              Important
            </span>
          </div>
          <div className="relative overflow-hidden rounded-[1.35rem] border border-order-line/60 bg-order-beige/40 px-4 py-5 shadow-inner ring-1 ring-order-line/30">
            <span
              className="pointer-events-none absolute -right-4 -bottom-6 text-[7rem] leading-none text-order-line/25"
              aria-hidden
            >
              ♥
            </span>
            <p className="relative font-serif text-lg font-semibold italic leading-snug text-order-brownInk">
              &ldquo;{order.note.trim()}&rdquo;
            </p>
            <p className="relative mt-4 flex items-center gap-2 font-sans text-[10px] font-bold uppercase tracking-[0.14em] text-order-taupe">
              <PenLine className="h-3.5 w-3.5" aria-hidden />
              Must be written on box
            </p>
          </div>
        </section>
      ) : null}

      <section className="space-y-2">
        <h2 className="font-serif text-lg font-semibold text-order-brownInk">Payment</h2>
        <div className="flex gap-3 rounded-[1.35rem] border border-order-line/80 bg-order-card p-4 shadow-soft ring-1 ring-white/90">
          {paymentIcon}
          <div>
            <p className="font-sans text-sm font-semibold text-order-brownInk">{paymentHeadline}</p>
            <p className="mt-1 font-sans text-xs text-order-muted">
              Expected sender name:{" "}
              <span className="font-medium text-order-taupe">{order.expectedBankSenderName}</span>
            </p>
            {order.email ? (
              <p className="mt-0.5 font-sans text-xs text-order-muted">
                Email: <span className="text-order-taupe">{order.email}</span>
              </p>
            ) : null}
            <p className="mt-2 font-serif text-base font-semibold tabular-nums text-order-brownInk">
              {formatPrice(order.total)} total
            </p>
          </div>
        </div>
      </section>

      {order.status === "rejected" && order.rejectionReason ? (
        <p className="rounded-xl border border-order-red-border bg-order-red-bg px-3 py-2 font-sans text-sm text-order-red-deep">
          {order.rejectionReason}
        </p>
      ) : null}

      {isPending ? (
        <section className="space-y-3 border-t border-order-line/50 pt-6">
          {message ? (
            <p
              className="rounded-xl border border-order-red-border bg-order-red-bg px-3 py-2 font-sans text-sm text-order-red-deep"
              role="alert"
            >
              {message}
            </p>
          ) : null}
          <label className="block font-sans text-[10px] font-bold uppercase tracking-[0.14em] text-order-taupe">
            Reason for rejection (if rejecting)
          </label>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={2}
            disabled={pending}
            className="w-full rounded-xl border border-order-line/90 bg-order-bg px-3 py-2 font-sans text-base text-order-brownInk outline-none transition placeholder:text-order-muted/55 focus:border-order-brownBtn/40 focus:ring-1 focus:ring-order-brownBtn/25 disabled:opacity-60"
            placeholder="E.g., Fully booked for this slot…"
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pending}
              onClick={() => submit("rejected", rejectReason.trim())}
              className="flex-1 rounded-full border-2 border-order-red-border bg-order-card py-3.5 font-sans text-sm font-semibold text-order-red-text transition hover:bg-order-red-bg/35 disabled:opacity-50"
            >
              Reject
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => submit("confirmed")}
              className="flex-1 rounded-full bg-order-brownBtn py-3.5 font-sans text-sm font-semibold text-white shadow-order-btn ring-1 ring-order-brownBtn/20 transition hover:brightness-110 disabled:opacity-50"
            >
              Accept order
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
