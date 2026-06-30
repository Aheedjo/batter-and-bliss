const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export const MENU_IMAGE_MAX_BYTES = 4 * 1024 * 1024;

export function menuImageExtension(file: File) {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (
    fromName === "png" ||
    fromName === "webp" ||
    fromName === "jpg" ||
    fromName === "jpeg"
  ) {
    return fromName === "jpeg" ? "jpg" : fromName;
  }
  return "jpg";
}

export function menuImagePathname(file: File) {
  const ext = menuImageExtension(file);
  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : String(Date.now());
  return `menu/menu-${Date.now()}-${suffix}.${ext}`;
}

export function menuImageContentType(file: File) {
  if (file.type === "image/png") return "image/png";
  if (file.type === "image/webp") return "image/webp";
  if (file.type === "image/jpeg" || file.type === "image/jpg") {
    return "image/jpeg";
  }
  const ext = menuImageExtension(file);
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
}

export function validateMenuImageFile(file: File): string | null {
  const type = file.type || "";
  if (type && !ALLOWED_TYPES.has(type)) {
    return "Use JPG, PNG, or WebP.";
  }
  if (!type) {
    const ext = menuImageExtension(file);
    if (ext !== "jpg" && ext !== "png" && ext !== "webp") {
      return "Use JPG, PNG, or WebP.";
    }
  }
  if (file.size > MENU_IMAGE_MAX_BYTES) {
    return "Image must be 4 MB or smaller.";
  }
  if (file.size === 0) {
    return "Choose an image file.";
  }
  return null;
}
