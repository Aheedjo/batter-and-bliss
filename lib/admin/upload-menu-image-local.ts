import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { validateMenuImageFile } from "@/lib/admin/menu-image-shared";
import {
  processMenuImage,
  processedMenuImageName,
} from "@/lib/admin/process-menu-image";

export async function uploadMenuImageToLocalDisk(
  file: File,
): Promise<{ url: string } | { error: string }> {
  const validation = validateMenuImageFile(file);
  if (validation) return { error: validation };

  const processed = await processMenuImage(file);
  const name = processedMenuImageName(processed.ext);
  const dir = path.join(process.cwd(), "public", "uploads", "menu");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), processed.buffer);
  return { url: `/uploads/menu/${name}` };
}
