import { cache } from "react";
import { prisma } from "@/lib/db";
import type { CartSummaryLine } from "@/lib/order/pricing";

export const DEFAULT_BOX_NOTE_FEE = 500;
/** Shown on checkout summary when the customer adds a box-card message. */
export const BOX_NOTE_FEE_LABEL = "Box card message";

const SETTINGS_ID = "default";

export const getBoxNoteFee = cache(async function getBoxNoteFee(): Promise<number> {
  try {
    const row = await prisma.shopSetting.findUnique({
      where: { id: SETTINGS_ID },
      select: { boxNoteFee: true },
    });
    const fee = row?.boxNoteFee ?? DEFAULT_BOX_NOTE_FEE;
    return Number.isFinite(fee) && fee > 0 ? Math.round(fee) : 0;
  } catch {
    return DEFAULT_BOX_NOTE_FEE;
  }
});

export function boxNoteCharge(note: string, fee: number): number {
  if (fee <= 0 || !note.trim()) return 0;
  return fee;
}

export function withBoxNoteFeeLine(
  summaryLines: CartSummaryLine[],
  total: number,
  note: string,
  fee: number,
): { summaryLines: CartSummaryLine[]; total: number } {
  const charge = boxNoteCharge(note, fee);
  if (charge <= 0) {
    return { summaryLines, total };
  }
  const withoutPriorFee = summaryLines.filter((l) => l.kind !== "fee");
  return {
    summaryLines: [
      ...withoutPriorFee,
      { kind: "fee", label: BOX_NOTE_FEE_LABEL, lineTotal: charge },
    ],
    total: total + charge,
  };
}

export function sumSummaryLineTotals(lines: readonly CartSummaryLine[]): number {
  return lines.reduce((sum, line) => sum + line.lineTotal, 0);
}
