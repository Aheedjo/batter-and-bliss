"use client";

type Props = {
  active: boolean;
  onToggle: () => void;
};

export function RandomBlissCard({ active, onToggle }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative w-full overflow-hidden rounded-[1.75rem] p-4 text-left shadow-lift transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-order-brown/25 ${
        active
          ? "bg-order-brownBtn text-white ring-1 ring-order-brownBtn/30 shadow-order-btn-lg"
          : "bg-order-card text-order-brownInk ring-1 ring-black/[0.06] shadow-card"
      }`}
    >
      <div
        className={`pointer-events-none absolute -right-4 -top-4 text-6xl ${
          active ? "text-white/[0.12]" : "text-order-brown/[0.08]"
        }`}
        aria-hidden
      >
        ✦
      </div>
      <div className="flex gap-3">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl ${
            active
              ? "bg-white/15 backdrop-blur-sm"
              : "bg-order-bg ring-1 ring-black/[0.05]"
          }`}
        >
          🪄
        </span>
        <div>
          <p
            className={`font-serif text-lg font-bold ${
              active ? "text-white" : "text-order-brownInk"
            }`}
          >
            Random Bliss
          </p>
          <p
            className={`mt-1 font-sans text-sm leading-snug ${
              active ? "text-white/88" : "text-order-taupe"
            }`}
          >
            Let our baker surprise you with a curated topping combination.
          </p>
        </div>
      </div>
    </button>
  );
}
