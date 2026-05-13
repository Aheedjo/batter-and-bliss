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
import { updateOrderIntakeSettings } from "@/app/admin/shop-settings-actions";
import {
  INTAKE_WINDOW_LABEL,
  JS_WEEKDAY_LONG,
  type PublicOrderIntakeSnapshot,
} from "@/lib/order/order-intake";

type Props = {
  snapshot: PublicOrderIntakeSnapshot;
  /** Bumps after save / refresh so form defaults stay in sync. */
  formKey: number;
};

export function OrderIntakeSettingsPanel({ snapshot, formKey }: Props) {
  const router = useRouter();
  const panelId = useId();
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const panelInnerRef = useRef<HTMLDivElement>(null);
  const [panelHeight, setPanelHeight] = useState(0);
  const s = snapshot.settings;

  useLayoutEffect(() => {
    const el = panelInnerRef.current;
    if (!el) return;
    setPanelHeight(el.scrollHeight);
  }, [expanded, message, pending, formKey]);

  function onSubmit(fd: FormData) {
    setMessage(null);
    startTransition(async () => {
      const res = await updateOrderIntakeSettings(undefined, fd);
      if (!res.ok) setMessage(res.message);
      else {
        setMessage(null);
        router.refresh();
      }
    });
  }

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
              Order intake
            </span>
            {snapshot.checkoutAllowed ? (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-sans text-[9px] font-bold uppercase tracking-wide text-emerald-900 ring-1 ring-emerald-200/80 dark:bg-emerald-950/70 dark:text-emerald-100 dark:ring-emerald-800/50">
                Open now
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 font-sans text-[9px] font-bold uppercase tracking-wide text-amber-900 ring-1 ring-amber-200/80 dark:bg-amber-950/70 dark:text-amber-100 dark:ring-amber-800/50">
                Closed now
              </span>
            )}
          </div>
          <p className="mt-1 font-sans text-xs leading-relaxed text-order-taupe">
            Day-before intake · {INTAKE_WINDOW_LABEL} (Nigeria / shop time)
          </p>
        </div>
        <ChevronRight
          className={`h-5 w-5 shrink-0 text-order-muted transition ${expanded ? "rotate-90" : ""}`}
          aria-hidden
        />
      </button>

      <div
        id={panelId}
        className="overflow-hidden transition-[max-height] duration-300 ease-out"
        style={{ maxHeight: expanded ? panelHeight : 0 }}
        aria-hidden={!expanded}
      >
        <div ref={panelInnerRef} className="border-t border-order-line/60 px-4 pb-4 pt-1 sm:px-4">
          <p className="mt-3 font-sans text-[11px] leading-relaxed text-order-taupe">
            Tick the weekdays when you <span className="font-semibold text-order-brownInk">sell / fulfil</span> orders.
            Customers can join the list from <span className="font-semibold text-order-brownInk">6am the day before</span>{" "}
            that kitchen day through <span className="font-semibold text-order-brownInk">6am on the kitchen day</span>{" "}
            (shop time). Change the 6am cutoff in code if she confirms a different time.
          </p>

          <form
            key={formKey}
            className="mt-4 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit(new FormData(e.currentTarget));
            }}
          >
            <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-order-bg/80 px-3 py-2.5 ring-1 ring-order-line/45">
              <input
                type="checkbox"
                name="orderIntakeEnabled"
                value="on"
                defaultChecked={s.orderIntakeEnabled}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-order-line accent-order-brownBtn"
              />
              <span>
                <span className="block font-sans text-sm font-medium text-order-brownInk">
                  Accept new orders
                </span>
                <span className="mt-0.5 block font-sans text-[11px] text-order-taupe">
                  Turn off to pause checkout entirely (emergency break).
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl bg-order-bg/80 px-3 py-2.5 ring-1 ring-order-line/45">
              <input
                type="checkbox"
                name="orderIntakeScheduleEnabled"
                value="on"
                defaultChecked={s.orderIntakeScheduleEnabled}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-order-line accent-order-brownBtn"
              />
              <span>
                <span className="block font-sans text-sm font-medium text-order-brownInk">
                  Enforce intake schedule
                </span>
                <span className="mt-0.5 block font-sans text-[11px] text-order-taupe">
                  Off = no weekday or time checks (still respects “accept orders”
                  above).
                </span>
              </span>
            </label>

            <fieldset className="rounded-xl border border-order-line/55 bg-order-bg/50 px-3 py-3">
              <legend className="px-1 font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-order-muted">
                Kitchen days (sell / fulfil)
              </legend>
              <p className="mt-1 font-sans text-[10px] leading-relaxed text-order-taupe">
                Weekdays you actually hand over or deliver. Intake opens the previous calendar day at 6am and closes at 6am on the kitchen day (same shop clock as the daily cap).
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {JS_WEEKDAY_LONG.map((label, wd) => (
                  <label
                    key={wd}
                    className="flex cursor-pointer items-center gap-2 rounded-lg bg-order-card px-2 py-1.5 font-sans text-[11px] text-order-brownInk ring-1 ring-order-line/40"
                  >
                    <input
                      type="checkbox"
                      name="serviceWeekday"
                      value={String(wd)}
                      defaultChecked={s.serviceWeekdays.includes(wd)}
                      className="h-3.5 w-3.5 shrink-0 rounded border-order-line accent-order-brownBtn"
                    />
                    {label.slice(0, 3)}
                  </label>
                ))}
              </div>
            </fieldset>

            {message ? (
              <p className="rounded-lg border border-red-200/80 bg-red-50 px-3 py-2 font-sans text-xs text-red-900">
                {message}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-order-brownBtn px-5 py-2.5 font-sans text-sm font-semibold text-white shadow-sm ring-1 ring-order-brownBtn/20 transition hover:brightness-110 disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save intake settings"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
