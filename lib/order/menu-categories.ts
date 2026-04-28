export const TOPPING_CATEGORIES = [
  "glazing",
  "topping",
  "syrup",
  "drink",
] as const;

export type ToppingCategory = (typeof TOPPING_CATEGORIES)[number];

export function isToppingCategory(s: string): s is ToppingCategory {
  return (TOPPING_CATEGORIES as readonly string[]).includes(s);
}

export function compareToppingCategory(a: string, b: string) {
  const ia = TOPPING_CATEGORIES.indexOf(a as ToppingCategory);
  const ib = TOPPING_CATEGORIES.indexOf(b as ToppingCategory);
  const fa = ia === -1 ? 999 : ia;
  const fb = ib === -1 ? 999 : ib;
  return fa - fb;
}

export function labelForToppingCategory(c: string): string {
  switch (c) {
    case "glazing":
      return "Glazing";
    case "topping":
      return "Topping";
    case "syrup":
      return "Syrup";
    case "drink":
      return "Drinks";
    default:
      return c;
  }
}
