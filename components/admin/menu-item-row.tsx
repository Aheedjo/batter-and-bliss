"use client";

import { useTransition } from "react";
import { formatPrice } from "@/lib/order/money";
import { labelForToppingCategory } from "@/lib/order/menu-categories";

type Props = {
  id: string;
  name: string;
  price: number | null;
  available: boolean;
  category?: string;
  onEdit: () => void;
  onToggleAvailable: (id: string, available: boolean) => Promise<void>;
};

function displayPrice(price: number | null) {
  if (price === null) return "—";
  return formatPrice(price);
}

export function MenuItemRow({
  id,
  name,
  price,
  available,
  category,
  onEdit,
  onToggleAvailable,
}: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <div
      className={`grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface-elevated)] px-4 py-3 transition sm:grid-cols-[minmax(0,1fr)_7rem_5.5rem_auto] ${
        !available ? "opacity-70" : ""
      }`}
    >
      <div className="min-w-0">
        <p className="truncate font-medium text-stone-800 dark:text-stone-100">
          {name}
        </p>
        {category ? (
          <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
            {labelForToppingCategory(category)}
          </p>
        ) : null}
        <p className="text-xs text-stone-500 dark:text-stone-400 sm:hidden">
          {displayPrice(price)}
        </p>
      </div>
      <p className="hidden text-right text-sm tabular-nums text-stone-600 dark:text-stone-300 sm:block">
        {displayPrice(price)}
      </p>
      <div className="flex justify-end">
        <button
          type="button"
          role="switch"
          aria-checked={available}
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await onToggleAvailable(id, !available);
            })
          }
          className={`relative h-8 w-14 shrink-0 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-400 ${
            available ? "bg-emerald-400/90" : "bg-stone-300"
          } ${pending ? "opacity-60" : ""}`}
        >
          <span
            className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
              available ? "translate-x-6" : "translate-x-0"
            }`}
          />
          <span className="sr-only">
            {available ? "Mark unavailable" : "Mark available"}
          </span>
        </button>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="rounded-lg border border-transparent px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:border-[var(--ui-border)] hover:bg-stone-50 dark:text-stone-200 dark:hover:bg-stone-800/80"
      >
        Edit
      </button>
    </div>
  );
}
