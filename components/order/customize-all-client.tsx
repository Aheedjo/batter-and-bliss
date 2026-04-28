"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { FlowNavBack } from "@/components/brand/flow-nav-back";
import { SectionHeading } from "@/components/brand/section-heading";
import { RandomBlissCard } from "@/components/order/random-bliss-card";
import { StickyAction } from "@/components/order/sticky-action";
import { ToppingGridCard } from "@/components/order/topping-grid-card";
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
  glazing: PublicTopping[];
  toppings: PublicTopping[];
  syrups: PublicTopping[];
};

export function CustomizeAllClient({ glazing, toppings, syrups }: Props) {
  const router = useRouter();
  const pancakeLines = useOrderStore((s) => s.pancakeLines);
  const editingLineId = useOrderStore((s) => s.editingLineId);
  const toggleLineAddOn = useOrderStore((s) => s.toggleLineAddOn);
  const setLineRandomBliss = useOrderStore((s) => s.setLineRandomBliss);

  const line = useMemo(
    () => pancakeLines.find((l) => l.id === editingLineId),
    [pancakeLines, editingLineId],
  );

  useEffect(() => {
    if (pancakeLines.length === 0) {
      router.replace("/order/stack");
      return;
    }
    if (!editingLineId || !line) {
      router.replace("/order/builds");
    }
  }, [pancakeLines.length, editingLineId, line, router]);

  if (!line || !editingLineId) return null;

  const showPickOwn =
    glazing.length > 0 || toppings.length > 0 || syrups.length > 0;

  return (
    <>
      <div className="mx-auto max-w-lg px-5 pb-36 pt-8 sm:px-6 sm:pt-10">
        <FlowNavBack href="/order/stack">Base</FlowNavBack>

        <SectionHeading
          eyebrow="Customize"
          title="Glazing, toppings & syrup"
          description="Everything for this pancake order in one place—scroll through each section, then continue."
          italic
          className="mb-6"
        />

        <div className="mb-6">
          <RandomBlissCard
            active={line.randomBliss}
            onToggle={() => setLineRandomBliss(!line.randomBliss)}
          />
        </div>

        {showPickOwn && line.randomBliss ? (
          <div className="relative mb-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-order-line to-order-line" />
            <span className="shrink-0 font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-order-muted">
              Or pick your own
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-order-line to-order-line" />
          </div>
        ) : null}

        {glazing.length > 0 ? (
          <>
            <SectionLabel>Glazing</SectionLabel>
            <p className="mt-1.5 font-sans text-[12px] leading-snug text-order-taupe">
              Coat this stack—same section as the printed menu.
            </p>
            <ul className="mt-3 grid grid-cols-2 gap-3 sm:gap-4">
              {glazing.map((t) => (
                <li key={t.id} className="min-w-0">
                  <ToppingGridCard
                    name={t.name}
                    price={t.price}
                    selected={!line.randomBliss && line.addOnIds.includes(t.id)}
                    onToggle={() => toggleLineAddOn(t.id)}
                  />
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {toppings.length > 0 ? (
          <>
            <SectionLabel>Toppings</SectionLabel>
            <p className="mt-1.5 font-sans text-[12px] leading-snug text-order-taupe">
              Mix freely for this pancake order.
            </p>
            <ul className="mt-3 grid grid-cols-2 gap-3 sm:gap-4">
              {toppings.map((t) => (
                <li key={t.id} className="min-w-0">
                  <ToppingGridCard
                    name={t.name}
                    price={t.price}
                    selected={!line.randomBliss && line.addOnIds.includes(t.id)}
                    onToggle={() => toggleLineAddOn(t.id)}
                  />
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {syrups.length > 0 ? (
          <>
            <SectionLabel>Syrups</SectionLabel>
            <p className="mt-1.5 font-sans text-[12px] leading-snug text-order-taupe">
              Multiple syrups allowed on this order.
            </p>
            <ul className="mt-3 grid grid-cols-2 gap-3 sm:gap-4">
              {syrups.map((t) => (
                <li key={t.id} className="min-w-0">
                  <ToppingGridCard
                    name={t.name}
                    price={t.price}
                    selected={!line.randomBliss && line.addOnIds.includes(t.id)}
                    onToggle={() => toggleLineAddOn(t.id)}
                  />
                </li>
              ))}
            </ul>
          </>
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
