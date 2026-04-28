export function BrandRibbonBand() {
  return (
    <div
      className="relative left-1/2 w-screen max-w-none -translate-x-1/2"
      aria-label="Brand values: elegance, craft, bliss"
    >
      <div className="relative overflow-hidden bg-gradient-to-r from-[#1a0f0c] via-brand-chocolate to-[#1a0f0c] py-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_32px_rgba(46,26,20,0.18)] sm:py-9">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-kraft/50 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-black/40 to-transparent" />

        <p className="relative px-6 text-center font-serif text-[clamp(1.35rem,4.5vw,2.35rem)] font-medium leading-tight tracking-[0.08em] text-white sm:tracking-[0.12em]">
          <span className="whitespace-normal sm:whitespace-nowrap">
            Elegance · Craft · Bliss
          </span>
        </p>
      </div>
    </div>
  );
}
