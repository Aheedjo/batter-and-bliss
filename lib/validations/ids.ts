import { z } from "zod";

/** Matches Prisma `cuid()` ids (25 chars, leading `c`). */
export const cuidSchema = z
  .string()
  .regex(/^c[a-z0-9]{24}$/i, "Invalid id");
