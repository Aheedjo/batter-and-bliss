import { Suspense } from "react";
import { FloatingBrandDecor } from "@/components/brand/floating-brand-decor";
import { SiteHeader } from "@/components/brand/site-header";
import { OrderIntakeBanner } from "@/components/order/order-intake-banner";
import { getCachedPublicOrderIntakeSnapshot } from "@/lib/order/order-intake";

/** Intake banner hits the DB; avoid static prerender without a live DATABASE_URL. */
export const dynamic = "force-dynamic";

export default async function OrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const intakeSnapshot = await getCachedPublicOrderIntakeSnapshot();
  return (
    <div className="relative min-h-screen bg-order-bg text-order-brown [color-scheme:light]">
      <FloatingBrandDecor variant="order" />
      <SiteHeader variant="flow" />
      <Suspense fallback={null}>
        <OrderIntakeBanner snapshot={intakeSnapshot} />
      </Suspense>
      <div className="relative z-10 overflow-x-hidden">{children}</div>
    </div>
  );
}
