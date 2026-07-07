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
import { updateHeroImage } from "@/app/admin/shop-settings-actions";
import { MenuImageField } from "@/components/admin/menu-image-field";

type Props = {
  heroImageUrl: string | null;
};

export function HeroImageSettings({ heroImageUrl }: Props) {
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
  }, [expanded, message, pending, heroImageUrl]);

  function onSubmit(fd: FormData) {
    setMessage(null);
    startTransition(async () => {
      const res = await updateHeroImage(undefined, fd);
      if (!res.ok) setMessage(res.message);
      else {
        setMessage("Saved. It’s now live on the homepage.");
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
          <span className="font-sans text-[10px] font-bold uppercase tracking-[0.18em] text-order-taupe">
            Homepage image
          </span>
          <p className="mt-1 font-serif text-[1.35rem] font-semibold tracking-tight text-order-brownInk sm:text-2xl">
            Hero photo
          </p>
          <p className="mt-0.5 font-sans text-[11px] text-order-muted">
            {heroImageUrl
              ? "Custom photo is live — tap to change it."
              : "Using the default photo — tap to upload your own."}
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
        aria-label="Homepage hero image settings"
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
            This is the big photo at the top of the homepage. Upload a new one
            and save to change it yourself — no need to reach out.
          </p>

          <form action={onSubmit} className="mt-4 space-y-4">
            <MenuImageField
              key={`hero-${heroImageUrl ?? "default"}`}
              initialUrl={heroImageUrl}
              itemName="Homepage hero"
            />
            {message ? (
              <p
                className={`font-sans text-xs font-medium ${
                  message.startsWith("Saved")
                    ? "text-order-brownInk"
                    : "text-red-600"
                }`}
              >
                {message}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={pending}
              className="rounded-full border border-order-line/90 bg-white px-4 py-2 font-sans text-xs font-semibold text-order-brownInk shadow-sm transition hover:bg-order-bg disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save homepage image"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
