"use client";

import Image from "next/image";
import { useTransition } from "react";
import { isUploadedImage } from "@/lib/media/image-src";
import { formatPrice } from "@/lib/order/money";

function displayPrice(price: number | null) {
  if (price === null) return "—";
  return formatPrice(price);
}

type Props =
  | {
      variant: "stack";
      id: string;
      name: string;
      subtitle: string;
      price: number;
      imageUrl: string;
      imageAlt: string;
    }
  | {
      variant: "db";
      id: string;
      name: string;
      price: number | null;
      available: boolean;
      imageUrl?: string | null;
      imageAlt?: string;
      onEdit: () => void;
      onToggleAvailable: (id: string, available: boolean) => Promise<void>;
    };

export function MenuProductCard(props: Props) {
  const [pending, startTransition] = useTransition();

  if (props.variant === "stack") {
    return (
      <div className="flex items-center gap-3 rounded-[1.25rem] border border-order-line/80 bg-order-card px-4 py-3 shadow-soft ring-1 ring-white/80">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-order-beige ring-1 ring-order-line/50">
          <Image
            src={props.imageUrl}
            alt={props.imageAlt}
            fill
            className="object-cover"
            sizes="56px"
            unoptimized={isUploadedImage(props.imageUrl)}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-sans text-sm font-semibold text-order-brownInk">
            {props.name}
          </p>
          <p className="mt-0.5 truncate font-sans text-xs text-order-muted">
            {props.subtitle}
          </p>
          <p className="mt-1 font-serif text-sm font-semibold tabular-nums text-order-brownInk">
            {displayPrice(props.price)}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-order-beige/80 px-2.5 py-1 font-sans text-[10px] font-semibold uppercase tracking-wide text-order-taupe ring-1 ring-order-line/40">
          Catalog
        </span>
      </div>
    );
  }

  const { id, name, price, available, imageUrl, imageAlt, onEdit, onToggleAvailable } =
    props;

  return (
    <div
      className={`flex items-center gap-3 rounded-[1.25rem] border border-order-line/80 bg-order-card px-4 py-3 shadow-soft ring-1 ring-white/80 transition ${
        !available ? "opacity-60" : ""
      }`}
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-order-beige ring-1 ring-order-line/50">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt ?? name}
            fill
            className="object-cover"
            sizes="56px"
            unoptimized={isUploadedImage(imageUrl)}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-serif text-lg font-semibold text-order-taupe">
            {name.slice(0, 1).toUpperCase()}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-sans text-sm font-semibold text-order-brownInk">{name}</p>
        <p className="mt-0.5 font-serif text-sm font-semibold tabular-nums text-order-brownInk">
          {displayPrice(price)}
        </p>
        <button
          type="button"
          onClick={onEdit}
          className="mt-1 font-sans text-xs font-semibold text-order-brownBtn hover:underline"
        >
          Edit
        </button>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <button
          type="button"
          role="switch"
          aria-checked={available}
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await onToggleAvailable(id, !available);
            })
          }
          className={`relative h-8 w-14 shrink-0 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-order-brownBtn/40 ${
            available ? "bg-order-brownBtn" : "bg-order-line"
          } ${pending ? "opacity-60" : ""}`}
        >
          <span
            className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
              available ? "translate-x-6" : "translate-x-0"
            }`}
          />
          <span className="sr-only">
            {available ? "Mark unavailable" : "Mark available"}
          </span>
        </button>
      </div>
    </div>
  );
}
