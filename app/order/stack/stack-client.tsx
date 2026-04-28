"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { SectionHeading } from "@/components/brand/section-heading";
import { StackCard } from "@/components/order/stack-card";
import { StickyAction } from "@/components/order/sticky-action";
import { STACKS, type StackId } from "@/lib/order/stacks";
import { useOrderStore } from "@/lib/stores/order-store";

const btnPrimary =
  "w-full rounded-full bg-order-brownBtn py-[1.05rem] font-serif text-[15px] font-semibold tracking-[0.01em] text-white shadow-order-btn ring-1 ring-order-brownBtn/20 transition hover:brightness-110 active:scale-[0.99]";

function StackClientInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stackParam = searchParams.get("stack");
  const pancakeLines = useOrderStore((s) => s.pancakeLines);
  const editingLineId = useOrderStore((s) => s.editingLineId);
  const addPancakeLine = useOrderStore((s) => s.addPancakeLine);
  const updateLineStack = useOrderStore((s) => s.updateLineStack);

  const editingLine = pancakeLines.find((l) => l.id === editingLineId);

  const autoStack = useMemo((): StackId => {
    if (stackParam && STACKS.some((s) => s.id === stackParam)) {
      return stackParam as StackId;
    }
    if (editingLine) {
      return editingLine.stackId;
    }
    return "morado";
  }, [stackParam, editingLine]);

  const [selected, setSelected] = useState<StackId>(autoStack);

  return (
    <>
      <div className="mx-auto max-w-lg px-5 pb-36 pt-8 sm:px-6 sm:pt-10">
        <SectionHeading
          eyebrow="Choose base"
          title="Pancakes & signature"
          description={
            editingLine
              ? "Update the base for this pancake order, or switch to another stack."
              : "Pick a base for a new pancake order (each order can have its own glazing, toppings, and syrups)."
          }
          className="mb-9"
        />

        <div className="flex flex-col gap-5 sm:gap-6">
          {STACKS.map((stack) => (
            <StackCard
              key={stack.id}
              stack={stack}
              selected={selected === stack.id}
              onSelect={() => setSelected(stack.id)}
            />
          ))}
        </div>
      </div>

      <StickyAction>
        <button
          type="button"
          onClick={() => {
            if (editingLineId && editingLine) {
              updateLineStack(editingLineId, selected);
            } else {
              addPancakeLine(selected);
            }
            router.push("/order/customize");
          }}
          className={btnPrimary}
        >
          Continue
        </button>
      </StickyAction>
    </>
  );
}

export function StackClient() {
  const searchParams = useSearchParams();
  const stackParam = searchParams.get("stack");
  const editingLineId = useOrderStore((s) => s.editingLineId);

  return (
    <StackClientInner
      key={`${stackParam ?? ""}|${editingLineId ?? ""}`}
    />
  );
}
