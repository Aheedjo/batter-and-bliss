import { z } from "zod";

const MAX_PRICE = 1_000_000;

export const menuItemFormSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(120),
    priceInput: z.string().optional(),
  })
  .refine(
    (data) => {
      const p = data.priceInput?.trim() ?? "";
      if (p === "") return true;
      const n = Number.parseFloat(p);
      return (
        !Number.isNaN(n) && n >= 0 && n <= MAX_PRICE && Number.isFinite(n)
      );
    },
    {
      path: ["priceInput"],
      message: `Enter a valid price from 0 to ${MAX_PRICE.toLocaleString("en-US")}, or leave blank`,
    },
  )
  .transform((data) => ({
    name: data.name,
    price:
      data.priceInput === undefined || data.priceInput.trim() === ""
        ? null
        : Number.parseFloat(data.priceInput.trim()),
  }));

export type MenuItemFormValues = z.infer<typeof menuItemFormSchema>;
