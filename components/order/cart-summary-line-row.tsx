import type { CartSummaryLine } from "@/lib/order/pricing";
import { formatPrice } from "@/lib/order/money";

export function CartSummaryLineRow({ item }: { item: CartSummaryLine }) {
  if (item.kind === "pancake") {
    return (
      <li>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-serif text-[16px] font-semibold leading-snug tracking-[-0.02em] text-order-brownInk">
              {item.title}
            </p>
            {item.details ? (
              <p className="mt-1.5 max-w-prose font-sans text-[12px] font-normal leading-relaxed text-order-taupe">
                {item.details}
              </p>
            ) : null}
          </div>
          <span className="shrink-0 font-serif text-[15px] font-semibold tabular-nums tracking-tight text-order-brownInk">
            {formatPrice(item.lineTotal)}
          </span>
        </div>
      </li>
    );
  }

  return (
    <li>
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 flex-1 font-serif text-[16px] font-semibold leading-snug text-order-brownInk">
          {item.name}
        </p>
        <div className="shrink-0 text-right">
          <p className="font-sans text-[12px] font-semibold tabular-nums text-order-taupe">
            ×{item.qty}
          </p>
          <p className="mt-0.5 font-serif text-[15px] font-semibold tabular-nums tracking-tight text-order-brownInk">
            {formatPrice(item.lineTotal)}
          </p>
        </div>
      </div>
    </li>
  );
}
