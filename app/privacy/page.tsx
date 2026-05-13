import Link from "next/link";
import { FloatingBrandDecor } from "@/components/brand/floating-brand-decor";
import { SiteHeader } from "@/components/brand/site-header";

export const dynamic = "force-static";

export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-brand-bg text-brand-chocolate [color-scheme:light]">
      <FloatingBrandDecor variant="marketing" />
      <SiteHeader variant="marketing" />

      <main className="relative z-10 mx-auto max-w-lg px-5 pb-20 pt-6 sm:px-6 sm:pt-8">
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-taupe">
          Privacy
        </p>
        <h1 className="mt-2 font-serif text-[1.9rem] font-semibold leading-[1.15] tracking-[-0.03em] text-brand-chocolate sm:text-[2.1rem]">
          Privacy policy
        </h1>
        <p className="mt-3 font-sans text-[14px] leading-relaxed text-brand-taupe">
          Last updated: May 7, 2026. Batter &amp; Bliss is a delivery-first
          dessert kitchen in Abuja. We only collect what we need to process,
          deliver, and support your order.
        </p>

        <section className="mt-8 space-y-5">
          <article className="rounded-2xl bg-brand-card px-4 py-4 shadow-soft ring-1 ring-brand-rose/25">
            <h2 className="font-serif text-xl font-semibold text-brand-chocolate">
              What we collect
            </h2>
            <p className="mt-2 font-sans text-[14px] leading-relaxed text-brand-taupe">
              When you place an order, we collect your order details, name,
              delivery address, phone number, optional email, expected sender
              name for transfer matching, and payment/report timestamps.
            </p>
          </article>

          <article className="rounded-2xl bg-brand-card px-4 py-4 shadow-soft ring-1 ring-brand-rose/25">
            <h2 className="font-serif text-xl font-semibold text-brand-chocolate">
              No account required
            </h2>
            <p className="mt-2 font-sans text-[14px] leading-relaxed text-brand-taupe">
              We do not require account signup. Order tracking works from your
              order reference and recent-order data saved on your current device
              browser.
            </p>
          </article>

          <article className="rounded-2xl bg-brand-card px-4 py-4 shadow-soft ring-1 ring-brand-rose/25">
            <h2 className="font-serif text-xl font-semibold text-brand-chocolate">
              Device storage
            </h2>
            <p className="mt-2 font-sans text-[14px] leading-relaxed text-brand-taupe">
              To make checkout and tracking smoother, we store limited order
              state in your browser (for example recent in-progress orders on
              that device). Clearing browser data may remove this local history.
            </p>
          </article>

          <article className="rounded-2xl bg-brand-card px-4 py-4 shadow-soft ring-1 ring-brand-rose/25">
            <h2 className="font-serif text-xl font-semibold text-brand-chocolate">
              How we use your data
            </h2>
            <p className="mt-2 font-sans text-[14px] leading-relaxed text-brand-taupe">
              We use your information to fulfill deliveries, verify transfers,
              update order status, resolve support/refund issues, and maintain
              kitchen/admin records.
            </p>
          </article>

          <article className="rounded-2xl bg-brand-card px-4 py-4 shadow-soft ring-1 ring-brand-rose/25">
            <h2 className="font-serif text-xl font-semibold text-brand-chocolate">
              Retention and sharing
            </h2>
            <p className="mt-2 font-sans text-[14px] leading-relaxed text-brand-taupe">
              We keep operational order records for business and customer support
              purposes. We do not sell your personal data. We only share details
              with team members or delivery partners when needed to complete
              your order.
            </p>
          </article>

          <article className="rounded-2xl bg-brand-card px-4 py-4 shadow-soft ring-1 ring-brand-rose/25">
            <h2 className="font-serif text-xl font-semibold text-brand-chocolate">
              Corrections or deletion requests
            </h2>
            <p className="mt-2 font-sans text-[14px] leading-relaxed text-brand-taupe">
              If you want your details corrected or removed, contact Batter
              &amp; Bliss with your order reference:
            </p>
            <a
              href="tel:+2349037173629"
              className="mt-2 inline-block font-sans text-[14px] font-semibold text-brand-chocolate underline underline-offset-4"
            >
              0903 717 3629
            </a>
          </article>
        </section>

        <div className="mt-8">
          <Link
            href="/"
            className="font-sans text-sm font-semibold text-brand-chocolate underline underline-offset-4"
          >
            Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
