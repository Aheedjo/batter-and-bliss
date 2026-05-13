import { cache } from "react";
import type { ShopSetting } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  civilDateKeyAddDays,
  civilDateKeyToJsWeekday,
  formatShopCalendarDayLong,
  lagosCalendarDateKey,
  lagosMinutesFromMidnight,
  SHOP_DAY_ROLLOVER_MINUTES,
} from "@/lib/order/lagos-calendar";

const SHOP_ID = "default";

/** Short label for admin UI (matches {@link SHOP_DAY_ROLLOVER_MINUTES}). */
export const INTAKE_WINDOW_LABEL = "6am day before → 6am kitchen day";

const JS_WEEKDAY_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export type ShopIntakeSettings = {
  orderIntakeEnabled: boolean;
  orderIntakeScheduleEnabled: boolean;
  serviceWeekdays: readonly number[];
};

export type PublicOrderIntakeSnapshot = {
  checkoutAllowed: boolean;
  checkoutBlockedMessage: string | null;
  /** Shown when ordering is closed or paused; hidden when open. */
  banner: {
    variant: "danger" | "warning";
    title: string;
    body: string;
  } | null;
  /** YYYY-MM-DD for the shop calendar day at evaluation time. */
  shopCalendarTodayKey: string;
  /**
   * When checkout is open and the schedule applies: the kitchen / sell date
   * (YYYY-MM-DD) this intake window is for.
   */
  orderForDateKey: string | null;
  /** Human-readable `orderForDateKey`, e.g. “Wednesday, 14 May”. */
  orderForDayLabel: string | null;
  settings: ShopIntakeSettings;
};

function parseServiceWeekdaysJson(json: string): number[] {
  try {
    const v = JSON.parse(json) as unknown;
    if (!Array.isArray(v)) return [3];
    const xs = v.filter(
      (x): x is number =>
        typeof x === "number" &&
        Number.isInteger(x) &&
        x >= 0 &&
        x <= 6,
    );
    const uniq = [...new Set(xs)].sort((a, b) => a - b);
    return uniq.length ? uniq : [3];
  } catch {
    return [3];
  }
}

export function shopSettingRowToIntakeSettings(row: ShopSetting | null): ShopIntakeSettings {
  if (!row) {
    return {
      orderIntakeEnabled: true,
      orderIntakeScheduleEnabled: true,
      serviceWeekdays: [3],
    };
  }
  return {
    orderIntakeEnabled: row.orderIntakeEnabled,
    orderIntakeScheduleEnabled: row.orderIntakeScheduleEnabled,
    serviceWeekdays: parseServiceWeekdaysJson(row.serviceWeekdaysJson),
  };
}

type IntakeReason =
  | "allowed"
  | "paused"
  | "service_day_closed"
  | "not_intake_day"
  | "before_window";

function evaluateIntakeReason(now: Date, s: ShopIntakeSettings): IntakeReason {
  if (!s.orderIntakeEnabled) return "paused";
  if (!s.orderIntakeScheduleEnabled) return "allowed";

  const todayKey = lagosCalendarDateKey(now);
  const todayWd = civilDateKeyToJsWeekday(todayKey);
  const tomorrowKey = civilDateKeyAddDays(todayKey, 1);
  const tomorrowWd = civilDateKeyToJsWeekday(tomorrowKey);
  const serviceSet = new Set(s.serviceWeekdays);
  const mins = lagosMinutesFromMidnight(now);

  if (serviceSet.has(todayWd)) {
    if (mins < SHOP_DAY_ROLLOVER_MINUTES) return "allowed";
    return "service_day_closed";
  }

  if (!serviceSet.has(tomorrowWd)) return "not_intake_day";

  if (mins < SHOP_DAY_ROLLOVER_MINUTES) return "before_window";
  return "allowed";
}

/** Kitchen batch date (YYYY-MM-DD) when intake is open under the schedule; else null. */
function kitchenBatchDateKeyWhenScheduleAllows(
  now: Date,
  s: ShopIntakeSettings,
): string | null {
  if (!s.orderIntakeScheduleEnabled) return null;

  const todayKey = lagosCalendarDateKey(now);
  const todayWd = civilDateKeyToJsWeekday(todayKey);
  const tomorrowKey = civilDateKeyAddDays(todayKey, 1);
  const tomorrowWd = civilDateKeyToJsWeekday(tomorrowKey);
  const serviceSet = new Set(s.serviceWeekdays);
  const mins = lagosMinutesFromMidnight(now);

  if (serviceSet.has(todayWd)) {
    if (mins < SHOP_DAY_ROLLOVER_MINUTES) return todayKey;
    return null;
  }

  if (!serviceSet.has(tomorrowWd)) return null;
  if (mins < SHOP_DAY_ROLLOVER_MINUTES) return null;
  return tomorrowKey;
}

function blockedMessage(reason: IntakeReason): string {
  switch (reason) {
    case "paused":
      return "Try again later or message us if you need anything.";
    case "service_day_closed":
      return "We’ve stopped taking new orders for today’s kitchen day. The next window opens at 6am the day before the next kitchen day (shop time).";
    case "not_intake_day":
      return "We’re not in an order window right now. Check back the day before a kitchen day.";
    case "before_window":
      return "Ordering for the next kitchen day opens at 6am (shop time).";
    default:
      return "Ordering isn’t available right now.";
  }
}

function snapshotOrderForFields(
  now: Date,
  s: ShopIntakeSettings,
  reason: IntakeReason,
): { orderForDateKey: string | null; orderForDayLabel: string | null } {
  if (reason !== "allowed") {
    return { orderForDateKey: null, orderForDayLabel: null };
  }
  const key = kitchenBatchDateKeyWhenScheduleAllows(now, s);
  if (!key) return { orderForDateKey: null, orderForDayLabel: null };
  return {
    orderForDateKey: key,
    orderForDayLabel: formatShopCalendarDayLong(key),
  };
}

export function buildPublicOrderIntakeSnapshot(
  now: Date,
  s: ShopIntakeSettings,
): PublicOrderIntakeSnapshot {
  const reason = evaluateIntakeReason(now, s);
  const allowed = reason === "allowed";
  const shopCalendarTodayKey = lagosCalendarDateKey(now);
  const orderFor = snapshotOrderForFields(now, s, reason);

  if (!s.orderIntakeEnabled) {
    return {
      checkoutAllowed: false,
      checkoutBlockedMessage: blockedMessage("paused"),
      banner: {
        variant: "danger",
        title: "Orders paused",
        body: blockedMessage("paused"),
      },
      shopCalendarTodayKey,
      orderForDateKey: null,
      orderForDayLabel: null,
      settings: s,
    };
  }

  if (!s.orderIntakeScheduleEnabled) {
    return {
      checkoutAllowed: true,
      checkoutBlockedMessage: null,
      banner: null,
      shopCalendarTodayKey,
      orderForDateKey: null,
      orderForDayLabel: null,
      settings: s,
    };
  }

  if (allowed) {
    return {
      checkoutAllowed: true,
      checkoutBlockedMessage: null,
      banner: null,
      shopCalendarTodayKey,
      orderForDateKey: orderFor.orderForDateKey,
      orderForDayLabel: orderFor.orderForDayLabel,
      settings: s,
    };
  }

  return {
    checkoutAllowed: false,
    checkoutBlockedMessage: blockedMessage(reason),
    banner: {
      variant: "warning",
      title: "Orders aren’t open",
      body: blockedMessage(reason),
    },
    shopCalendarTodayKey,
    orderForDateKey: null,
    orderForDayLabel: null,
    settings: s,
  };
}

export async function loadShopIntakeSettings(): Promise<ShopIntakeSettings> {
  const row = await prisma.shopSetting.findUnique({ where: { id: SHOP_ID } });
  return shopSettingRowToIntakeSettings(row);
}

/** Dedupes within one RSC render tree (layout + pages). */
export const getCachedPublicOrderIntakeSnapshot = cache(
  async (): Promise<PublicOrderIntakeSnapshot> => {
    const now = new Date();
    const s = await loadShopIntakeSettings();
    return buildPublicOrderIntakeSnapshot(now, s);
  },
);

export function evaluateCheckoutIntake(
  now: Date,
  s: ShopIntakeSettings,
): { ok: true } | { ok: false; message: string } {
  const snap = buildPublicOrderIntakeSnapshot(now, s);
  if (snap.checkoutAllowed) return { ok: true };
  return { ok: false, message: snap.checkoutBlockedMessage ?? "Ordering is closed right now." };
}

export function serviceWeekdaysToJson(weekdays: number[]): string {
  const uniq = [...new Set(weekdays)]
    .filter((n) => Number.isInteger(n) && n >= 0 && n <= 6)
    .sort((a, b) => a - b);
  return JSON.stringify(uniq.length ? uniq : [3]);
}

export { JS_WEEKDAY_LONG };
