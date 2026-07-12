"use client";

import { Download, FileText, X } from "lucide-react";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { OrderReceiptView } from "@/components/admin/order-receipt-view";
import "@/components/admin/order-receipt-print.css";
import { downloadReceiptPdf } from "@/lib/admin/download-receipt-pdf";
import type { ReceiptOrder } from "@/lib/admin/receipt-order";

type Props = {
  order: ReceiptOrder;
  open: boolean;
  onClose: () => void;
};

export function OrderReceiptModal({ order, open, onClose }: Props) {
  const titleId = useId();
  const slipRef = useRef<HTMLElement>(null);
  const [rendered, setRendered] = useState(open);
  const [error, setError] = useState<string | null>(null);
  const [downloading, startDownload] = useTransition();

  useEffect(() => {
    if (open) {
      setRendered(true);
      setError(null);
      return;
    }
    const t = window.setTimeout(() => setRendered(false), 220);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!rendered) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [rendered]);

  useEffect(() => {
    if (!rendered) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [rendered, onClose]);

  if (!rendered || typeof document === "undefined") return null;

  function handleDownload() {
    const el = slipRef.current;
    if (!el) return;
    setError(null);
    startDownload(async () => {
      try {
        await downloadReceiptPdf(el, `${order.reference}-slip.pdf`);
      } catch {
        setError("Could not create PDF. Try again.");
      }
    });
  }

  return createPortal(
    (
      <div
        className={`fixed inset-0 z-[70] flex items-end justify-center pb-[calc(6.5rem+env(safe-area-inset-bottom))] transition-opacity duration-200 sm:items-center sm:p-4 sm:pb-4 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        role="presentation"
      >
        <button
          type="button"
          className="absolute inset-0 bg-order-brownInk/45 backdrop-blur-[2px]"
          aria-label="Close preview"
          onClick={onClose}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={`relative z-10 flex w-full max-w-md max-h-[min(92dvh,calc(100dvh-6.5rem-env(safe-area-inset-bottom)-0.5rem))] flex-col rounded-t-[1.75rem] border border-order-line/80 bg-order-card shadow-lift ring-1 ring-white/90 transition-transform duration-200 sm:max-h-[94dvh] sm:rounded-[1.75rem] ${
            open ? "translate-y-0" : "translate-y-4"
          }`}
        >
          <div className="flex items-start justify-between gap-3 border-b border-order-line/60 px-5 py-4">
            <div>
              <p
                id={titleId}
                className="font-serif text-2xl font-semibold text-order-brownInk"
              >
                Packing slip
              </p>
              <p className="mt-0.5 font-mono text-[11px] text-order-muted">
                {order.reference}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-order-line/80 bg-order-bg text-order-brownInk"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <p className="px-6 pt-5 pb-4 text-center font-sans text-xs text-order-muted">
              72mm thermal slip — download and print from your phone.
            </p>
            <div className="receipt-modal-preview">
              <OrderReceiptView ref={slipRef} order={order} />
            </div>
            {error ? (
              <p className="mt-3 px-5 pb-4 text-center font-sans text-sm text-order-red-text">
                {error}
              </p>
            ) : null}
          </div>

          <div className="flex gap-2 border-t border-order-line/60 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-order-line/90 bg-white py-3 font-sans text-sm font-semibold text-order-brownInk"
            >
              Close
            </button>
            <button
              type="button"
              disabled={downloading}
              onClick={handleDownload}
              className="flex flex-[2] items-center justify-center gap-2 rounded-full bg-order-brownBtn py-3 font-sans text-sm font-semibold text-white shadow-order-btn ring-1 ring-order-brownBtn/20 transition hover:brightness-110 disabled:opacity-60"
            >
              <Download className="h-4 w-4" aria-hidden />
              {downloading ? "Creating PDF…" : "Download PDF"}
            </button>
          </div>
        </div>
      </div>
    ),
    document.body,
  );
}

/** Trigger button + modal wrapper. */
export function OrderReceiptButton({
  order,
  className = "",
  compact = false,
  prominent = false,
  disabled = false,
}: {
  order: ReceiptOrder;
  className?: string;
  compact?: boolean;
  prominent?: boolean;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  if (disabled) return null;

  const label = compact ? "Packing slip" : "View packing slip";

  return (
    <>
      {compact ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`pointer-events-auto relative z-20 inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-order-line/80 bg-order-bg text-order-taupe shadow-sm transition hover:border-order-brownBtn/25 hover:bg-order-cream/80 hover:text-order-brownInk ${className}`}
          aria-label={label}
          title={label}
        >
          <FileText className="h-4 w-4" aria-hidden />
        </button>
      ) : prominent ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-full bg-order-brownBtn py-3.5 font-sans text-sm font-semibold text-white shadow-order-btn ring-1 ring-order-brownBtn/20 transition hover:brightness-110 sm:w-auto sm:px-6 ${className}`}
        >
          <FileText className="h-4 w-4" aria-hidden />
          View packing slip
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`inline-flex items-center justify-center gap-2 rounded-full border border-order-line/90 bg-order-card px-4 py-2.5 font-sans text-sm font-semibold text-order-brownInk shadow-sm transition hover:bg-order-bg ${className}`}
        >
          <FileText className="h-4 w-4" aria-hidden />
          Packing slip
        </button>
      )}
      <OrderReceiptModal
        order={order}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
