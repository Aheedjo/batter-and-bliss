/** Plain amount for menu prices (no currency symbol). */
export function formatPrice(n: number) {
  return Math.round(n).toLocaleString();
}
