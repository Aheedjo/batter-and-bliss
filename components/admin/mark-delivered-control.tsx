"use client";

import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setOrderDelivered } from "@/app/admin/orders/actions";

type Props = {
  orderId: string;
  deliveredAt: string | null;
  disabled?: boolean;
  className?: string;
};

export function MarkDeliveredControl({
  orderId,
  deliveredAt,
  disabled = false,
  className = "",
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const delivered = deliveredAt != null;

  function toggle(next: boolean) {
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("id", orderId);
      fd.set("delivered", next ? "true" : "false");
      const res = await setOrderDelivered(undefined, fd);
      if (!res.ok) {
        setError(res.message);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className={className} onClick={(e) => e.stopPropagation()}>
      <label
        className={`inline-flex cursor-pointer items-center gap-2.5 rounded-full border border-order-line/80 bg-order-card px-3 py-2 font-sans text-xs font-semibold text-order-brownInk shadow-sm ring-1 ring-white/80 transition hover:bg-order-bg ${
          pending || disabled ? "pointer-events-none opacity-60" : ""
        }`}
      >
      <input
        type="checkbox"
        checked={delivered}
        disabled={pending || disabled}
        onChange={(e) => toggle(e.target.checked)}
        className="h-4 w-4 shrink-0 cursor-pointer rounded border-order-line accent-order-brownBtn focus:ring-order-brownBtn/30"
        aria-label={delivered ? "Mark as not delivered" : "Mark as delivered"}
      />
      <span className="inline-flex items-center gap-1.5">
        {delivered ? (
          <Check className="h-3.5 w-3.5 text-emerald-700" aria-hidden />
        ) : null}
        {delivered ? "Delivered" : "Mark delivered"}
      </span>
    </label>
      {error ? (
        <p className="mt-2 font-sans text-xs text-order-red-text" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
