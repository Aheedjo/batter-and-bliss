"use client";

import Image from "next/image";
import { isUploadedImage } from "@/lib/media/image-src";
import { formatPrice } from "@/lib/order/money";
import { toppingImageUrl } from "@/lib/order/topping-image";

type Props = {
  name: string;
  price: number | null;
  imageSrc?: string;
  selected: boolean;
  onToggle: () => void;
  disabled?: boolean;
  className?: string;
};

export function ToppingGridCard({
  name,
  price,
  imageSrc,
  selected,
  onToggle,
  disabled = false,
  className = "",
}: Props) {
  const src = imageSrc ?? toppingImageUrl(name);
  const priceLabel =
    price != null ? `+${formatPrice(price)}` : "Included";

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={`relative flex w-full flex-col items-center rounded-[1.25rem] p-2.5 pb-2 text-center shadow-card ring-1 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-order-brown/30 ${selected ? "bg-order-beigeActive ring-order-brown/[0.14] shadow-lift" : "bg-order-card ring-black/[0.06]"} ${disabled && !selected ? "opacity-40" : ""} ${className}`}
    >
      {selected ? (
        <span className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-order-brownBtn text-white shadow">
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </span>
      ) : null}
      <div className="relative h-[3.5rem] w-[3.5rem] shrink-0 overflow-hidden rounded-full ring-2 ring-white shadow-sm">
        <Image
          src={src}
          alt={name}
          fill
          className="object-cover"
          sizes="56px"
          unoptimized={isUploadedImage(src)}
        />
      </div>
      <span className="mt-2 line-clamp-2 px-1 text-center font-serif text-[13px] font-bold leading-snug text-order-brown">
        {name}
      </span>
      <span className="mt-0.5 font-sans text-[11px] text-order-taupe">
        {priceLabel}
      </span>
    </button>
  );
}
