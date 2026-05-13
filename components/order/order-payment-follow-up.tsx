"use client";

import { useCallback, useState, useTransition } from "react";
import { reportTransferSent } from "@/app/order/checkout/actions";
import { BankTransferPanel } from "@/components/order/bank-transfer-panel";
import type { TrackedOrder } from "@/lib/order/tracked-order";
import { SHOP_TIMEZONE } from "@/lib/order/lagos-calendar";
import { useOrderStore } from "@/lib/stores/order-store";

const btnOutline =
  "mt-4 w-full rounded-full border-2 border-order-brownBtn/35 bg-order-card py-3.5 font-serif text-[14px] font-semibold tracking-[0.01em] text-order-brownInk shadow-sm transition hover:border-order-brownBtn/55 hover:bg-order-bg active:scale-[0.99]";

function formatReportedAt(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZone: SHOP_TIMEZONE,
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

type Props = {
  order: TrackedOrder;
  showActionButton?: boolean;
};

/** Pending bank transfer: names for matching, account panel, “I’ve sent” ack (persisted). */
export function OrderPaymentFollowUp({
  order,
  showActionButton = true,
}: Props) {
  const markTransferSent = useOrderStore((s) => s.markTransferSent);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportPending, startReport] = useTransition();

  const onSent = useCallback(() => {
    setReportError(null);
    startReport(async () => {
      const res = await reportTransferSent(order.reference);
      if (!res.ok) {
        setReportError(res.message);
        return;
      }
      markTransferSent(order.reference);
    });
  }, [markTransferSent, order.reference]);

  if (order.status !== "pending") return null;

  const placer = order.placedByName?.trim();
  const payer = order.expectedBankSenderName?.trim();

  return (
    <div className="mt-5 border-t border-order-line/80 pt-5">
      <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-order-muted">
        Payment
      </p>
      <p className="mt-2 font-sans text-[12px] leading-relaxed text-order-taupe">
        We&apos;ll confirm when your transfer shows on our side.
        {placer || payer
          ? " The details below help us match your payment."
          : null}
      </p>
      {(placer || payer) && (
        <ul className="mt-3 space-y-2 rounded-2xl bg-order-bg px-3 py-3 ring-1 ring-black/[0.04]">
          {placer ? (
            <li>
              <p className="font-sans text-[10px] font-semibold uppercase tracking-wide text-order-muted">
                Order placed by
              </p>
              <p className="mt-0.5 font-sans text-sm font-medium text-order-brownDark">
                {placer}
              </p>
            </li>
          ) : null}
          {payer ? (
            <li>
              <p className="font-sans text-[10px] font-semibold uppercase tracking-wide text-order-muted">
                Name we should see on the transfer
              </p>
              <p className="mt-0.5 font-sans text-sm font-medium text-order-brownDark">
                {payer}
              </p>
            </li>
          ) : null}
        </ul>
      )}

      <BankTransferPanel
        reference={order.reference}
        amount={order.total}
        className="mt-4"
      />

      {order.transferReportedAt ? (
        <div className="mt-4 rounded-2xl bg-emerald-50/90 px-4 py-3 ring-1 ring-emerald-200/80 dark:bg-emerald-950/40 dark:ring-emerald-800/50">
          <p className="font-sans text-sm font-semibold text-emerald-900 dark:text-emerald-100">
            Thanks — we&apos;ll verify your payment
          </p>
          <p className="mt-1 font-sans text-[12px] leading-snug text-emerald-800/90 dark:text-emerald-200/85">
            You marked this transfer as sent{" "}
            {formatReportedAt(order.transferReportedAt)}. We&apos;ll move your order along once the funds land.
          </p>
        </div>
      ) : showActionButton ? (
        <>
          <button
            type="button"
            onClick={onSent}
            disabled={reportPending}
            className={`${btnOutline} ${reportPending ? "pointer-events-none opacity-60" : ""}`}
          >
            {reportPending ? "Saving…" : "I've sent the transfer"}
          </button>
          {reportError ? (
            <p
              className="mt-3 rounded-xl border border-red-200/80 bg-red-50 px-3 py-2 text-center font-sans text-[12px] leading-snug text-red-800 dark:border-red-800/70 dark:bg-red-950/50 dark:text-red-100"
              role="alert"
            >
              {reportError}
            </p>
          ) : (
            <p className="mt-2 text-center font-sans text-[11px] text-order-muted">
              Tap once after you&apos;ve paid—only counted once toward
              today&apos;s limit.
            </p>
          )}
        </>
      ) : null}
    </div>
  );
}
