import Image from "next/image";
import Link from "next/link";
import { SocialFollowLinks } from "@/components/brand/social-follow-links";

const PLATE_IMG =
  "https://images.unsplash.com/photo-1627308595229-7830a1e98658?w=640&q=80&auto=format&fit=crop";

export default function ClosedPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-8 py-16 text-center sm:px-10">
      <div className="relative w-full max-w-[280px]">
        <div className="relative aspect-square w-full overflow-hidden rounded-[1.75rem] shadow-lift ring-1 ring-order-brown/10">
          <Image
            src={PLATE_IMG}
            alt="Empty plate with crumbs"
            fill
            className="object-cover"
            sizes="280px"
          />
        </div>
        <span
          className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-order-card text-lg shadow-card ring-1 ring-order-line"
          aria-hidden
        >
          ☹
        </span>
      </div>

      <p className="mt-10 font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-order-muted">
        Kitchen
      </p>
      <h1 className="mt-2 font-serif text-[1.75rem] font-medium italic leading-tight tracking-[-0.02em] text-order-brownInk sm:text-[2rem]">
        We&apos;re closed for today 💔
      </h1>
      <p className="mt-4 max-w-sm font-sans text-[15px] leading-relaxed text-order-taupe">
        All our sweet slots are filled. Orders open again on Friday.
      </p>

      <p className="mt-8 font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-order-muted">
        Follow for updates
      </p>
      <SocialFollowLinks layout="pills" />

      <Link
        href="/"
        className="mt-6 font-sans text-sm font-medium text-order-taupe underline-offset-4 hover:text-order-brownInk hover:underline"
      >
        Back to home
      </Link>
    </div>
  );
}
