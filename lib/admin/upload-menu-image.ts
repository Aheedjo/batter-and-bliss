import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function extensionForType(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

export async function uploadMenuImageFile(
  file: File,
): Promise<{ url: string } | { error: string }> {
  if (!ALLOWED_TYPES.has(file.type)) {
    return { error: "Use JPG, PNG, or WebP." };
  }
  if (file.size > MAX_BYTES) {
    return { error: "Image must be 5 MB or smaller." };
  }

  const ext = extensionForType(file.type);
  const name = `menu-${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (token) {
    const blob = await put(`menu/${name}`, file, {
      access: "public",
      token,
      contentType: file.type,
    });
    return { url: blob.url };
  }

  if (process.env.NODE_ENV === "development") {
    const dir = path.join(process.cwd(), "public", "uploads", "menu");
    await mkdir(dir, { recursive: true });
    const buf = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, name), buf);
    return { url: `/uploads/menu/${name}` };
  }

  return {
    error:
      "Photo upload is not configured. Add BLOB_READ_WRITE_TOKEN (Vercel Blob) in production.",
  };
}
