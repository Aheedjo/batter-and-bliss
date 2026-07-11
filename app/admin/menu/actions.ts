"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { revalidateMenuPages } from "@/lib/admin/revalidate-menu";
import { prisma } from "@/lib/db";
import { parseOptionalImageUrl } from "@/lib/validations/image-url";
import { cuidSchema } from "@/lib/validations/ids";
import { menuItemFormSchema } from "@/lib/validations/menu";
import { isPlatterAddOnCategory } from "@/lib/order/menu-categories";

const path = "/admin/menu";

function parseImageUrl(formData: FormData) {
  return parseOptionalImageUrl(formData.get("imageUrl"));
}

function revalidateMenu() {
  revalidateMenuPages();
  revalidatePath(path);
}

const toppingCategorySchema = z.enum([
  "glazing",
  "platter_drizzle",
  "platter_glazing",
  "topping",
  "platter_topping",
  "syrup",
  "drink",
]);
const stackKindSchema = z.enum(["pancake", "platter"]);

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

function parseToppingCategory(formData: FormData) {
  const raw = formData.get("category")?.toString() ?? "";
  const p = toppingCategorySchema.safeParse(raw);
  return p.success ? p.data : "topping";
}

function parseStackKind(formData: FormData) {
  const raw = formData.get("kind")?.toString() ?? "";
  const p = stackKindSchema.safeParse(raw);
  return p.success ? p.data : "pancake";
}

async function resolvePlatterStackId(
  formData: FormData,
  category: string,
): Promise<{ stackId: string | null } | ActionState> {
  if (!isPlatterAddOnCategory(category)) {
    return { stackId: null };
  }

  const raw = formData.get("stackId")?.toString()?.trim() ?? "";
  const parsed = cuidSchema.safeParse(raw);
  if (!parsed.success) {
    return fail("Pick which platter this add-on is for.");
  }

  const stack = await prisma.stack.findUnique({
    where: { id: parsed.data },
    select: { kind: true },
  });
  if (!stack || stack.kind !== "platter") {
    return fail("That platter base was not found.");
  }

  return { stackId: parsed.data };
}

export async function createTopping(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const parsed = menuItemFormSchema.safeParse({
    name: formData.get("name"),
    priceInput: formData.get("price")?.toString(),
    description: formData.get("description")?.toString(),
  });
  if (!parsed.success) {
    const first =
      parsed.error.issues[0]?.message ?? "Please check the form";
    return fail(first);
  }
  const category = parseToppingCategory(formData);
  const imageUrl = parseImageUrl(formData);
  const platterStack = await resolvePlatterStackId(formData, category);
  if ("ok" in platterStack && platterStack.ok === false) return platterStack;
  const stackId = "stackId" in platterStack ? platterStack.stackId : null;
  const data: Prisma.ToppingUncheckedCreateInput = {
    name: parsed.data.name,
    price: parsed.data.price,
    category,
    description: parsed.data.description,
    imageUrl,
    available: true,
    stackId,
  };
  try {
    await prisma.topping.create({ data });
  } catch (e) {
    console.error(e);
    return fail("Could not create topping.");
  }
  revalidateMenu();
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
    description: formData.get("description")?.toString(),
  });
  if (!parsed.success) {
    const first =
      parsed.error.issues[0]?.message ?? "Please check the form";
    return fail(first);
  }
  const category = parseToppingCategory(formData);
  const imageUrl = parseImageUrl(formData);
  const platterStack = await resolvePlatterStackId(formData, category);
  if ("ok" in platterStack && platterStack.ok === false) return platterStack;
  const stackId = "stackId" in platterStack ? platterStack.stackId : null;
  const data: Prisma.ToppingUncheckedUpdateInput = {
    name: parsed.data.name,
    price: parsed.data.price,
    category,
    description: parsed.data.description,
    imageUrl,
    stackId,
  };
  try {
    await prisma.topping.update({
      where: { id: idParsed.data },
      data,
    });
  } catch (e) {
    if (isNotFound(e)) return fail("Item not found.");
    console.error(e);
    return fail("Could not update topping.");
  }
  revalidateMenu();
  return { ok: true };
}

export async function deleteTopping(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const idParsed = cuidSchema.safeParse(formData.get("id")?.toString());
  if (!idParsed.success) return fail("Invalid item.");
  try {
    await prisma.topping.delete({ where: { id: idParsed.data } });
  } catch (e) {
    if (isNotFound(e)) return fail("Item not found.");
    console.error(e);
    return fail("Could not delete item.");
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

export async function createStack(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const parsed = menuItemFormSchema.safeParse({
    name: formData.get("name"),
    priceInput: formData.get("price")?.toString(),
    description: formData.get("description")?.toString(),
  });
  if (!parsed.success) {
    const first =
      parsed.error.issues[0]?.message ?? "Please check the form";
    return fail(first);
  }
  const kind = parseStackKind(formData);
  const imageUrl = parseImageUrl(formData);
  try {
    await prisma.stack.create({
      data: {
        name: parsed.data.name,
        kind,
        price: parsed.data.price,
        description: parsed.data.description,
        imageUrl,
        available: true,
      },
    });
  } catch (e) {
    console.error(e);
    return fail("Could not create stack.");
  }
  revalidateMenu();
  return { ok: true };
}

export async function updateStack(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const idRaw = formData.get("id")?.toString();
  const idParsed = cuidSchema.safeParse(idRaw);
  if (!idParsed.success) return fail("Invalid item.");

  const parsed = menuItemFormSchema.safeParse({
    name: formData.get("name"),
    priceInput: formData.get("price")?.toString(),
    description: formData.get("description")?.toString(),
  });
  if (!parsed.success) {
    const first =
      parsed.error.issues[0]?.message ?? "Please check the form";
    return fail(first);
  }
  const kind = parseStackKind(formData);
  const imageUrl = parseImageUrl(formData);
  try {
    await prisma.stack.update({
      where: { id: idParsed.data },
      data: {
        name: parsed.data.name,
        kind,
        price: parsed.data.price,
        description: parsed.data.description,
        imageUrl,
      },
    });
  } catch (e) {
    if (isNotFound(e)) return fail("Item not found.");
    console.error(e);
    return fail("Could not update stack.");
  }
  revalidateMenu();
  return { ok: true };
}

export async function deleteStack(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const idParsed = cuidSchema.safeParse(formData.get("id")?.toString());
  if (!idParsed.success) return fail("Invalid item.");
  try {
    await prisma.stack.delete({ where: { id: idParsed.data } });
  } catch (e) {
    if (isNotFound(e)) return fail("Item not found.");
    console.error(e);
    return fail("Could not delete item.");
  }
  revalidatePath(path);
  return { ok: true };
}

export async function setStackAvailable(id: string, available: unknown) {
  const idParsed = cuidSchema.safeParse(id);
  if (!idParsed.success) return;

  const on = available === true;

  try {
    await prisma.stack.update({
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
    description: formData.get("description")?.toString(),
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
        description: parsed.data.description,
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
    description: formData.get("description")?.toString(),
  });
  if (!parsed.success) {
    const first =
      parsed.error.issues[0]?.message ?? "Please check the form";
    return fail(first);
  }
  try {
    await prisma.extra.update({
      where: { id: idParsed.data },
      data: {
        name: parsed.data.name,
        price: parsed.data.price,
        description: parsed.data.description,
      },
    });
  } catch (e) {
    if (isNotFound(e)) return fail("Item not found.");
    console.error(e);
    return fail("Could not update extra.");
  }
  revalidatePath(path);
  return { ok: true };
}

export async function deleteExtra(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const idParsed = cuidSchema.safeParse(formData.get("id")?.toString());
  if (!idParsed.success) return fail("Invalid item.");
  try {
    await prisma.extra.delete({ where: { id: idParsed.data } });
  } catch (e) {
    if (isNotFound(e)) return fail("Item not found.");
    console.error(e);
    return fail("Could not delete item.");
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
