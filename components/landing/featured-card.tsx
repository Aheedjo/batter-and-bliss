import Image from "next/image";
import Link from "next/link";
import { isUploadedImage } from "@/lib/media/image-src";
import type { StackId } from "@/lib/order/stacks";

type Props = {
  title: string;
  description: string;
  price: string;
  imageSrc: string;
  imageAlt: string;
  orderStackId: StackId;
};

export function FeaturedCard({
  title,
  description,
  price,
  imageSrc,
  imageAlt,
  orderStackId,
}: Props) {
  return (
    <Link
      href={`/order/stack?stack=${orderStackId}`}
      className="group block rounded-[1.75rem] bg-brand-card p-3.5 shadow-card ring-1 ring-brand-rose/25 outline-none transition duration-300 hover:ring-brand-roseDeep/35 focus-visible:ring-2 focus-visible:ring-brand-chocolate/35 sm:p-4"
    >
      <article className="flex gap-4 sm:gap-4">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl ring-1 ring-black/[0.04] sm:h-[5.5rem] sm:w-[5.5rem]">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            sizes="96px"
            unoptimized={isUploadedImage(imageSrc)}
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5 pr-0.5">
          <div>
            <h3 className="font-serif text-[1.02rem] font-semibold leading-snug tracking-[-0.02em] text-brand-chocolate">
              {title}
            </h3>
            <p className="mt-1.5 line-clamp-2 font-sans text-[12px] leading-relaxed text-brand-taupe">
              {description}
            </p>
          </div>
          <p className="mt-3 font-sans text-[13px] font-bold tabular-nums tracking-wide text-brand-chocolate">
            {price}
          </p>
        </div>
      </article>
    </Link>
  );
}
