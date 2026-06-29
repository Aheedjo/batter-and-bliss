export function parseOptionalImageUrl(raw: unknown): string | null {
  if (raw == null) return null;
  const value = String(raw).trim();
  if (value === "") return null;
  if (value.length > 2048) return null;
  if (value.startsWith("/uploads/")) return value;
  if (value.startsWith("https://")) return value;
  return null;
}
