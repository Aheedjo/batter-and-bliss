"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

const FLOW_PATHS = [
  "/order/stack",
  "/order/customize",
  "/order/builds",
  "/order/drinks",
  "/order/note",
  "/order/checkout",
] as const;

type Props = {
  variant: "marketing" | "flow" | "admin";
  /** Passed from server layout; shows “Log out” on admin (except login page). */
  adminLogoutAction?: () => Promise<void>;
};

export function SiteHeader({ variant, adminLogoutAction }: Props) {
  const pathname = usePathname();
  const flowPathForStep =
    pathname === "/order/platter" ? "/order/customize" : pathname;
  const stepIndex =
    variant === "flow"
      ? FLOW_PATHS.indexOf(flowPathForStep as (typeof FLOW_PATHS)[number])
      : -1;
  const showSteps = variant === "flow" && stepIndex >= 0;

  const logoClass =
    variant === "marketing"
      ? "text-brand-chocolate group-hover:text-brand-chocolate/85"
      : "text-order-brownInk group-hover:text-order-brownInk/85";

  const barClass =
    variant === "marketing"
      ? "border-brand-chocolate/[0.07] bg-brand-bg/90"
      : "border-order-line/80 bg-order-bg/90";

  const spacerH = showSteps
    ? "h-[calc(8rem+env(safe-area-inset-top))] sm:h-[calc(8.25rem+env(safe-area-inset-top))]"
    : "h-[calc(3.5rem+env(safe-area-inset-top))] sm:h-[calc(3.75rem+env(safe-area-inset-top))]";

  return (
    <>
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b pt-[env(safe-area-inset-top)] backdrop-blur-xl backdrop-saturate-150 ${barClass}`}
    >
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-5 sm:h-[3.75rem] sm:px-6">
        <Link
          href="/"
          className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-order-brown/20 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent rounded-sm"
        >
          <span
            className={`font-brand text-[1.75rem] font-normal leading-none tracking-wide transition sm:text-[2rem] ${logoClass}`}
          >
            Batter &amp; Bliss
          </span>
        </Link>

        <nav
          className="flex items-center gap-1"
          aria-label="Primary"
        >
          {variant === "marketing" ? (
            <Link
              href="/order"
              className="rounded-full px-3 py-1.5 font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-taupe transition hover:bg-brand-chocolate/5 hover:text-brand-chocolate"
            >
              Order
            </Link>
          ) : variant === "admin" ? (
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href="/"
                className="rounded-full px-3 py-1.5 font-sans text-[11px] font-medium text-order-muted transition hover:bg-order-brown/5 hover:text-order-brownInk"
              >
                View site
              </Link>
              {adminLogoutAction &&
              pathname &&
              !pathname.startsWith("/admin/login") ? (
                <form action={adminLogoutAction}>
                  <button
                    type="submit"
                    className="rounded-full px-3 py-1.5 font-sans text-[11px] font-semibold uppercase tracking-wide text-order-taupe transition hover:bg-order-brown/5 hover:text-order-brownInk"
                  >
                    Log out
                  </button>
                </form>
              ) : null}
            </div>
          ) : (
            <>
              <Link
                href="/"
                className="rounded-full px-2.5 py-1.5 font-sans text-[11px] font-medium text-order-muted transition hover:bg-order-brown/5 hover:text-order-brown"
              >
                Home
              </Link>
              <Link
                href="/order/status"
                className="rounded-full px-3 py-1.5 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-order-taupe transition hover:bg-order-brown/5 hover:text-order-brown"
              >
                Track
              </Link>
            </>
          )}
        </nav>
      </div>

      {showSteps ? (
        <div className="border-t border-order-line/40 bg-gradient-to-b from-white/30 to-transparent px-5 py-3 sm:px-6">
          <div className="mx-auto flex max-w-lg items-center justify-center gap-0">
            {Array.from({ length: FLOW_PATHS.length }, (_, i) => (
              <Fragment key={i}>
                <span
                  className={`relative h-1.5 w-1.5 shrink-0 rounded-full transition-all duration-300 sm:h-2 sm:w-2 ${
                    i <= stepIndex
                      ? "bg-order-brownBtn shadow-order-progress sm:shadow-order-progress-sm"
                      : "bg-order-line/90"
                  }`}
                  aria-hidden
                />
                {i < FLOW_PATHS.length - 1 ? (
                  <span
                    className={`mx-1 h-0.5 min-w-[0.65rem] flex-1 max-w-[2rem] rounded-full transition-colors duration-300 sm:mx-1.5 sm:min-w-[1.25rem] ${
                      i < stepIndex
                        ? "bg-order-brownBtn/35"
                        : "bg-order-line/70"
                    }`}
                    aria-hidden
                  />
                ) : null}
              </Fragment>
            ))}
          </div>
          <p className="mt-2 text-center font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-order-muted/90">
            Step {stepIndex + 1} of {FLOW_PATHS.length}
          </p>
        </div>
      ) : null}
    </header>
    <div aria-hidden className={`${spacerH} w-full shrink-0`} />
    </>
  );
}
