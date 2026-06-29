"use client";

import { ImagePlus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";

const ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_BYTES = 5 * 1024 * 1024;

type Props = {
  initialUrl?: string | null;
  itemName?: string;
};

export function MenuImageField({ initialUrl, itemName }: Props) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState(initialUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setImageUrl(initialUrl ?? "");
    setError(null);
  }, [initialUrl]);

  async function onFileChange(file: File | undefined) {
    if (!file) return;
    setError(null);

    if (!ACCEPT.split(",").includes(file.type)) {
      setError("Use JPG, PNG, or WebP.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image must be 5 MB or smaller.");
      return;
    }

    setUploading(true);
    try {
      const body = new FormData();
      body.set("file", file);
      const res = await fetch("/api/admin/menu-image", {
        method: "POST",
        body,
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Upload failed. Try again.");
        return;
      }
      setImageUrl(data.url);
    } catch {
      setError("Upload failed. Check your connection and try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const previewAlt = itemName?.trim() ? `${itemName} photo` : "Menu item photo";

  return (
    <div className="flex flex-col gap-2">
      <span className="font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-order-taupe">
        Image
      </span>
      <input type="hidden" name="imageUrl" value={imageUrl} />

      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-order-line/90 bg-order-bg/70">
        {imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt={previewAlt}
              fill
              className="object-cover"
              sizes="(max-width: 512px) 100vw, 512px"
            />
            <div className="absolute inset-x-0 bottom-0 flex gap-2 bg-gradient-to-t from-black/55 to-transparent p-3 pt-10">
              <button
                type="button"
                disabled={uploading}
                onClick={() => inputRef.current?.click()}
                className="rounded-full bg-white/95 px-3 py-1.5 font-sans text-xs font-semibold text-order-brownInk shadow-sm transition hover:bg-white disabled:opacity-60"
              >
                {uploading ? "Uploading…" : "Replace photo"}
              </button>
              <button
                type="button"
                disabled={uploading}
                onClick={() => {
                  setImageUrl("");
                  setError(null);
                }}
                className="inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 font-sans text-xs font-semibold text-order-brownInk shadow-sm transition hover:bg-white disabled:opacity-60"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden />
                Remove
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="flex h-full w-full flex-col items-center justify-center gap-2 text-order-muted transition hover:bg-order-cream/40 disabled:cursor-wait"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-sm ring-1 ring-order-line/50">
              <ImagePlus className="h-6 w-6" strokeWidth={1.5} aria-hidden />
            </span>
            <span className="rounded-full bg-white/90 px-3 py-1 font-sans text-xs font-medium text-order-taupe ring-1 ring-order-line/40">
              {uploading ? "Uploading…" : "Upload photo"}
            </span>
            <span className="font-sans text-[11px] text-order-muted/90">
              JPG, PNG, or WebP · up to 5 MB
            </span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={(e) => void onFileChange(e.target.files?.[0])}
      />

      {error ? (
        <p className="font-sans text-xs text-order-red-text" role="alert">
          {error}
        </p>
      ) : (
        <p className="font-sans text-[11px] leading-snug text-order-muted">
          Save to see it on the order site. Swap photos anytime to compare looks.
        </p>
      )}
    </div>
  );
}
