"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { FlowNavBack } from "@/components/brand/flow-nav-back";
import { SectionHeading } from "@/components/brand/section-heading";
import { StickyAction } from "@/components/order/sticky-action";
import type { PublicStack } from "@/lib/data/stacks-public";
import type { PublicTopping } from "@/lib/data/toppings-public";
import { RANDOM_BLISS_FEE } from "@/lib/order/constants";
import { formatPrice } from "@/lib/order/money";
import type { PancakeLine } from "@/lib/order/pancake-types";
import { useOrderStore } from "@/lib/stores/order-store";

const btnPrimary =
  "w-full rounded-full bg-order-brownBtn py-[1.05rem] font-serif text-[15px] font-semibold tracking-[0.01em] text-white shadow-order-btn ring-1 ring-order-brownBtn/20 transition hover:brightness-110 active:scale-[0.99]";

type Props = { catalog: PublicTopping[]; stacks: PublicStack[] };

function lineSubtotal(
  line: PancakeLine,
  stacksById: Map<string, PublicStack>,
  catalog: { id: string; price: number | null }[],
) {
  const stack = stacksById.get(line.stackId);
  if (!stack) return 0;
  let sum = stack.price;
  if (line.randomBliss) {
    return sum + RANDOM_BLISS_FEE;
  }
  const byId = new Map(catalog.map((t) => [t.id, t]));
  for (const id of line.addOnIds) {
    const p = byId.get(id)?.price;
    if (p != null) sum += p;
  }
  return sum;
}

export function BuildsClient({ catalog, stacks }: Props) {
  const router = useRouter();
  const pancakeLines = useOrderStore((s) => s.pancakeLines);
  const removePancakeLine = useOrderStore((s) => s.removePancakeLine);
  const setEditingLineId = useOrderStore((s) => s.setEditingLineId);

  const priced = useMemo(
    () => catalog.map((t) => ({ id: t.id, name: t.name, price: t.price })),
    [catalog],
  );
  const stacksById = useMemo(
    () => new Map(stacks.map((s) => [s.id, s])),
    [stacks],
  );

  return (
    <>
      <div className="mx-auto max-w-lg px-5 pb-40 pt-8 sm:px-6 sm:pt-10">
        <FlowNavBack href="/order/stack">Base</FlowNavBack>

        <SectionHeading
          eyebrow="Review"
          title="Your pancake orders"
          description="Each pancake stack has glazing (one), toppings, and syrups. Platters use platter glazing and platter toppings only. Add another or continue to drinks."
          className="mb-8"
        />

        {pancakeLines.length === 0 ? (
          <p className="font-sans text-sm text-order-taupe">
            No pancake orders yet.{" "}
            <button
              type="button"
              className="font-semibold text-order-brownInk underline"
              onClick={() => router.push("/order/stack")}
            >
              Start with a base
            </button>
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {pancakeLines.map((line, i) => {
              const stack = stacksById.get(line.stackId);
              const sub = lineSubtotal(line, stacksById, catalog);
              return (
                <li
                  key={line.id}
                  className="rounded-[1.25rem] bg-order-card p-4 shadow-card ring-1 ring-black/[0.05]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-order-muted">
                        Order {i + 1}
                      </p>
                      <p className="mt-1 font-serif text-lg font-semibold text-order-brownInk">
                        {stack?.name ?? "Pancakes"}
                      </p>
                      <p className="mt-1 font-sans text-[12px] text-order-taupe">
                        {line.randomBliss
                          ? "Random Bliss"
                          : line.addOnIds.length
                            ? `${line.addOnIds.length} add-on(s)`
                            : "No add-ons yet"}
                      </p>
                    </div>
                    <p className="shrink-0 font-sans text-sm font-bold tabular-nums text-order-brownDark">
                      {formatPrice(sub)}
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="rounded-full border border-order-line/80 px-3 py-1.5 font-sans text-[11px] font-medium text-order-brownInk transition hover:bg-order-bg"
                      onClick={() => {
                        setEditingLineId(line.id);
                        router.push("/order/stack");
                      }}
                    >
                      Change package
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-order-line/80 px-3 py-1.5 font-sans text-[11px] font-medium text-order-brownInk transition hover:bg-order-bg"
                      onClick={() => {
                        setEditingLineId(line.id);
                        router.push(
                          stack?.kind === "platter"
                            ? "/order/platter"
                            : "/order/customize",
                        );
                      }}
                    >
                      Edit add-ons
                    </button>
                    <button
                      type="button"
                      className="rounded-full px-3 py-1.5 font-sans text-[11px] font-medium text-order-red-text transition hover:bg-order-red-bg/50"
                      onClick={() => removePancakeLine(line.id)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <button
          type="button"
          onClick={() => {
            setEditingLineId(null);
            router.push("/order/stack");
          }}
          className="mt-6 w-full rounded-full border border-order-line/90 bg-order-bg py-3 font-sans text-sm font-semibold text-order-brownInk transition hover:bg-order-card"
        >
          + Add another pancake order
        </button>
      </div>

      <StickyAction>
        <button
          type="button"
          disabled={pancakeLines.length === 0}
          onClick={() => router.push("/order/drinks")}
          className={btnPrimary}
        >
          Continue to drinks
        </button>
      </StickyAction>
    </>
  );
}
