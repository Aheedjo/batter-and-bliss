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
  platterAddOns: PublicTopping[];
};

export function PlatterCustomizeClient({
  stacks,
  platterAddOns,
}: Props) {
  const router = useRouter();
  const pancakeLines = useOrderStore((s) => s.pancakeLines);
  const editingLineId = useOrderStore((s) => s.editingLineId);
  const toggleLineAddOn = useOrderStore((s) => s.toggleLineAddOn);

  const line = useMemo(
    () => pancakeLines.find((l) => l.id === editingLineId),
    [pancakeLines, editingLineId],
  );
  const stack = useMemo(
    () => (line ? stacks.find((s) => s.id === line.stackId) : null),
    [line, stacks],
  );

  const stackId = line?.stackId ?? null;

  const forThisPlatter = useMemo(
    () =>
      stackId
        ? platterAddOns.filter((t) => t.stackId === stackId)
        : [],
    [platterAddOns, stackId],
  );
  const platterToppings = useMemo(
    () => forThisPlatter.filter((t) => t.category === "platter_topping"),
    [forThisPlatter],
  );
  const platterDrizzles = useMemo(
    () => forThisPlatter.filter((t) => t.category === "platter_drizzle"),
    [forThisPlatter],
  );

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

  const hasOptions = platterDrizzles.length > 0 || platterToppings.length > 0;

  return (
    <>
      <div className="mx-auto max-w-lg px-5 pb-36 pt-8 sm:px-6 sm:pt-10">
        <FlowNavBack href="/order/stack">Base</FlowNavBack>

        <SectionHeading
          eyebrow="Platter"
          title={stack.name}
          description="Pick toppings and drizzles for this platter. Everything here is optional."
          italic
          className="mb-6"
        />

        {platterToppings.length > 0 ? (
          <>
            <SectionLabel>Toppings</SectionLabel>
            <p className="mt-1.5 font-sans text-[12px] leading-snug text-order-taupe">
              Choose as many as you like.
            </p>
            <ul className="mt-3 grid grid-cols-2 gap-3 sm:gap-4">
              {platterToppings.map((t) => (
                <li key={t.id} className="min-w-0">
                  <ToppingGridCard
                    name={t.name}
                    price={t.price}
                    imageSrc={t.imageUrl ?? undefined}
                    selected={line.addOnIds.includes(t.id)}
                    onToggle={() => toggleLineAddOn(t.id)}
                  />
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {platterDrizzles.length > 0 ? (
          <>
            <SectionLabel>Drizzles</SectionLabel>
            <p className="mt-1.5 font-sans text-[12px] leading-snug text-order-taupe">
              Choose as many as you like.
            </p>
            <ul className="mt-3 grid grid-cols-2 gap-3 sm:gap-4">
              {platterDrizzles.map((t) => (
                <li key={t.id} className="min-w-0">
                  <ToppingGridCard
                    name={t.name}
                    price={t.price}
                    imageSrc={t.imageUrl ?? undefined}
                    selected={line.addOnIds.includes(t.id)}
                    onToggle={() => toggleLineAddOn(t.id)}
                  />
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {!hasOptions ? (
          <p className="rounded-[1.25rem] border border-dashed border-order-line/70 bg-order-card/60 px-4 py-8 text-center font-sans text-sm leading-relaxed text-order-muted">
            Platter toppings and drizzles for {stack.name} aren&apos;t listed
            yet—you can still continue. In Admin → Menu, add them under{" "}
            <span className="font-semibold text-order-brownInk">
              Platter topping
            </span>{" "}
            or{" "}
            <span className="font-semibold text-order-brownInk">
              Platter drizzle
            </span>{" "}
            and choose this platter.
          </p>
        ) : null}
      </div>

      <StickyAction>
        <button
          type="button"
          onClick={() => router.push("/order/builds")}
          className={btnPrimary}
        >
          Continue
        </button>
      </StickyAction>
    </>
  );
}
