import { AdminNav } from "@/components/admin/admin-nav";
import { FloatingBrandDecor } from "@/components/brand/floating-brand-decor";
import { SiteHeader } from "@/components/brand/site-header";
import { logoutAdmin } from "@/app/admin/login/actions";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-order-bg text-order-brown [color-scheme:light]">
      <FloatingBrandDecor variant="order" />
      <SiteHeader variant="admin" adminLogoutAction={logoutAdmin} />
      <div className="relative overflow-x-hidden">
        <div className="mx-auto max-w-3xl px-5 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-1 sm:px-6 sm:pb-[calc(7rem+env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
      <AdminNav />
    </div>
  );
}
