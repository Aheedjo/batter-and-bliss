"use client";

import { usePathname, useSearchParams } from "next/navigation";
import type { PublicOrderIntakeSnapshot } from "@/lib/order/order-intake";
import { useOrderStore } from "@/lib/stores/order-store";

function useDrinksOnlyFlow() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pancakeLines = useOrderStore((s) => s.pancakeLines);
  const drinkQuantities = useOrderStore((s) => s.drinkQuantities);

  const hasPancakes = pancakeLines.length > 0;
  const hasDrinks = Object.values(drinkQuantities).some((qty) => qty > 0);
  const drinksOnlyCart = !hasPancakes && hasDrinks;
  const drinksOnlyRoute =
    pathname === "/order/drinks" && searchParams.get("only") === "1";

  return drinksOnlyCart || drinksOnlyRoute;
}

export function OrderIntakeBanner({
  snapshot,
}: {
  snapshot: PublicOrderIntakeSnapshot;
}) {
  const drinksOnlyFlow = useDrinksOnlyFlow();
  const b = snapshot.banner;
  if (!b || drinksOnlyFlow) return null;

  const shell =
    b.variant === "danger"
      ? "border-red-200/90 bg-red-50/95 text-red-950 ring-red-100/90 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-50 dark:ring-red-900/40"
      : "border-amber-200/90 bg-amber-50/95 text-amber-950 ring-amber-100/90 dark:border-amber-900/55 dark:bg-amber-950/35 dark:text-amber-50 dark:ring-amber-900/45";

  return (
    <div className="relative z-20 border-b border-order-line/40 bg-order-bg/90 backdrop-blur-sm">
      <div className="mx-auto max-w-lg px-5 py-3.5 sm:px-6">
        <div
          className={`rounded-[1.1rem] border px-4 py-3 shadow-soft ring-1 ${shell}`}
          role="status"
        >
          <p className="font-serif text-[15px] font-semibold leading-snug tracking-[-0.02em]">
            {b.title}
          </p>
          <p className="mt-2 font-sans text-[12px] leading-relaxed text-current/90">
            {b.body}
          </p>
        </div>
      </div>
    </div>
  );
}
