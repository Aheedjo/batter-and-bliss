import { revalidatePath } from "next/cache";

const PATHS = [
  "/admin/menu",
  "/order/stack",
  "/order/customize",
  "/order/platter",
  "/order/drinks",
  "/order/builds",
  "/order/checkout",
] as const;

export function revalidateMenuPages() {
  for (const path of PATHS) {
    revalidatePath(path);
  }
}
