import { mkdir, writeFile } from "fs/promises";
import path from "path";
import {
  menuImagePathname,
  validateMenuImageFile,
} from "@/lib/admin/menu-image-shared";

export async function uploadMenuImageToLocalDisk(
  file: File,
): Promise<{ url: string } | { error: string }> {
  const validation = validateMenuImageFile(file);
  if (validation) return { error: validation };

  const name = menuImagePathname(file).replace(/^menu\//, "");
  const dir = path.join(process.cwd(), "public", "uploads", "menu");
  await mkdir(dir, { recursive: true });
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, name), buf);
  return { url: `/uploads/menu/${name}` };
}
