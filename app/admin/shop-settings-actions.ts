"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { serviceWeekdaysToJson } from "@/lib/order/order-intake";

const SETTINGS_ID = "default";

export type ShopSettingsActionState =
  | { ok: true }
  | { ok: false; message: string };

function fail(message: string): ShopSettingsActionState {
  return { ok: false, message };
}

export async function updateDailyOrderCap(
  _prev: ShopSettingsActionState | undefined,
  formData: FormData,
): Promise<ShopSettingsActionState> {
  const raw = formData.get("dailyOrderCap")?.toString().trim() ?? "";
  let dailyOrderCap: number | null = null;
  if (raw !== "") {
    const n = Number.parseInt(raw, 10);
    if (!Number.isFinite(n) || n < 1 || n > 99_999) {
      return fail("Enter a whole number from 1 to 99,999, or leave blank for no limit.");
    }
    dailyOrderCap = n;
  }

  try {
    await prisma.shopSetting.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID, dailyOrderCap },
      update: { dailyOrderCap },
    });
  } catch (e) {
    console.error(e);
    return fail("Could not save settings.");
  }
  revalidatePath("/admin");
  revalidatePath("/order/checkout");
  return { ok: true };
}

export async function updateOrderIntakeSettings(
  _prev: ShopSettingsActionState | undefined,
  formData: FormData,
): Promise<ShopSettingsActionState> {
  const orderIntakeEnabled = formData.get("orderIntakeEnabled") === "on";
  const orderIntakeScheduleEnabled =
    formData.get("orderIntakeScheduleEnabled") === "on";

  const dayVals = formData
    .getAll("serviceWeekday")
    .map((x) => Number.parseInt(String(x), 10))
    .filter((n) => Number.isInteger(n) && n >= 0 && n <= 6);
  const serviceWeekdaysJson = serviceWeekdaysToJson(
    dayVals.length ? dayVals : [3],
  );

  try {
    await prisma.shopSetting.upsert({
      where: { id: SETTINGS_ID },
      create: {
        id: SETTINGS_ID,
        dailyOrderCap: null,
        orderIntakeEnabled,
        orderIntakeScheduleEnabled,
        serviceWeekdaysJson,
      },
      update: {
        orderIntakeEnabled,
        orderIntakeScheduleEnabled,
        serviceWeekdaysJson,
      },
    });
  } catch (e) {
    console.error(e);
    return fail("Could not save intake settings.");
  }
  revalidatePath("/admin");
  revalidatePath("/order/checkout");
  revalidatePath("/order", "layout");
  return { ok: true };
}
