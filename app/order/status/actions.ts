"use server";

import { prisma } from "@/lib/db";
import { z } from "zod";

const refsSchema = z.array(z.string().regex(/^BB-[A-Z0-9]{8,24}$/)).max(24);

export type CustomerOrderStatusRow = {
  reference: string;
  status: "pending" | "confirmed" | "rejected";
  etaLabel: string | null;
  rejectionReason: string | null;
  transferReportedAt: string | null;
};

/**
 * Server source of truth for customer-tracked order states.
 * Called by `/order/status` to sync local persisted snapshots.
 */
export async function getCustomerOrderStatuses(
  refsRaw: unknown,
): Promise<CustomerOrderStatusRow[]> {
  const refsParsed = refsSchema.safeParse(refsRaw);
  if (!refsParsed.success || refsParsed.data.length === 0) return [];

  const refs = Array.from(new Set(refsParsed.data));
  const rows = await prisma.order.findMany({
    where: { reference: { in: refs } },
    select: {
      reference: true,
      status: true,
      etaLabel: true,
      rejectionReason: true,
      transferReportedAt: true,
    },
  });

  return rows.map((r) => ({
    reference: r.reference,
    status:
      r.status === "confirmed" || r.status === "rejected"
        ? r.status
        : "pending",
    etaLabel: r.etaLabel,
    rejectionReason: r.rejectionReason,
    transferReportedAt: r.transferReportedAt,
  }));
}
