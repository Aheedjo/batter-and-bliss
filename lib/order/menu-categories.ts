export const TOPPING_CATEGORIES = [
  "glazing",
  "platter_drizzle",
  "topping",
  "platter_topping",
  "syrup",
  "drink",
  /** @deprecated Legacy rows only — not shown on the platter order flow */
  "platter_glazing",
] as const;

export type ToppingCategory = (typeof TOPPING_CATEGORIES)[number];

/** Categories shown when creating/editing toppings in admin (no legacy). */
export const ADMIN_TOPPING_CATEGORIES = TOPPING_CATEGORIES.filter(
  (c) => c !== "platter_glazing",
);

export function isToppingCategory(s: string): s is ToppingCategory {
  return (TOPPING_CATEGORIES as readonly string[]).includes(s);
}

/** Platter customize add-ons — each row is tied to one platter base. */
export function isPlatterAddOnCategory(c: string) {
  return c === "platter_topping" || c === "platter_drizzle";
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
    case "platter_drizzle":
      return "Platter drizzle";
    case "platter_glazing":
      return "Platter glazing (legacy)";
    case "topping":
      return "Topping";
    case "platter_topping":
      return "Platter topping";
    case "syrup":
      return "Syrup";
    case "drink":
      return "Drinks";
    default:
      return c;
  }
}
