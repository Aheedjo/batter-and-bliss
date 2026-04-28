import Link from "next/link";

export function OrderNudgeCta() {
  return (
    <section
      className="mx-auto max-w-md px-4 py-11 text-center sm:py-14"
      aria-label="Order pancakes for delivery"
    >
      <div
        className="mx-auto mb-8 h-px w-20 bg-gradient-to-r from-transparent via-brand-kraft/70 to-transparent sm:mb-9"
        aria-hidden
      />
      <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.28em] text-brand-taupe">
        Same menu, your door
      </p>
      <p className="mt-3 font-brand text-[1.65rem] leading-[1.15] text-brand-chocolate sm:text-[2rem]">
        Ready when you are
      </p>
      <p className="mx-auto mt-3 max-w-[22rem] font-sans text-[13px] leading-relaxed text-brand-taupe sm:text-[14px]">
        Stack, glaze, and toppings—then checkout. We&apos;ll bring it over.
      </p>
      <Link
        href="/order"
        className="mt-8 inline-flex items-center justify-center rounded-full border border-brand-roseDeep/40 bg-white/50 px-8 py-3.5 font-sans text-[12px] font-semibold uppercase tracking-[0.14em] text-brand-chocolate shadow-sm ring-1 ring-brand-chocolate/[0.04] backdrop-blur-[2px] transition hover:border-brand-roseDeep/65 hover:bg-white/80 hover:shadow-md active:scale-[0.99] sm:mt-9 sm:text-[13px]"
      >
        Place your order
      </Link>
    </section>
  );
}
