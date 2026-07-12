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
import { updateBoxNoteFee } from "@/app/admin/shop-settings-actions";
import { formatPrice } from "@/lib/order/money";

type Props = {
  boxNoteFee: number;
};

export function BoxNoteFeeSettings({ boxNoteFee }: Props) {
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
  }, [expanded, message, pending, boxNoteFee]);

  function onSubmit(fd: FormData) {
    setMessage(null);
    startTransition(async () => {
      const res = await updateBoxNoteFee(undefined, fd);
      if (!res.ok) setMessage(res.message);
      else {
        router.refresh();
        setMessage(null);
      }
    });
  }

  const feeLabel =
    boxNoteFee > 0 ? formatPrice(boxNoteFee) : "Free";

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
          <span className="font-sans text-[10px] font-bold uppercase tracking-[0.18em] text-order-taupe">
            Box card message fee
          </span>
          <p className="mt-1 font-sans text-sm text-order-brownInk">
            {feeLabel}{" "}
            <span className="text-order-muted">when customer adds a box-card message</span>
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
        <div ref={panelInnerRef} className="border-t border-order-line/60 px-4 pb-4 pt-3 sm:px-4">
          <p className="font-sans text-xs leading-relaxed text-order-muted">
            Charged once when the customer writes a message for the greeting card
            on the box at checkout. Set to 0 to make box-card messages free.
          </p>
          <form action={onSubmit} className="mt-4 space-y-3">
            <label className="block font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-order-taupe">
              Fee (₦)
            </label>
            <input
              type="number"
              name="boxNoteFee"
              min={0}
              max={99999}
              step={1}
              defaultValue={String(boxNoteFee)}
              key={`box-note-fee-${boxNoteFee}`}
              className={inputClass}
            />
            {message ? (
              <p className="font-sans text-sm text-order-red-text" role="alert">
                {message}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={pending}
              className="rounded-full bg-order-brownBtn px-4 py-2 font-sans text-sm font-semibold text-white shadow-order-btn ring-1 ring-order-brownBtn/20 transition hover:brightness-110 disabled:opacity-50"
            >
              {pending ? "Saving…" : "Save fee"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
