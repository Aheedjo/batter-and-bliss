"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { SectionHeading } from "@/components/brand/section-heading";
import { StackCard } from "@/components/order/stack-card";
import { StickyAction } from "@/components/order/sticky-action";
import type { PublicStack } from "@/lib/data/stacks-public";
import { isFixedStack, type StackId } from "@/lib/order/stacks";
import { useOrderStore } from "@/lib/stores/order-store";

const btnPrimary =
  "w-full rounded-full bg-order-brownBtn py-[1.05rem] font-serif text-[15px] font-semibold tracking-[0.01em] text-white shadow-order-btn ring-1 ring-order-brownBtn/20 transition hover:brightness-110 active:scale-[0.99]";

const peelTrack =
  "mb-8 flex rounded-full bg-black/[0.06] p-[3px] ring-1 ring-black/[0.06]";
const peelInactive =
  "relative flex-1 rounded-full py-2.5 text-center font-sans text-[13px] font-semibold text-order-muted transition";
const peelActive =
  `${peelInactive} bg-order-card text-order-brownInk shadow-sm ring-1 ring-black/[0.06]`;

function StackClientInner({ stacks }: { stacks: PublicStack[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stackParam = searchParams.get("stack");
  const pancakeLines = useOrderStore((s) => s.pancakeLines);
  const editingLineId = useOrderStore((s) => s.editingLineId);
  const addPancakeLine = useOrderStore((s) => s.addPancakeLine);
  const updateLineStack = useOrderStore((s) => s.updateLineStack);
  const setEditingLineId = useOrderStore((s) => s.setEditingLineId);
  const clearPancakeCart = useOrderStore((s) => s.clearPancakeCart);

  const editingLine = pancakeLines.find((l) => l.id === editingLineId);
  /** From builds “Change package” only — not in-flow stack pick / back from customize. */
  const changeBaseMode = searchParams.get("edit") === "base";

  const pancakeStacks = useMemo(
    () => stacks.filter((s) => s.kind === "pancake"),
    [stacks],
  );
  const platterStacks = useMemo(
    () => stacks.filter((s) => s.kind === "platter"),
    [stacks],
  );
  const sortedPancakes = useMemo(
    () =>
      [...pancakeStacks].sort((a, b) => (b.price ?? 0) - (a.price ?? 0)),
    [pancakeStacks],
  );
  const sortedPlatters = useMemo(
    () =>
      [...platterStacks].sort((a, b) => (b.price ?? 0) - (a.price ?? 0)),
    [platterStacks],
  );

  const autoStack = useMemo((): StackId => {
    if (stackParam && stacks.some((s) => s.id === stackParam)) {
      return stackParam;
    }
    if (editingLine && stacks.some((s) => s.id === editingLine.stackId)) {
      return editingLine.stackId;
    }
    return (
      sortedPancakes[0]?.id ?? sortedPlatters[0]?.id ?? ""
    );
  }, [stackParam, editingLine, stacks, sortedPancakes, sortedPlatters]);

  const defaultSegment: "pancake" | "platter" = (() => {
    if (pancakeStacks.length === 0) return "platter";
    if (platterStacks.length === 0) return "pancake";
    return stacks.find((s) => s.id === autoStack)?.kind === "platter"
      ? "platter"
      : "pancake";
  })();

  const [segment, setSegment] = useState<"pancake" | "platter">(
    defaultSegment,
  );
  const [selected, setSelected] = useState<StackId>(autoStack);

  const selectedStack = useMemo(
    () => stacks.find((s) => s.id === selected) ?? null,
    [stacks, selected],
  );

  const visibleStacks =
    segment === "pancake" ? sortedPancakes : sortedPlatters;

  const showBothKinds = pancakeStacks.length > 0 && platterStacks.length > 0;

  useEffect(() => {
    if (!changeBaseMode && pancakeLines.length === 0) {
      setEditingLineId(null);
    }
  }, [changeBaseMode, pancakeLines.length, setEditingLineId]);

  function switchSegment(next: "pancake" | "platter") {
    setSegment(next);
    const pool = next === "pancake" ? sortedPancakes : sortedPlatters;
    if (!pool.some((s) => s.id === selected)) {
      setSelected(pool[0]?.id ?? "");
    }
  }

  return (
    <>
      <div className="mx-auto max-w-lg px-5 pb-36 pt-8 sm:px-6 sm:pt-10">
        <SectionHeading
          eyebrow="Choose base"
          title="Pancakes & signature"
          description={
            changeBaseMode
              ? "Update the base for this order, then save to return to your review."
              : "Pick a base for a new order. Pancakes include glazing, toppings, and syrups; platters include up to 2 platter toppings."
          }
          className="mb-9"
        />

        {showBothKinds ? (
          <div className={peelTrack} role="tablist" aria-label="Package type">
            <button
              type="button"
              role="tab"
              aria-selected={segment === "pancake"}
              onClick={() => switchSegment("pancake")}
              className={segment === "pancake" ? peelActive : peelInactive}
            >
              Pancakes
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={segment === "platter"}
              onClick={() => switchSegment("platter")}
              className={segment === "platter" ? peelActive : peelInactive}
            >
              Platters
            </button>
          </div>
        ) : null}

        {visibleStacks.length > 0 ? (
          <div className="flex flex-col gap-5 sm:gap-6">
            {visibleStacks.map((stack) => (
              <StackCard
                key={stack.id}
                stack={stack}
                selected={selected === stack.id}
                onSelect={() => setSelected(stack.id)}
              />
            ))}
          </div>
        ) : (
          <p className="font-sans text-sm text-order-muted">
            No bases available for this category.
          </p>
        )}
      </div>

      <StickyAction>
        <div className="space-y-2">
          <button
            type="button"
            disabled={!selected}
            onClick={() => {
              if (!selected) return;
              const fixed = isFixedStack(selectedStack?.name);
              const nextCustomize = fixed
                ? "/order/builds"
                : selectedStack?.kind === "platter"
                  ? "/order/platter"
                  : "/order/customize";

              if (changeBaseMode) {
                if (!editingLineId || !editingLine) return;
                updateLineStack(editingLineId, selected);
                router.push("/order/builds");
                return;
              }

              if (editingLineId && editingLine) {
                updateLineStack(editingLineId, selected);
                router.push(nextCustomize);
                return;
              }

              addPancakeLine(selected);
              router.push(nextCustomize);
            }}
            className={`${btnPrimary} ${!selected ? "pointer-events-none opacity-50" : ""}`}
          >
            {changeBaseMode ? "Save base" : "Continue"}
          </button>
          {!changeBaseMode && pancakeLines.length === 0 ? (
            <button
              type="button"
              onClick={() => {
                clearPancakeCart();
                router.push("/order/drinks?only=1");
              }}
              className="w-full rounded-full border border-order-line/90 bg-order-bg py-3 font-sans text-sm font-semibold text-order-brownInk transition hover:bg-order-card"
            >
              Order drinks only
            </button>
          ) : null}
        </div>
      </StickyAction>
    </>
  );
}

export function StackClient({ stacks }: { stacks: PublicStack[] }) {
  const searchParams = useSearchParams();
  const stackParam = searchParams.get("stack");
  const editParam = searchParams.get("edit");
  const editingLineId = useOrderStore((s) => s.editingLineId);

  return (
    <StackClientInner
      stacks={stacks}
      key={`${stackParam ?? ""}|${editParam ?? ""}|${editingLineId ?? ""}`}
    />
  );
}
