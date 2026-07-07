/**
 * User-uploaded images (Vercel Blob or local /uploads) should skip the Next.js
 * image optimizer: large uploads can make `/_next/image` time out (500). They
 * come from a CDN already, so we serve them directly with `unoptimized`.
 */
export function isUploadedImage(src: string | null | undefined) {
  if (!src) return false;
  return (
    src.startsWith("/uploads/") ||
    src.includes(".blob.vercel-storage.com")
  );
}
