"use client";

import Image from "next/image";
import type { StackId } from "@/lib/order/stacks";
import { formatPrice } from "@/lib/order/money";

type Stack = {
  id: StackId;
  name: string;
  subtitle?: string;
  price: number;
  image: string;
  alt: string;
};

type Props = {
  stack: Stack;
  selected: boolean;
  onSelect: () => void;
};

export function StackCard({ stack, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="relative w-full overflow-hidden rounded-[1.75rem] text-left shadow-card shadow-lift ring-1 ring-black/[0.06] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-order-brown/40"
    >
      <div className="relative aspect-[4/3] w-full">
        <Image
          src={stack.image}
          alt={stack.alt}
          fill
          className="object-cover"
          sizes="(max-width: 448px) 100vw, 448px"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent"
          aria-hidden
        />
        {selected ? (
          <span
            className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-order-brownBtn text-white shadow-md"
            aria-hidden
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </span>
        ) : null}
        <div className="absolute inset-x-0 bottom-0 space-y-1 p-4 pt-12">
          <div className="flex items-end justify-between gap-3">
            <span className="font-serif text-lg font-bold leading-tight text-white">
              {stack.name}
            </span>
            <span className="shrink-0 font-sans text-base font-medium tabular-nums text-white/95">
              {formatPrice(stack.price)}
            </span>
          </div>
          {stack.subtitle ? (
            <p className="pr-8 font-sans text-[11px] font-medium leading-snug text-white/80">
              {stack.subtitle}
            </p>
          ) : null}
        </div>
      </div>
    </button>
  );
}
