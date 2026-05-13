"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { FlowNavBack } from "@/components/brand/flow-nav-back";
import { SectionHeading } from "@/components/brand/section-heading";
import { StickyAction } from "@/components/order/sticky-action";
import { ToppingGridCard } from "@/components/order/topping-grid-card";
import type { PublicStack } from "@/lib/data/stacks-public";
import type { PublicTopping } from "@/lib/data/toppings-public";
import { useOrderStore } from "@/lib/stores/order-store";

const btnPrimary =
  "w-full rounded-full bg-order-brownBtn py-[1.05rem] font-serif text-[15px] font-semibold tracking-[0.01em] text-white shadow-order-btn ring-1 ring-order-brownBtn/20 transition hover:brightness-110 active:scale-[0.99]";

function SectionLabel({ children }: { children: string }) {
  return (
    <h3 className="mt-8 font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-order-muted">
      {children}
    </h3>
  );
}

type Props = {
  stacks: PublicStack[];
  platterGlazing: PublicTopping[];
  platterToppings: PublicTopping[];
};

export function PlatterCustomizeClient({
  stacks,
  platterGlazing,
  platterToppings,
}: Props) {
  const router = useRouter();
  const pancakeLines = useOrderStore((s) => s.pancakeLines);
  const editingLineId = useOrderStore((s) => s.editingLineId);
  const toggleLineAddOn = useOrderStore((s) => s.toggleLineAddOn);
  const toggleExclusiveAddOnGroup = useOrderStore(
    (s) => s.toggleExclusiveAddOnGroup,
  );

  const line = useMemo(
    () => pancakeLines.find((l) => l.id === editingLineId),
    [pancakeLines, editingLineId],
  );
  const stack = useMemo(
    () => (line ? stacks.find((s) => s.id === line.stackId) : null),
    [line, stacks],
  );

  const glazingIds = useMemo(
    () => platterGlazing.map((g) => g.id),
    [platterGlazing],
  );
  const glazingIdSet = useMemo(() => new Set(glazingIds), [glazingIds]);

  useEffect(() => {
    if (pancakeLines.length === 0) {
      router.replace("/order/stack");
      return;
    }
    if (!editingLineId || !line) {
      router.replace("/order/builds");
      return;
    }
    if (stack?.kind !== "platter") {
      router.replace("/order/customize");
    }
  }, [pancakeLines.length, editingLineId, line, stack, router]);

  if (!line || !editingLineId || stack?.kind !== "platter") return null;

  const pickedGlazingCount = line.addOnIds.filter((id) =>
    glazingIdSet.has(id),
  ).length;
  const glazingOk =
    platterGlazing.length === 0 || pickedGlazingCount === 1;

  return (
    <>
      <div className="mx-auto max-w-lg px-5 pb-36 pt-8 sm:px-6 sm:pt-10">
        <FlowNavBack href="/order/stack">Base</FlowNavBack>

        <SectionHeading
          eyebrow="Platter"
          title="Glazing & toppings"
          description="Choose one glazing and any of the platter toppings for this order."
          italic
          className="mb-6"
        />

        {platterGlazing.length > 0 ? (
          <>
            <SectionLabel>Glazing</SectionLabel>
            <p className="mt-1.5 font-sans text-[12px] leading-snug text-order-taupe">
              Pick one—chocolate or whipping cream.
            </p>
            <ul className="mt-3 grid grid-cols-2 gap-3 sm:gap-4">
              {platterGlazing.map((t) => (
                <li key={t.id} className="min-w-0">
                  <ToppingGridCard
                    name={t.name}
                    price={t.price}
                    selected={line.addOnIds.includes(t.id)}
                    onToggle={() =>
                      toggleExclusiveAddOnGroup(glazingIds, t.id)
                    }
                  />
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {platterToppings.length > 0 ? (
          <>
            <SectionLabel>Toppings</SectionLabel>
            <p className="mt-1.5 font-sans text-[12px] leading-snug text-order-taupe">
              Mix freely—pistachio, white chocolate, lotus (you can choose several).
            </p>
            <ul className="mt-3 grid grid-cols-2 gap-3 sm:gap-4">
              {platterToppings.map((t) => (
                <li key={t.id} className="min-w-0">
                  <ToppingGridCard
                    name={t.name}
                    price={t.price}
                    selected={line.addOnIds.includes(t.id)}
                    onToggle={() => toggleLineAddOn(t.id)}
                  />
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>

      <StickyAction>
        <div className="space-y-2">
          {!glazingOk && platterGlazing.length > 0 ? (
            <p className="text-center font-sans text-[12px] text-order-taupe">
              Select one glazing to continue.
            </p>
          ) : null}
          <button
            type="button"
            disabled={!glazingOk && platterGlazing.length > 0}
            onClick={() => router.push("/order/builds")}
            className={`${btnPrimary} ${
              !glazingOk && platterGlazing.length > 0
                ? "pointer-events-none opacity-50"
                : ""
            }`}
          >
            Continue
          </button>
        </div>
      </StickyAction>
    </>
  );
}
