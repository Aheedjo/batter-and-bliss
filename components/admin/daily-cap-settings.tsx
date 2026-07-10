"use client";

import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { updateDailyOrderCap } from "@/app/admin/shop-settings-actions";

type Props = {
  dailyOrderCap: number | null;
  transferredSlotsToday: number;
  /** Current 6am–6am cap window, e.g. "2026-05-10 6:00 → 2026-05-11 6:00". */
  capWindowSummary: string;
};

export function DailyCapSettings({
  dailyOrderCap,
  transferredSlotsToday,
  capWindowSummary,
}: Props) {
  const router = useRouter();
  const panelId = useId();
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const panelInnerRef = useRef<HTMLDivElement>(null);
  const [panelHeight, setPanelHeight] = useState(0);

  useLayoutEffect(() => {
    const el = panelInnerRef.current;
    if (!el) return;
    setPanelHeight(el.scrollHeight);
  }, [expanded, message, pending, dailyOrderCap, transferredSlotsToday]);

  function onSubmit(fd: FormData) {
    setMessage(null);
    startTransition(async () => {
      const res = await updateDailyOrderCap(undefined, fd);
      if (!res.ok) setMessage(res.message);
      else {
        router.refresh();
        setMessage(null);
      }
    });
  }

  const capEffective = dailyOrderCap;
  const atCap =
    capEffective != null && transferredSlotsToday >= capEffective;
  const capLabel =
    capEffective != null ? String(capEffective) : "no cap";

  const inputClass =
    "mt-2 w-full max-w-[8rem] rounded-xl border border-order-line/90 bg-order-bg px-3 py-2.5 font-sans text-base tabular-nums text-order-brownInk outline-none focus:border-order-brownBtn/35 focus:ring-1 focus:ring-order-brownBtn/20";

  return (
    <section className="overflow-hidden rounded-[1.15rem] border border-order-line/80 bg-order-card shadow-soft ring-1 ring-white/85">
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded((e) => !e)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-order-bg/70 sm:px-4 sm:py-4"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.18em] text-order-taupe">
              Daily capacity
            </span>
            {atCap ? (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 font-sans text-[9px] font-bold uppercase tracking-wide text-amber-900 ring-1 ring-amber-200/80 dark:bg-amber-950/70 dark:text-amber-100 dark:ring-amber-800/50">
                At limit
              </span>
            ) : null}
          </div>
          <p className="mt-1 font-serif text-[1.35rem] font-semibold tabular-nums tracking-tight text-order-brownInk sm:text-2xl">
            {transferredSlotsToday}
            <span className="font-sans text-base font-semibold text-order-taupe sm:text-lg">
              {" "}
              / {capEffective != null ? capEffective : "—"}
            </span>
          </p>
          <p className="mt-0.5 font-sans text-[11px] text-order-muted">
            {capWindowSummary} (shop time, WAT) · counted after &quot;I&apos;ve sent&quot;
          </p>
        </div>
        <ChevronRight
          className={`h-5 w-5 shrink-0 text-order-taupe transition-transform duration-200 ${
            expanded ? "rotate-90" : ""
          }`}
          strokeWidth={2}
          aria-hidden
        />
      </button>

      <div
        id={panelId}
        role="region"
        aria-label="Daily capacity settings and explanation"
        aria-hidden={!expanded}
        className="overflow-hidden border-t border-order-line/60 transition-[max-height,opacity] duration-300 ease-out"
        style={{
          maxHeight: expanded ? `${panelHeight}px` : "0px",
          opacity: expanded ? 1 : 0,
          pointerEvents: expanded ? "auto" : "none",
        }}
      >
        <div ref={panelInnerRef} className="px-4 pb-4 pt-1 sm:px-4 sm:pb-5">
          <p className="font-sans text-sm leading-relaxed text-order-taupe">
            When a customer taps &quot;I&apos;ve sent the transfer&quot;, each pancake
            package in their order counts toward the daily limit. Rejected orders
            free those pancakes the same day. New checkouts and payment reports pause
            when capacity is full.
          </p>

          <div className="mt-4 rounded-xl bg-order-bg px-3 py-3 ring-1 ring-black/[0.04]">
            <p className="font-sans text-[10px] font-semibold uppercase tracking-wide text-order-muted">
              Today · pancakes counted ({capLabel})
            </p>
            <p className="mt-1 font-serif text-xl font-semibold tabular-nums text-order-brownInk">
              {transferredSlotsToday}
              {capEffective != null ? (
                <span className="font-sans text-sm font-semibold text-order-taupe">
                  {" "}
                  / {capEffective}
                </span>
              ) : (
                <span className="font-sans text-sm font-medium text-order-muted">
                  {" "}
                  (unlimited until you set a cap below)
                </span>
              )}
            </p>
            {atCap ? (
              <p className="mt-2 font-sans text-xs font-medium text-amber-900 dark:text-amber-100">
                At capacity — raise the limit below or wait for rejections to free pancakes.
              </p>
            ) : null}
          </div>

          <form action={onSubmit} className="mt-5 space-y-3">
            <div>
              <label
                htmlFor="daily-order-cap"
                className="font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-order-taupe"
              >
                Max pancakes per day
              </label>
              <input
                id="daily-order-cap"
                name="dailyOrderCap"
                defaultValue={dailyOrderCap != null ? String(dailyOrderCap) : ""}
                key={`cap-${dailyOrderCap ?? "none"}`}
                inputMode="numeric"
                placeholder="e.g. 40 — blank = unlimited"
                className={inputClass}
                autoComplete="off"
              />
              <p className="mt-1.5 font-sans text-[11px] text-order-muted">
                Leave empty for no limit. Save to apply.
              </p>
            </div>
            {message ? (
              <p className="font-sans text-xs font-medium text-red-600">{message}</p>
            ) : null}
            <button
              type="submit"
              disabled={pending}
              className="rounded-full border border-order-line/90 bg-white px-4 py-2 font-sans text-xs font-semibold text-order-brownInk shadow-sm transition hover:bg-order-bg disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save cap"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
