import Image from "next/image";
import Link from "next/link";
import { FeaturedCard } from "@/components/landing/featured-card";
import { BrandRibbonBand } from "@/components/landing/brand-ribbon-band";
import { OrderNudgeCta } from "@/components/landing/order-nudge-cta";
import { TestimonialMarquee } from "@/components/landing/testimonial-marquee";
import { MarketingHeading } from "@/components/brand/marketing-heading";
import { FloatingBrandDecor } from "@/components/brand/floating-brand-decor";
import { SiteHeader } from "@/components/brand/site-header";
import { SocialFollowLinks } from "@/components/brand/social-follow-links";
import { formatPrice } from "@/lib/order/money";
import type { StackId } from "@/lib/order/stacks";

const IMG = {
  hero: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=900&q=85&auto=format&fit=crop",
  morado:
    "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&q=80&auto=format&fit=crop",
  regular:
    "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80&auto=format&fit=crop",
} as const;

const featured: readonly {
  title: string;
  description: string;
  price: string;
  imageSrc: string;
  imageAlt: string;
  orderStackId: StackId;
}[] = [
  {
    title: "~Morado",
    description:
      "Signature Dubai Chocolate–inspired pancakes—headliner on our menu.",
    price: formatPrice(7000),
    imageSrc: IMG.morado,
    imageAlt: "Chocolate pancakes stack",
    orderStackId: "morado",
  },
  {
    title: "Regular Pancakes",
    description: "Classic fluffy stacks—build yours with glazing & toppings.",
    price: formatPrice(2500),
    imageSrc: IMG.regular,
    imageAlt: "Pancakes with berries",
    orderStackId: "regular",
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-brand-bg text-brand-chocolate [color-scheme:light]">
      <FloatingBrandDecor variant="marketing" />
      <SiteHeader variant="marketing" />

      <div className="relative z-10 mx-auto max-w-lg overflow-x-hidden px-5 pb-20 pt-6 sm:px-6 sm:pt-8">
        <section className="pt-2" aria-labelledby="hero-heading">
          <div className="relative overflow-hidden rounded-[2rem] shadow-lift ring-1 ring-brand-chocolate/[0.07]">
            <div className="absolute inset-0 bg-gradient-to-t from-brand-rose/25 via-brand-bgDeep/10 to-white/30" />
            <div className="relative aspect-[4/5] w-full">
              <Image
                src={IMG.hero}
                alt="Stack of pancakes with fresh berries and syrup"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 512px) 100vw, 512px"
              />
            </div>
          </div>

          <p className="mt-6 text-center font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-taupe">
            Batter &amp; Bliss · Culinary Nirvana
          </p>
          <h1
            id="hero-heading"
            className="mt-2 text-center font-serif text-[1.85rem] font-semibold leading-[1.12] tracking-[-0.03em] text-brand-chocolate sm:text-[2.15rem]"
          >
            Made with love, served with bliss.
          </h1>
          <p className="mx-auto mt-4 max-w-[24rem] text-center font-sans text-[15px] leading-[1.55] text-brand-taupe">
            Premium pancakes &amp; desserts—order the same way as our printed
            menu.
          </p>

          <Link
            href="/order"
            className="mt-10 flex w-full items-center justify-center rounded-full bg-brand-chocolate py-[1.05rem] font-sans text-[14px] font-semibold tracking-[0.04em] text-white shadow-brand-btn ring-1 ring-brand-chocolate/20 transition hover:brightness-110 active:scale-[0.99] sm:text-[15px]"
          >
            Start your order
          </Link>
        </section>

        <div className="relative z-10 mt-14 sm:mt-16">
          <BrandRibbonBand />
        </div>

        <section
          id="featured"
          className="mt-16 sm:mt-20"
          aria-labelledby="featured-heading"
        >
          <MarketingHeading
            id="featured-heading"
            eyebrow="From the kitchen"
            title="Featured"
            description="Signature special &amp; fan favourites."
            align="left"
            className="mb-6 text-left"
          />
          <ul className="flex flex-col gap-4 sm:gap-5">
            {featured.map((item) => (
              <li key={item.title}>
                <FeaturedCard {...item} />
              </li>
            ))}
          </ul>
        </section>

        <div className="relative left-1/2 z-10 mt-12 w-screen max-w-none -translate-x-1/2 sm:mt-14">
          <TestimonialMarquee />
        </div>

        <OrderNudgeCta />

        <footer className="mt-4 border-t border-brand-chocolate/[0.08] pt-10 sm:mt-6">
          <p className="text-center font-sans text-[13px] text-brand-taupe">
            <a
              href="tel:+2349037173629"
              className="font-medium text-brand-chocolate hover:underline"
            >
              0903 717 3629
            </a>
          </p>
          <p className="mt-2 text-center font-sans text-[11px] font-medium uppercase tracking-[0.12em] text-brand-taupe">
            Follow us
          </p>
          <SocialFollowLinks layout="footer" />
          <nav className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-3 font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-brand-taupe">
            <Link
              href="/order/status"
              className="transition hover:text-brand-chocolate"
            >
              Order status
            </Link>
            <Link
              href="/order/closed"
              className="transition hover:text-brand-chocolate"
            >
              Hours
            </Link>
          </nav>
        </footer>
      </div>
    </div>
  );
}
