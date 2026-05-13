/**
 * Fixed IANA zone for shop calendar + windows (WAT, same wall clock nationwide).
 * Customer copy should say “shop time” / “Nigeria time”, not a city name.
 */
export const SHOP_TIMEZONE = "Africa/Lagos";
/** @deprecated Use SHOP_TIMEZONE */
export const LAGOS_TIMEZONE = SHOP_TIMEZONE;

/**
 * Shop “day” rolls at this clock time (WAT). Used for intake boundaries and
 * daily transfer cap. Nigeria has no DST; WAT = UTC+1 year-round.
 */
export const SHOP_DAY_ROLLOVER_MINUTES = 6 * 60;

/**
 * Absolute instant for `hour`:`minute` on civil `dateKey` (YYYY-MM-DD) in the
 * shop zone. Implemented via fixed WAT = UTC+1 (matches Africa/Lagos).
 */
export function utcInstantForShopCalendarClock(
  dateKey: string,
  hour: number,
  minute: number,
): Date {
  const [y, m, d] = dateKey.split("-").map((x) => Number.parseInt(x, 10));
  if ([y, m, d].some((n) => !Number.isFinite(n))) return new Date(0);
  return new Date(Date.UTC(y, m - 1, d, hour - 1, minute, 0, 0));
}

/** YYYY-MM-DD in the shop timezone for the given instant. */
export function lagosCalendarDateKey(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SHOP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export function lagosCalendarDateKeyFromIso(iso: string): string | null {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  return lagosCalendarDateKey(new Date(t));
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/** Pure calendar step for `YYYY-MM-DD` keys (aligned with shop calendar). */
export function civilDateKeyAddDays(dateKey: string, deltaDays: number): string {
  const [y, m, d] = dateKey.split("-").map((x) => Number.parseInt(x, 10));
  if ([y, m, d].some((n) => !Number.isFinite(n))) return dateKey;
  const base = new Date(Date.UTC(y, m - 1, d + deltaDays));
  return `${String(base.getUTCFullYear()).padStart(4, "0")}-${pad2(
    base.getUTCMonth() + 1,
  )}-${pad2(base.getUTCDate())}`;
}

/** JS weekday 0–6 (Sun–Sat) for the civil `YYYY-MM-DD` key. */
export function civilDateKeyToJsWeekday(dateKey: string): number {
  const [y, m, d] = dateKey.split("-").map((x) => Number.parseInt(x, 10));
  if ([y, m, d].some((n) => !Number.isFinite(n))) return 0;
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** Minutes since local midnight in the shop timezone for this instant. */
export function lagosMinutesFromMidnight(now: Date): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: SHOP_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const mi = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return h * 60 + mi;
}

/** Civil date key when the current 6am–6am cap / intake shop “day” started. */
export function shopCapWindowStartDateKey(now: Date): string {
  const key = lagosCalendarDateKey(now);
  const mins = lagosMinutesFromMidnight(now);
  return mins < SHOP_DAY_ROLLOVER_MINUTES
    ? civilDateKeyAddDays(key, -1)
    : key;
}

/** Civil date of the end boundary (exclusive) of the shop window that starts at {@link shopCapWindowStartDateKey}. */
export function shopCapWindowEndDateKey(now: Date): string {
  return civilDateKeyAddDays(shopCapWindowStartDateKey(now), 1);
}

/** Inclusive start, exclusive end — payment reports in this range share one cap bucket. */
export function shopCapWindowBoundsUtc(now: Date): { start: Date; end: Date } {
  const startKey = shopCapWindowStartDateKey(now);
  const endKey = shopCapWindowEndDateKey(now);
  return {
    start: utcInstantForShopCalendarClock(startKey, 6, 0),
    end: utcInstantForShopCalendarClock(endKey, 6, 0),
  };
}

/** One-line summary for admin / errors (shop clock). */
export function formatShopCapWindowSummary(now: Date): string {
  const a = shopCapWindowStartDateKey(now);
  const b = shopCapWindowEndDateKey(now);
  return `${a} 6:00 → ${b} 6:00`;
}

/** Long weekday + date for a civil `YYYY-MM-DD` key (matches shop calendar day). */
export function formatShopCalendarDayLong(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map((x) => Number.parseInt(x, 10));
  if ([y, m, d].some((n) => !Number.isFinite(n))) return dateKey;
  const utc = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat("en-NG", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(utc);
}
