import { put } from "@vercel/blob";
import {
  menuImageContentType,
  menuImagePathname,
  validateMenuImageFile,
} from "@/lib/admin/menu-image-shared";

export async function uploadMenuImageToBlob(
  file: File,
): Promise<{ url: string } | { error: string }> {
  const validation = validateMenuImageFile(file);
  if (validation) return { error: validation };

  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    return {
      error:
        "Photo upload is not configured. Add BLOB_READ_WRITE_TOKEN in Vercel env vars.",
    };
  }

  try {
    const blob = await put(menuImagePathname(file), file, {
      access: "public",
      token,
      contentType: menuImageContentType(file),
      addRandomSuffix: false,
    });
    return { url: blob.url };
  } catch (error) {
    console.error("[menu-image] blob put failed", error);
    const raw =
      error instanceof Error ? error.message : "Upload failed. Try again.";
    const message = raw.includes("private store")
      ? "Your Vercel Blob store is private. Create a new public Blob store (Storage → Blob → Public) and update BLOB_READ_WRITE_TOKEN."
      : raw;
    return { error: message };
  }
}
