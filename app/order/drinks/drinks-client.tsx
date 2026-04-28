"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FlowNavBack } from "@/components/brand/flow-nav-back";
import { SectionHeading } from "@/components/brand/section-heading";
import { StickyAction } from "@/components/order/sticky-action";
import type { PublicTopping } from "@/lib/data/toppings-public";
import { formatPrice } from "@/lib/order/money";
import { useOrderStore } from "@/lib/stores/order-store";

const btnPrimary =
  "w-full rounded-full bg-order-brownBtn py-[1.05rem] font-serif text-[15px] font-semibold tracking-[0.01em] text-white shadow-order-btn ring-1 ring-order-brownBtn/20 transition hover:brightness-110 active:scale-[0.99]";

type Props = { drinks: PublicTopping[] };

export function DrinksClient({ drinks }: Props) {
  const router = useRouter();
  const pancakeLines = useOrderStore((s) => s.pancakeLines);
  const drinkQuantities = useOrderStore((s) => s.drinkQuantities);
  const setDrinkQuantity = useOrderStore((s) => s.setDrinkQuantity);

  useEffect(() => {
    if (pancakeLines.length === 0) router.replace("/order/stack");
  }, [pancakeLines.length, router]);

  if (pancakeLines.length === 0) return null;

  return (
    <>
      <div className="mx-auto max-w-lg px-5 pb-40 pt-8 sm:px-6 sm:pt-10">
        <FlowNavBack href="/order/builds">Pancake orders</FlowNavBack>

        <SectionHeading
          eyebrow="Drinks"
          title="Drinks"
          description="Add Kunun Aya, coconut milk, or both—tap + / − for how many of each."
          className="mb-8"
        />

        <ul className="flex flex-col gap-3">
          {drinks.map((d) => {
            const qty = drinkQuantities[d.id] ?? 0;
            const unit = d.price ?? 0;
            return (
              <li
                key={d.id}
                className="flex items-center justify-between gap-3 rounded-[1.25rem] bg-order-card px-4 py-3 shadow-card ring-1 ring-black/[0.05]"
              >
                <div className="min-w-0">
                  <p className="font-serif text-[15px] font-semibold text-order-brownInk">
                    {d.name}
                  </p>
                  <p className="mt-0.5 font-sans text-xs text-order-taupe">
                    {formatPrice(unit)} each
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    aria-label={`Decrease ${d.name}`}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-order-line/90 bg-order-bg text-lg font-medium text-order-brownInk transition hover:bg-order-beigeActive disabled:opacity-40"
                    disabled={qty <= 0}
                    onClick={() => setDrinkQuantity(d.id, qty - 1)}
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-sans text-sm font-semibold tabular-nums text-order-brownDark">
                    {qty}
                  </span>
                  <button
                    type="button"
                    aria-label={`Increase ${d.name}`}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-order-line/90 bg-order-bg text-lg font-medium text-order-brownInk transition hover:bg-order-beigeActive"
                    onClick={() => setDrinkQuantity(d.id, qty + 1)}
                  >
                    +
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <StickyAction>
        <button
          type="button"
          onClick={() => router.push("/order/note")}
          className={btnPrimary}
        >
          Continue
        </button>
      </StickyAction>
    </>
  );
}
