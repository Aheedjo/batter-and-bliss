import { z } from "zod";

const summaryLineSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("pancake"),
    title: z.string(),
    details: z.string().nullable(),
    lineTotal: z.number(),
  }),
  z.object({
    kind: z.literal("drink"),
    name: z.string(),
    qty: z.number().int().positive(),
    lineTotal: z.number(),
  }),
  z.object({
    kind: z.literal("fee"),
    label: z.string().max(120),
    lineTotal: z.number().nonnegative(),
  }),
]);

export const checkoutOrderPayloadSchema = z.object({
  reference: z.string().regex(/^BB-[A-Z0-9]{8,24}$/).max(32),
  stackId: z.string().min(1).max(64),
  stackName: z.string().min(1).max(200),
  customization: z.string().max(4000),
  note: z.string().max(500),
  total: z.number().nonnegative().max(1_000_000_000),
  placedAt: z.string().datetime({ offset: true }),
  etaLabel: z.string().max(120).optional(),
  placedByName: z.string().min(2).max(120),
  buyerPhone: z.string().min(8).max(40),
  expectedBankSenderName: z.string().min(2).max(120),
  email: z.union([z.string().email().max(120), z.literal("")]).optional(),
  deliveryAddress: z.string().min(12).max(500),
  summaryLines: z.array(summaryLineSchema),
});

export type CheckoutOrderPayload = z.infer<typeof checkoutOrderPayloadSchema>;
