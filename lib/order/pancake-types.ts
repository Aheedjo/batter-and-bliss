import type { StackId } from "@/lib/order/stacks";

/** One pancake order: its own base + add-ons (or Random Bliss for that stack). */
export type PancakeLine = {
  id: string;
  stackId: StackId;
  addOnIds: string[];
  randomBliss: boolean;
};
