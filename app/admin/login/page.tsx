import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SectionHeading } from "@/components/brand/section-heading";
import { isAdminPasswordConfigured } from "@/lib/auth/admin-env";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/auth/admin-session";
import { AdminLoginForm } from "./login-form";

export default async function AdminLoginPage() {
  if (!isAdminPasswordConfigured()) {
    redirect("/admin");
  }

  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (await verifyAdminSessionToken(token)) {
    redirect("/admin");
  }

  return (
    <div className="mx-auto max-w-md px-5 pb-24 pt-10 sm:px-6 sm:pt-14">
      <SectionHeading
        eyebrow="Admin"
        title="Sign in"
        className="mb-2"
      />
      <p className="font-sans text-sm leading-relaxed text-order-taupe">
        Sign in with the credentials your team configured for this admin area.
      </p>
      <AdminLoginForm />
      <p className="mt-8 text-center font-sans text-[12px] text-order-muted">
        <Link
          href="/"
          className="font-medium text-order-brownInk underline underline-offset-2"
        >
          Back to site
        </Link>
      </p>
    </div>
  );
}
