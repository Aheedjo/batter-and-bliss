import { RANDOM_BLISS_FEE } from "@/lib/order/constants";
import type { PancakeLine } from "@/lib/order/pancake-types";

export type PricedCatalogItem = { id: string; name: string; price: number | null };
export type PricedStackItem = { id: string; name: string; price: number };

/** Structured rows for checkout / receipts; flat `lines` stays for stored customization text. */
export type CartSummaryLine =
  | { kind: "pancake"; title: string; details: string | null; lineTotal: number }
  | { kind: "drink"; name: string; qty: number; lineTotal: number };

export function computeCartTotal(
  pancakeLines: PancakeLine[],
  drinkQuantities: Record<string, number>,
  stacks: PricedStackItem[],
  catalog: PricedCatalogItem[],
) {
  const stackById = new Map(stacks.map((s) => [s.id, s]));
  const byId = new Map(catalog.map((t) => [t.id, t]));
  let total = 0;
  const lines: string[] = [];
  const summaryLines: CartSummaryLine[] = [];

  for (const line of pancakeLines) {
    const stack = stackById.get(line.stackId);
    if (!stack) continue;
    let lineTotal = stack.price;
    const bits: string[] = [];
    if (line.randomBliss) {
      lineTotal += RANDOM_BLISS_FEE;
      bits.push("Random Bliss");
    } else {
      for (const aid of line.addOnIds) {
        const t = byId.get(aid);
        if (t?.price != null) lineTotal += t.price;
        if (t) bits.push(t.name);
      }
    }
    total += lineTotal;
    const flat = `${stack.name}${bits.length ? ` · ${bits.join(", ")}` : ""}`;
    lines.push(flat);
    summaryLines.push({
      kind: "pancake",
      title: stack.name,
      details: bits.length ? bits.join(", ") : null,
      lineTotal,
    });
  }

  for (const [id, qty] of Object.entries(drinkQuantities)) {
    if (qty <= 0) continue;
    const t = byId.get(id);
    const unit = t?.price ?? 0;
    const sub = unit * qty;
    total += sub;
    if (t) {
      lines.push(`${t.name} ×${qty}`);
      summaryLines.push({
        kind: "drink",
        name: t.name,
        qty,
        lineTotal: sub,
      });
    }
  }

  return { total, lines, summaryLines };
}
