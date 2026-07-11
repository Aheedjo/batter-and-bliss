import { Check, X } from "lucide-react";
import type { AdminOrderListItem } from "@/lib/admin/admin-order-types";

export function StatusBadge({
  status,
}: {
  status: AdminOrderListItem["status"];
  deliveredAt?: string | null;
}) {
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-order-orange-bg px-2.5 py-1 font-sans text-[11px] font-semibold text-order-orange-text ring-1 ring-order-orange-text/10">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-order-orange-dot" aria-hidden />
        Pending
      </span>
    );
  }
  if (status === "confirmed") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 font-sans text-[11px] font-semibold text-emerald-900 ring-1 ring-emerald-200/80">
        <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />
        Confirmed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-order-red-bg px-2.5 py-1 font-sans text-[11px] font-semibold text-order-red-text ring-1 ring-order-red-border/50">
      <X className="h-3.5 w-3.5 shrink-0" aria-hidden />
      Rejected
    </span>
  );
}
