import { FloatingBrandDecor } from "@/components/brand/floating-brand-decor";
import { SiteHeader } from "@/components/brand/site-header";

export default function OrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-order-bg text-order-brown [color-scheme:light]">
      <FloatingBrandDecor variant="order" />
      <SiteHeader variant="flow" />
      <div className="relative z-10 overflow-x-hidden">{children}</div>
    </div>
  );
}
