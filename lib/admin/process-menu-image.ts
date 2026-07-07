import { randomBytes } from "crypto";
import sharp from "sharp";
import {
  menuImageContentType,
  menuImageExtension,
} from "@/lib/admin/menu-image-shared";

/** Longest edge we keep. The site is mobile-first (max ~512px), so this is plenty even for retina + hero. */
const MAX_DIMENSION = 1600;
const WEBP_QUALITY = 80;

export type ProcessedImage = {
  buffer: Buffer;
  contentType: string;
  ext: string;
};

/**
 * Downscale + compress an uploaded image to a small WebP so it loads fast from
 * the CDN. Falls back to the original bytes if processing fails.
 */
export async function processMenuImage(file: File): Promise<ProcessedImage> {
  const input = Buffer.from(await file.arrayBuffer());
  try {
    const output = await sharp(input)
      .rotate()
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
    return { buffer: output, contentType: "image/webp", ext: "webp" };
  } catch (error) {
    console.error(
      "[menu-image] image processing failed; storing original",
      error,
    );
    return {
      buffer: input,
      contentType: menuImageContentType(file),
      ext: menuImageExtension(file),
    };
  }
}

/** Unique filename (no folder) for a processed image, e.g. "menu-1699-ab12cd34.webp". */
export function processedMenuImageName(ext: string) {
  return `menu-${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;
}
