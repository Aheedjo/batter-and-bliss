/** Nigerian Naira amount for menu prices and totals. */
export function formatPrice(n: number) {
  return `₦${Math.round(n).toLocaleString("en-NG")}`;
}
