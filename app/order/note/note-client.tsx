"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { FlowNavBack } from "@/components/brand/flow-nav-back";
import { SectionHeading } from "@/components/brand/section-heading";
import { StickyAction } from "@/components/order/sticky-action";
import { useOrderStore } from "@/lib/stores/order-store";

const btnPrimary =
  "w-full rounded-full bg-order-brownBtn py-[1.05rem] font-serif text-[15px] font-semibold tracking-[0.01em] text-white shadow-order-btn ring-1 ring-order-brownBtn/20 transition hover:brightness-110 active:scale-[0.99]";

export function NoteClient() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pancakeLines = useOrderStore((s) => s.pancakeLines);
  const note = useOrderStore((s) => s.note);
  const setNote = useOrderStore((s) => s.setNote);

  useEffect(() => {
    if (pancakeLines.length === 0) router.replace("/order/stack");
  }, [pancakeLines.length, router]);

  if (pancakeLines.length === 0) return null;

  return (
    <>
      <div className="mx-auto max-w-lg px-5 pb-36 pt-8 sm:px-6 sm:pt-10">
        <FlowNavBack href="/order/drinks">Drinks</FlowNavBack>

        <SectionHeading
          eyebrow="Note"
          title="Add a sweet note"
          description="We'll write this on your box ♡"
          italic
          className="mb-8"
        />

        <div className="rounded-[1.75rem] border border-order-line/90 bg-order-card p-1 shadow-card ring-1 ring-white/80">
          <textarea
            ref={textareaRef}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={200}
            rows={4}
            placeholder="Happy Birthday Aisha 🎉"
            className="w-full resize-none rounded-[1.5rem] bg-transparent px-4 py-3.5 font-serif text-base italic leading-relaxed text-order-brownInk placeholder:text-order-muted/55 focus:outline-none focus:ring-0"
          />
          <div className="mx-2 border-t border-order-line/80" />
          <div className="flex items-center justify-between px-3 py-2.5">
            <button
              type="button"
              onClick={() => textareaRef.current?.focus()}
              className="flex items-center gap-2 font-sans text-[11px] font-medium text-order-muted transition hover:text-order-taupe"
            >
              <span aria-hidden>✎</span>
              Tap to type
            </button>
            <span className="rounded-full bg-order-bg px-3 py-1 font-sans text-[11px] font-medium tabular-nums tracking-wide text-order-taupe ring-1 ring-order-line/50">
              {note.length} / 200
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setNote("");
            router.push("/order/checkout");
          }}
          className="mx-auto mt-8 block font-sans text-[13px] font-medium text-order-brown underline decoration-order-line/80 underline-offset-[6px] transition hover:decoration-order-brown"
        >
          No thanks, skip this step
        </button>
      </div>

      <StickyAction>
        <button
          type="button"
          onClick={() => router.push("/order/checkout")}
          className={btnPrimary}
        >
          Continue
        </button>
      </StickyAction>
    </>
  );
}
