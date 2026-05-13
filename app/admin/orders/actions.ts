"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { cuidSchema } from "@/lib/validations/ids";

const adminPath = "/admin/orders";

const statusSchema = z.enum(["confirmed", "rejected"]);

export type AdminOrderActionState =
  | { ok: true }
  | { ok: false; message: string };

function fail(message: string): AdminOrderActionState {
  return { ok: false, message };
}

function isNotFound(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  );
}

export async function setOrderStatus(
  _prev: AdminOrderActionState | undefined,
  formData: FormData,
): Promise<AdminOrderActionState> {
  const idParsed = cuidSchema.safeParse(formData.get("id")?.toString());
  if (!idParsed.success) return fail("Invalid order.");

  const statusParsed = statusSchema.safeParse(formData.get("status")?.toString());
  if (!statusParsed.success) return fail("Invalid status.");

  const rejectionReasonRaw = formData.get("rejectionReason")?.toString() ?? "";
  const rejectionReason =
    rejectionReasonRaw.trim().slice(0, 500) || null;

  if (statusParsed.data === "rejected" && !rejectionReason) {
    return fail("Add a short reason so the customer understands.");
  }

  try {
    await prisma.order.update({
      where: { id: idParsed.data },
      data: {
        status: statusParsed.data,
        rejectionReason:
          statusParsed.data === "rejected" ? rejectionReason : null,
      },
    });
  } catch (e) {
    if (isNotFound(e)) return fail("Order not found.");
    console.error(e);
    return fail("Could not update order.");
  }
  revalidatePath(adminPath);
  revalidatePath(`/admin/orders/${idParsed.data}`);
  revalidatePath("/admin");
  return { ok: true };
}
