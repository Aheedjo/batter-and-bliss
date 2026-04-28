import {
  MARQUEE_REVIEWS,
  type MarqueeReview,
} from "@/lib/landing/marquee-reviews";

const QUOTE_CARD_BASE =
  "shrink-0 rounded-2xl bg-white/65 px-3.5 py-1.5 text-center font-serif text-[12px] font-medium italic leading-tight text-brand-chocolate antialiased shadow-sm ring-1 ring-brand-chocolate/[0.08] sm:px-4 sm:py-2 sm:text-[13px]";

/** Marquee row: stretch to tallest card in the row; center quote inside (no extra height beyond that). */
const QUOTE_CARD_MARQUEE = `${QUOTE_CARD_BASE} flex min-h-0 items-center justify-center`;

/** Reduced-motion layout uses CSS Grid (`gap-y` / `gap-x`); columns were swallowing vertical space. */
const QUOTE_CARD_STATIC = `${QUOTE_CARD_BASE} w-full min-w-0`;

const POP_CLASS =
  "font-extrabold not-italic text-brand-chocolate [font-synthesis:weight]";

/** Tight → wide; cycles with index (+ row salt) so the strip feels uneven and editorial. */
const QUOTE_WIDTHS = [
  "max-w-[11.75rem] sm:max-w-[13rem]",
  "max-w-[15rem] sm:max-w-[17rem]",
  "max-w-[18rem] sm:max-w-[20.5rem]",
  "max-w-[min(90vw,21rem)] sm:max-w-[25rem]",
] as const;

function quoteCardClassAt(index: number, rowSalt = 0) {
  const w = QUOTE_WIDTHS[(index + rowSalt) % QUOTE_WIDTHS.length];
  return `${QUOTE_CARD_MARQUEE} ${w}`;
}

function ReviewText({ parts }: { parts: MarqueeReview }) {
  return (
    <>
      {parts.map((part, i) =>
        part.pop ? (
          <span key={i} className={POP_CLASS}>
            {part.t}
          </span>
        ) : (
          <span key={i}>{part.t}</span>
        ),
      )}
    </>
  );
}

const ROW_ANIMATIONS = [
  "animate-marquee-slow",
  "animate-marquee-slow-reverse",
  "animate-marquee-slower",
  "animate-marquee-slower-reverse",
  "animate-marquee-slowest-reverse",
] as const;

function MarqueeRow({
  rowId,
  rowSalt,
  animationClass,
  className,
}: {
  rowId: string;
  rowSalt: number;
  animationClass: (typeof ROW_ANIMATIONS)[number];
  className?: string;
}) {
  const items = [...MARQUEE_REVIEWS, ...MARQUEE_REVIEWS];
  return (
    <div
      className={[
        "relative overflow-hidden py-0",
        "[-webkit-mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]",
        "[mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]",
        className ?? "",
      ].join(" ")}
    >
      <div
        className={[
          "flex w-max items-stretch gap-1.5 sm:gap-2",
          animationClass,
          "hover:[animation-play-state:paused]",
        ].join(" ")}
      >
        {items.map((review, i) => (
          <p key={`${rowId}-${i}`} className={quoteCardClassAt(i, rowSalt)}>
            <span className="inline-block max-w-full text-pretty">
              <span className="font-medium text-brand-chocolate/85">“</span>
              <ReviewText parts={review} />
              <span className="font-medium text-brand-chocolate/85">”</span>
            </span>
          </p>
        ))}
      </div>
    </div>
  );
}

export function TestimonialMarquee() {
  return (
    <section
      className="border-y border-brand-chocolate/[0.06] bg-brand-bgDeep/25 py-5 sm:py-6"
      aria-label="Kind words from guests"
    >
      <p className="mb-px text-center font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-taupe">
        Kind words
      </p>
      <h2 className="mb-3 text-center font-serif text-lg font-semibold tracking-[-0.02em] text-brand-chocolate sm:text-xl">
        What people are saying
      </h2>
      <div className="flex flex-col gap-3 motion-reduce:hidden sm:gap-3.5">
        <MarqueeRow
          rowId="a"
          rowSalt={0}
          animationClass={ROW_ANIMATIONS[0]}
        />
        <MarqueeRow
          rowId="b"
          rowSalt={1}
          animationClass={ROW_ANIMATIONS[1]}
          className="opacity-90"
        />
        <MarqueeRow
          rowId="c"
          rowSalt={2}
          animationClass={ROW_ANIMATIONS[2]}
          className="opacity-[0.86]"
        />
        <MarqueeRow
          rowId="d"
          rowSalt={3}
          animationClass={ROW_ANIMATIONS[3]}
          className="opacity-80"
        />
        <MarqueeRow
          rowId="e"
          rowSalt={5}
          animationClass={ROW_ANIMATIONS[4]}
          className="opacity-[0.76]"
        />
      </div>
      <div
        className={[
          "hidden motion-reduce:grid motion-reduce:items-start motion-reduce:px-3",
          "motion-reduce:grid-cols-2 motion-reduce:gap-x-4 motion-reduce:gap-y-4",
          "sm:motion-reduce:grid-cols-3 sm:motion-reduce:gap-x-5 sm:motion-reduce:gap-y-5",
          "lg:motion-reduce:grid-cols-4",
        ].join(" ")}
      >
        {MARQUEE_REVIEWS.map((review, i) => (
          <p key={i} className={QUOTE_CARD_STATIC}>
            <span className="font-medium text-brand-chocolate/85">“</span>
            <ReviewText parts={review} />
            <span className="font-medium text-brand-chocolate/85">”</span>
          </p>
        ))}
      </div>
    </section>
  );
}
