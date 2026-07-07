import { cache } from "react";
import { prisma } from "@/lib/db";

/** Homepage hero image URL from ShopSetting, or null to use the built-in default. */
export const getHeroImageUrl = cache(async function getHeroImageUrl(): Promise<
  string | null
> {
  try {
    const row = await prisma.shopSetting.findUnique({
      where: { id: "default" },
      select: { heroImageUrl: true },
    });
    return row?.heroImageUrl ?? null;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown database error";
    console.error(
      "[site-settings] Database unavailable; using default hero image.",
      message,
    );
    return null;
  }
});
