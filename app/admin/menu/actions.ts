"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { cuidSchema } from "@/lib/validations/ids";
import { menuItemFormSchema } from "@/lib/validations/menu";

const path = "/admin/menu";

export type ActionState = { ok: true } | { ok: false; message: string };

function fail(message: string): ActionState {
  return { ok: false, message };
}

function isNotFound(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  );
}

export async function createTopping(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const parsed = menuItemFormSchema.safeParse({
    name: formData.get("name"),
    priceInput: formData.get("price")?.toString(),
  });
  if (!parsed.success) {
    const first =
      parsed.error.issues[0]?.message ?? "Please check the form";
    return fail(first);
  }
  try {
    await prisma.topping.create({
      data: {
        name: parsed.data.name,
        price: parsed.data.price,
        available: true,
      },
    });
  } catch (e) {
    console.error(e);
    return fail("Could not create topping.");
  }
  revalidatePath(path);
  return { ok: true };
}

export async function updateTopping(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const idRaw = formData.get("id")?.toString();
  const idParsed = cuidSchema.safeParse(idRaw);
  if (!idParsed.success) return fail("Invalid item.");

  const parsed = menuItemFormSchema.safeParse({
    name: formData.get("name"),
    priceInput: formData.get("price")?.toString(),
  });
  if (!parsed.success) {
    const first =
      parsed.error.issues[0]?.message ?? "Please check the form";
    return fail(first);
  }
  try {
    await prisma.topping.update({
      where: { id: idParsed.data },
      data: { name: parsed.data.name, price: parsed.data.price },
    });
  } catch (e) {
    if (isNotFound(e)) return fail("Item not found.");
    console.error(e);
    return fail("Could not update topping.");
  }
  revalidatePath(path);
  return { ok: true };
}

export async function setToppingAvailable(id: string, available: unknown) {
  const idParsed = cuidSchema.safeParse(id);
  if (!idParsed.success) return;

  const on = available === true;

  try {
    await prisma.topping.update({
      where: { id: idParsed.data },
      data: { available: on },
    });
  } catch (e) {
    if (!isNotFound(e)) console.error(e);
  }
  revalidatePath(path);
}

export async function createExtra(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const parsed = menuItemFormSchema.safeParse({
    name: formData.get("name"),
    priceInput: formData.get("price")?.toString(),
  });
  if (!parsed.success) {
    const first =
      parsed.error.issues[0]?.message ?? "Please check the form";
    return fail(first);
  }
  try {
    await prisma.extra.create({
      data: {
        name: parsed.data.name,
        price: parsed.data.price,
        available: true,
      },
    });
  } catch (e) {
    console.error(e);
    return fail("Could not create extra.");
  }
  revalidatePath(path);
  return { ok: true };
}

export async function updateExtra(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const idRaw = formData.get("id")?.toString();
  const idParsed = cuidSchema.safeParse(idRaw);
  if (!idParsed.success) return fail("Invalid item.");

  const parsed = menuItemFormSchema.safeParse({
    name: formData.get("name"),
    priceInput: formData.get("price")?.toString(),
  });
  if (!parsed.success) {
    const first =
      parsed.error.issues[0]?.message ?? "Please check the form";
    return fail(first);
  }
  try {
    await prisma.extra.update({
      where: { id: idParsed.data },
      data: { name: parsed.data.name, price: parsed.data.price },
    });
  } catch (e) {
    if (isNotFound(e)) return fail("Item not found.");
    console.error(e);
    return fail("Could not update extra.");
  }
  revalidatePath(path);
  return { ok: true };
}

export async function setExtraAvailable(id: string, available: unknown) {
  const idParsed = cuidSchema.safeParse(id);
  if (!idParsed.success) return;

  const on = available === true;

  try {
    await prisma.extra.update({
      where: { id: idParsed.data },
      data: { available: on },
    });
  } catch (e) {
    if (!isNotFound(e)) console.error(e);
  }
  revalidatePath(path);
}
