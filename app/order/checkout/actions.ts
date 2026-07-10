"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import {
  countPancakesInOrder,
  countPancakesInSummaryLines,
  countTransferredSlotsForShopCapWindow,
  getDailyOrderCap,
  wouldExceedPancakeCap,
} from "@/lib/order/daily-order-cap";
import {
  DRINKS_ONLY_STACK_ID,
  isDrinksOnlySummary,
} from "@/lib/order/drinks-only";
import { formatShopCapWindowSummary, shopCapWindowBoundsUtc } from "@/lib/order/lagos-calendar";
import { evaluateCheckoutIntake, loadShopIntakeSettings } from "@/lib/order/order-intake";
import {
  checkoutOrderPayloadSchema,
  type CheckoutOrderPayload,
} from "@/lib/validations/checkout-order";
import { z } from "zod";

export type CreateOrderResult = { ok: true } | { ok: false; message: string };

function fail(message: string): CreateOrderResult {
  return { ok: false, message };
}

const referenceReportSchema = z
  .string()
  .regex(/^BB-[A-Z0-9]{8,24}$/, "Invalid reference.");

export type ReportTransferResult = { ok: true } | { ok: false; message: string };

function failReport(message: string): ReportTransferResult {
  return { ok: false, message };
}

/**
 * Customer marks bank transfer as sent. Counts toward the daily cap;
 * idempotent per order. Rejected orders cannot report.
 */
export async function reportTransferSent(
  rawReference: unknown,
): Promise<ReportTransferResult> {
  const refParsed = referenceReportSchema.safeParse(
    typeof rawReference === "string" ? rawReference.trim() : "",
  );
  if (!refParsed.success) return failReport("Invalid order reference.");

  const reference = refParsed.data;
  const at = new Date().toISOString();

  try {
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { reference },
        select: {
          id: true,
          status: true,
          transferReportedAt: true,
          stackId: true,
          summaryLines: true,
        },
      });
      if (!order) return { type: "fail" as const, message: "Order not found." };
      if (order.status === "rejected") {
        return {
          type: "fail" as const,
          message:
            "This order was not accepted. Place a new order if you still need service.",
        };
      }
      if (order.transferReportedAt != null) {
        return { type: "ok" as const, idempotent: true };
      }

      const cap = await getDailyOrderCap();
      if (cap != null && order.stackId !== DRINKS_ONLY_STACK_ID) {
        const used = await countTransferredSlotsForShopCapWindowWithTx(
          tx,
          new Date(),
        );
        const pancakesInOrder = countPancakesInOrder(order);
        if (wouldExceedPancakeCap(cap, used, pancakesInOrder)) {
          return {
            type: "fail" as const,
            message: `We’ve reached pancake capacity for payment reports in this shop period (${formatShopCapWindowSummary(new Date())}). Try again after the next window or contact us for help.`,
          };
        }
      }

      await tx.order.update({
        where: { id: order.id },
        data: { transferReportedAt: at },
      });
      return { type: "ok" as const, idempotent: false };
    });

    if (result.type === "fail") return failReport(result.message);

    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath("/order/checkout");
    return { ok: true };
  } catch (e) {
    console.error(e);
    return failReport("Could not save. Please try again.");
  }
}

type OrderTx = {
  order: {
    findMany: typeof prisma.order.findMany;
  };
};

async function countTransferredSlotsForShopCapWindowWithTx(
  tx: OrderTx,
  now: Date,
): Promise<number> {
  const { start, end } = shopCapWindowBoundsUtc(now);
  const startIso = start.toISOString();
  const endIso = end.toISOString();
  return tx.order.findMany({
    where: {
      status: { in: ["pending", "confirmed"] },
      stackId: { not: DRINKS_ONLY_STACK_ID },
      transferReportedAt: {
        not: null,
        gte: startIso,
        lt: endIso,
      },
    },
    select: { summaryLines: true, stackId: true },
  }).then((orders) =>
    orders.reduce((sum, order) => sum + countPancakesInOrder(order), 0),
  );
}

export async function createCheckoutOrder(
  raw: unknown,
): Promise<CreateOrderResult> {
  const parsed = checkoutOrderPayloadSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Invalid order";
    return fail(first);
  }
  const d: CheckoutOrderPayload = parsed.data;
  const emailTrim = d.email?.trim();
  const drinksOnly = isDrinksOnlySummary(d.summaryLines);

  try {
    // Drinks-only orders bypass the kitchen-day gate and the daily cap.
    if (!drinksOnly) {
      const intakeSettings = await loadShopIntakeSettings();
      const intakeGate = evaluateCheckoutIntake(new Date(), intakeSettings);
      if (!intakeGate.ok) return fail(intakeGate.message);

      const cap = await getDailyOrderCap();
      if (cap != null) {
        const used = await countTransferredSlotsForShopCapWindow(new Date());
        const incomingPancakes = countPancakesInSummaryLines(d.summaryLines);
        if (wouldExceedPancakeCap(cap, used, incomingPancakes)) {
          return fail(
            `We’ve reached pancake capacity for this shop period (${formatShopCapWindowSummary(new Date())}). Try again after the next window or reach out if you need help.`,
          );
        }
      }
    }

    await prisma.order.create({
      data: {
        reference: d.reference,
        status: "pending",
        placedAt: new Date(d.placedAt),
        placedByName: d.placedByName,
        buyerPhone: d.buyerPhone,
        expectedBankSenderName: d.expectedBankSenderName,
        email: emailTrim ? emailTrim : null,
        deliveryAddress: d.deliveryAddress,
        stackId: drinksOnly ? DRINKS_ONLY_STACK_ID : d.stackId,
        stackName: d.stackName,
        customization: d.customization,
        note: d.note,
        total: d.total,
        etaLabel: d.etaLabel ?? null,
        summaryLines: d.summaryLines as unknown as Prisma.InputJsonValue,
      },
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return fail("That order reference was already used. Please try again.");
    }
    console.error(e);
    return fail("Could not save your order. Please try again.");
  }
  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/order/checkout");
  return { ok: true };
}
