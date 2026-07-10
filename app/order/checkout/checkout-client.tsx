"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMemo, useEffect, useState, useTransition, useCallback } from "react";
import { createCheckoutOrder } from "@/app/order/checkout/actions";
import { FlowNavBack } from "@/components/brand/flow-nav-back";
import { SectionHeading } from "@/components/brand/section-heading";
import { BankTransferPanel } from "@/components/order/bank-transfer-panel";
import { CartSummaryLineRow } from "@/components/order/cart-summary-line-row";
import { PlacesAddressField } from "@/components/order/places-address-field";
import { StickyAction } from "@/components/order/sticky-action";
import type { PublicStack } from "@/lib/data/stacks-public";
import type { PublicTopping } from "@/lib/data/toppings-public";
import { computeCartTotal } from "@/lib/order/pricing";
import { formatPrice } from "@/lib/order/money";
import { useOrderStore } from "@/lib/stores/order-store";

function newOrderReference() {
  const rand = globalThis.crypto
    ?.randomUUID?.()
    ?.replace(/-/g, "")
    .slice(0, 8)
    .toUpperCase();
  if (rand) return `BB-${rand}`;
  return `BB-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
}

const inputClass =
  "mt-1.5 w-full rounded-2xl border border-order-line/90 bg-order-bg px-4 py-3 font-sans text-base text-order-brownInk placeholder:text-order-muted/50 focus:border-order-brownBtn/40 focus:outline-none focus:ring-1 focus:ring-order-brownBtn/25";

const btnPrimary =
  "flex w-full items-center justify-center gap-2 rounded-full bg-order-brownBtn py-[1.05rem] font-serif text-[15px] font-semibold tracking-[0.01em] text-white shadow-order-btn ring-1 ring-order-brownBtn/20 transition hover:brightness-110 active:scale-[0.99]";

const cardRing = "ring-1 ring-black/[0.05]";

const nudgeRing =
  "ring-2 ring-order-brownBtn/45 ring-offset-2 ring-offset-order-bg shadow-[0_0_0_4px_rgba(139,90,60,0.12)] transition-shadow duration-300";

type NudgeField =
  | "intake"
  | "cap"
  | "delivery"
  | "placer"
  | "phone"
  | "payer"
  | null;

type Props = {
  toppings: PublicTopping[];
  stacks: PublicStack[];
  dailyCapacity: { cap: number | null; used: number };
  intake: {
    checkoutAllowed: boolean;
    blockedMessage: string | null;
    orderForDayLabel: string | null;
  };
};

function Subheading({
  kicker,
  title,
  className,
}: {
  kicker: string;
  title: string;
  className?: string;
}) {
  return (
    <div className={className ?? "mt-12"}>
      <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.22em] text-order-muted">
        {kicker}
      </p>
      <h2 className="mt-1.5 font-serif text-xl font-semibold tracking-[-0.02em] text-order-brownInk">
        {title}
      </h2>
    </div>
  );
}

const textareaClass =
  "mt-1.5 w-full resize-y rounded-2xl border border-order-line/90 bg-order-bg px-4 py-3 font-sans text-base leading-relaxed text-order-brownInk placeholder:text-order-muted/50 focus:border-order-brownBtn/40 focus:outline-none focus:ring-1 focus:ring-order-brownBtn/25 min-h-[5.5rem]";

export function CheckoutClient({
  toppings,
  stacks,
  dailyCapacity,
  intake,
}: Props) {
  const router = useRouter();
  const pancakeLines = useOrderStore((s) => s.pancakeLines);
  const drinkQuantities = useOrderStore((s) => s.drinkQuantities);
  const note = useOrderStore((s) => s.note);
  const setNote = useOrderStore((s) => s.setNote);
  const deliveryAddress = useOrderStore((s) => s.deliveryAddress);
  const setDeliveryAddress = useOrderStore((s) => s.setDeliveryAddress);
  const buyerPhone = useOrderStore((s) => s.buyerPhone);
  const setBuyerPhone = useOrderStore((s) => s.setBuyerPhone);
  const addActiveOrder = useOrderStore((s) => s.addActiveOrder);
  const resetOrder = useOrderStore((s) => s.resetOrder);

  const [orderReference] = useState(newOrderReference);
  const [placedByName, setPlacedByName] = useState("");
  const [optionalEmail, setOptionalEmail] = useState("");
  const [expectedBankSenderName, setExpectedBankSenderName] = useState("");
  const [payerSameAsPlacer, setPayerSameAsPlacer] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [placing, startTransition] = useTransition();
  const [nudgeField, setNudgeField] = useState<NudgeField>(null);

  const catalog = useMemo(
    () =>
      toppings.map((t) => ({
        id: t.id,
        name: t.name,
        price: t.price,
      })),
    [toppings],
  );
  const pricedStacks = useMemo(
    () =>
      stacks.map((s) => ({
        id: s.id,
        name: s.name,
        price: s.price,
      })),
    [stacks],
  );
  const stacksById = useMemo(
    () => new Map(stacks.map((s) => [s.id, s])),
    [stacks],
  );

  const { total, lines: detailLines, summaryLines } = useMemo(
    () => computeCartTotal(pancakeLines, drinkQuantities, pricedStacks, catalog),
    [pancakeLines, drinkQuantities, pricedStacks, catalog],
  );

  const first = pancakeLines[0];
  const firstStack = first ? stacksById.get(first.stackId) : null;
  const hasPancakes = pancakeLines.length > 0;
  const hasDrinks = Object.values(drinkQuantities).some((qty) => qty > 0);
  const hasAnyItems = hasPancakes || hasDrinks;
  // Drinks aren't part of the kitchen batch, so drinks-only carts are always orderable.
  const isDrinksOnly = !hasPancakes && hasDrinks;

  const atDailyCap = useMemo(
    () =>
      !isDrinksOnly &&
      dailyCapacity.cap != null &&
      dailyCapacity.used + pancakeLines.length > dailyCapacity.cap,
    [isDrinksOnly, dailyCapacity.cap, dailyCapacity.used, pancakeLines.length],
  );

  const intakeBlocked = !isDrinksOnly && !intake.checkoutAllowed;

  const placerOk = placedByName.trim().length >= 2;
  const payerNameEffective = payerSameAsPlacer
    ? placedByName.trim()
    : expectedBankSenderName.trim();
  const deliveryOk = deliveryAddress.trim().length >= 12;
  const phoneDigits = buyerPhone.replace(/\D/g, "").length;
  const phoneOk = phoneDigits >= 10 && phoneDigits <= 14;
  const canPlace =
    placerOk &&
    payerNameEffective.length >= 2 &&
    deliveryOk &&
    phoneOk &&
    !atDailyCap &&
    !intakeBlocked;

  useEffect(() => {
    if (!hasAnyItems && !isSubmittingOrder) router.replace("/order/stack");
  }, [hasAnyItems, isSubmittingOrder, router]);

  useEffect(() => {
    if (!nudgeField) return;
    const id = window.setTimeout(() => setNudgeField(null), 2600);
    return () => window.clearTimeout(id);
  }, [nudgeField]);

  const scrollToAndFocus = useCallback((elementId: string) => {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    if (
      el instanceof HTMLInputElement ||
      el instanceof HTMLTextAreaElement ||
      el instanceof HTMLSelectElement
    ) {
      window.setTimeout(() => {
        el.focus({ preventScroll: true });
      }, 320);
    }
  }, []);

  /** When checkout can’t submit yet, jump to the first problem (top → bottom). */
  const nudgeFirstCheckoutIssue = useCallback(() => {
    setOrderError(null);
    if (intakeBlocked) {
      setNudgeField("intake");
      scrollToAndFocus("checkout-section-intake");
      return;
    }
    if (atDailyCap) {
      setNudgeField("cap");
      scrollToAndFocus("checkout-section-cap");
      return;
    }
    if (!deliveryOk) {
      setNudgeField("delivery");
      scrollToAndFocus("checkout-delivery");
      return;
    }
    if (!placerOk) {
      setNudgeField("placer");
      scrollToAndFocus("checkout-placer");
      return;
    }
    if (!phoneOk) {
      setNudgeField("phone");
      scrollToAndFocus("checkout-phone");
      return;
    }
    if (payerNameEffective.length < 2) {
      setNudgeField("payer");
      scrollToAndFocus("checkout-payer");
    }
  }, [
    atDailyCap,
    deliveryOk,
    intakeBlocked,
    payerNameEffective.length,
    phoneOk,
    placerOk,
    scrollToAndFocus,
  ]);

  if (!hasAnyItems) return null;

  const stackNameForTrack =
    !hasPancakes
      ? "Drinks only order"
      : pancakeLines.length > 1
      ? `${pancakeLines.length} pancake orders`
      : firstStack?.name ?? "Pancake order";

  const customization = detailLines.join(" · ") || "—";

  function placeOrder() {
    if (!canPlace || placing) return;
    setIsSubmittingOrder(true);
    const reference = orderReference;
    const emailTrim = optionalEmail.trim().slice(0, 120);
    const placedAt = new Date().toISOString();
    const payload = {
      reference,
      stackId: first?.stackId ?? "drinks-only",
      stackName: stackNameForTrack,
      customization,
      note,
      total,
      placedAt,
      etaLabel: undefined,
      placedByName: placedByName.trim(),
      buyerPhone: buyerPhone.trim(),
      expectedBankSenderName: payerNameEffective,
      deliveryAddress: deliveryAddress.trim(),
      summaryLines,
      ...(emailTrim ? { email: emailTrim } : {}),
    };
    startTransition(async () => {
      const res = await createCheckoutOrder(payload);
      if (!res.ok) {
        setOrderError(res.message);
        setIsSubmittingOrder(false);
        window.requestAnimationFrame(() => {
          document
            .getElementById("checkout-order-error")
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
        });
        return;
      }
      setOrderError(null);
      addActiveOrder({
        reference,
        stackId: first?.stackId ?? "drinks-only",
        stackName: stackNameForTrack,
        customization,
        note,
        total,
        placedAt,
        status: "pending",
        placedByName: placedByName.trim(),
        expectedBankSenderName: payerNameEffective,
        buyerPhone: buyerPhone.trim(),
        ...(emailTrim ? { email: emailTrim } : {}),
        deliveryAddress: deliveryAddress.trim(),
        summaryLines,
      });
      resetOrder();
      router.push(
        `/order/status?ref=${encodeURIComponent(reference)}&focus=payment`,
      );
    });
  }

  function handlePlaceOrderClick() {
    if (placing) return;
    if (!canPlace) {
      nudgeFirstCheckoutIssue();
      return;
    }
    placeOrder();
  }

  return (
    <>
      <div className="mx-auto max-w-lg px-5 pb-40 pt-8 sm:px-6 sm:pt-10">
        <FlowNavBack href="/order/drinks">Drinks</FlowNavBack>

        <SectionHeading
          eyebrow="Checkout"
          title="Complete your order"
          className="mb-2"
        />

        {intakeBlocked && intake.blockedMessage ? (
          <div
            id="checkout-section-intake"
            className={`mt-5 rounded-xl border border-amber-200/90 bg-amber-50 px-3 py-2.5 shadow-soft ring-1 ring-amber-100/90 dark:border-amber-800/70 dark:bg-amber-950/35 dark:ring-amber-900/50 ${
              nudgeField === "intake" ? nudgeRing : ""
            }`}
            role="status"
          >
            <p className="font-sans text-sm font-semibold text-amber-950 dark:text-amber-50">
              Orders aren&apos;t open
            </p>
            <p className="mt-1 font-sans text-[11px] leading-relaxed text-amber-900/90 dark:text-amber-100/85">
              {intake.blockedMessage}
            </p>
          </div>
        ) : null}

        {atDailyCap ? (
          <div
            id="checkout-section-cap"
            className={`mt-5 rounded-xl border border-amber-200/90 bg-amber-50 px-3 py-2.5 shadow-soft ring-1 ring-amber-100/90 dark:border-amber-800/70 dark:bg-amber-950/35 dark:ring-amber-900/50 ${
              nudgeField === "cap" ? nudgeRing : ""
            }`}
            role="status"
          >
            <p className="font-sans text-sm font-semibold text-amber-950 dark:text-amber-50">
              Order window is full
            </p>
            <p className="mt-1 font-sans text-[11px] leading-relaxed text-amber-900/90 dark:text-amber-100/85">
              We&apos;ve hit today&apos;s pancake limit. Try again after the next
              opening or message us—we can&apos;t take more orders in this shop period.
            </p>
          </div>
        ) : null}

        <Subheading kicker="Review" title="Order summary" className="mt-8" />
        <div className={`mt-4 rounded-[1.75rem] bg-order-card p-5 shadow-card ${cardRing}`}>
          <ul className="space-y-4">
            {summaryLines.map((item, i) => (
              <CartSummaryLineRow
                key={`${item.kind}-${i}-${item.kind === "pancake" ? item.title : item.name}`}
                item={item}
              />
            ))}
          </ul>
          {note ? (
            <p className="mt-4 rounded-xl bg-order-bg/80 px-3 py-2.5 font-sans text-[12px] leading-relaxed text-order-taupe ring-1 ring-order-line/40">
              <span className="font-semibold text-order-muted">Note</span>
              <span className="mx-1 text-order-line" aria-hidden>
                ·
              </span>
              {note}
            </p>
          ) : null}
          <div className="my-2.5 h-px bg-order-line/70" />
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-sans text-[13px] font-bold uppercase tracking-wide text-order-muted">
              Total
            </span>
            <span className="font-serif text-xl font-semibold tabular-nums tracking-tight text-order-brownInk">
              {formatPrice(total)}
            </span>
          </div>
        </div>

        <Subheading
          kicker="Optional"
          title="Gift note or special instruction"
        />
        <div className="mt-4 rounded-[1.25rem] bg-order-card p-4 shadow-soft ring-1 ring-order-line/50">
          <label
            htmlFor="checkout-note"
            className="font-sans text-[11px] font-semibold uppercase tracking-wide text-order-muted"
          >
            Note (optional)
          </label>
          <textarea
            id="checkout-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={200}
            rows={3}
            placeholder="e.g. Happy Birthday Aisha"
            className={textareaClass}
          />
          <p className="mt-1 font-sans text-[10px] text-order-taupe">
            {note.length} / 200
          </p>
        </div>

        <Subheading kicker="Delivery" title={"Where we're bringing it"} />
        <div
          className={`mt-4 rounded-[1.25rem] bg-order-card p-4 shadow-soft ring-1 ring-order-line/50 ${
            nudgeField === "delivery" ? nudgeRing : ""
          }`}
        >
          <label
            htmlFor="checkout-delivery"
            className="font-sans text-[11px] font-semibold uppercase tracking-wide text-order-muted"
          >
            Delivery address
          </label>
          <p className="mt-0.5 font-sans text-[11px] text-order-taupe">
            We deliver only—pick a suggested address when available, or include
            house or flat number, street, area, a landmark, and city so the rider
            can find you.
          </p>
          <PlacesAddressField
            id="checkout-delivery"
            name="deliveryAddress"
            value={deliveryAddress}
            onChange={setDeliveryAddress}
            maxLength={500}
            placeholder="e.g. 12 Admiralty Way, Lekki Phase 1 — blue gate, 3rd floor"
            inputClassName={inputClass}
            textareaClassName={textareaClass}
          />
        </div>

        <Subheading kicker="Contact" title={"Who's ordering & paying"} />
        <div className="mt-4 space-y-4 rounded-[1.25rem] bg-order-card p-4 shadow-soft ring-1 ring-order-line/50">
          <div>
            <label
              htmlFor="checkout-placer"
              className="font-sans text-[11px] font-semibold uppercase tracking-wide text-order-muted"
            >
              Your name
            </label>
            <p className="mt-0.5 font-sans text-[11px] text-order-taupe">
              The person submitting this order.
            </p>
            <input
              id="checkout-placer"
              name="placedByName"
              autoComplete="name"
              value={placedByName}
              onChange={(e) => setPlacedByName(e.target.value)}
              placeholder="e.g. Aisha Bello"
              className={`${inputClass} ${nudgeField === "placer" ? nudgeRing : ""}`}
            />
          </div>
          <div>
            <label
              htmlFor="checkout-phone"
              className="font-sans text-[11px] font-semibold uppercase tracking-wide text-order-muted"
            >
              Your phone
            </label>
            <p className="mt-0.5 font-sans text-[11px] text-order-taupe">
              So we can call you about this order if needed.
            </p>
            <input
              id="checkout-phone"
              name="buyerPhone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              enterKeyHint="next"
              value={buyerPhone}
              onChange={(e) => setBuyerPhone(e.target.value)}
              placeholder="e.g. 0803 000 0000"
              maxLength={28}
              className={`${inputClass} ${nudgeField === "phone" ? nudgeRing : ""}`}
            />
          </div>
          <div>
            <label
              htmlFor="checkout-email"
              className="font-sans text-[11px] font-semibold uppercase tracking-wide text-order-muted"
            >
              Email{" "}
              <span className="font-normal normal-case text-order-taupe">
                — optional
              </span>
            </label>
            <input
              id="checkout-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              enterKeyHint="next"
              value={optionalEmail}
              onChange={(e) => setOptionalEmail(e.target.value)}
              placeholder="you@email.com"
              maxLength={120}
              className={inputClass}
            />
            <p className="mt-1 font-sans text-[10px] text-order-taupe">
              Skip if you like—we only use it for this order.
            </p>
          </div>
          <div>
            <label
              htmlFor="checkout-payer"
              className="font-sans text-[11px] font-semibold uppercase tracking-wide text-order-muted"
            >
              Name on the transfer
            </label>
            <p className="mt-0.5 font-sans text-[11px] text-order-taupe">
              Should match what we&apos;ll see on the payment.
            </p>
            <label className="mt-2 flex cursor-pointer items-center gap-2.5 font-sans text-[12px] text-order-brownDark">
              <input
                type="checkbox"
                checked={payerSameAsPlacer}
                onChange={(e) => {
                  const on = e.target.checked;
                  setPayerSameAsPlacer(on);
                  if (on) setExpectedBankSenderName("");
                }}
                className="h-4 w-4 shrink-0 cursor-pointer rounded border-order-line accent-order-brownBtn focus:ring-order-brownBtn/30"
              />
              Same as name above
            </label>
            <input
              id="checkout-payer"
              name="expectedBankSenderName"
              autoComplete="off"
              disabled={payerSameAsPlacer}
              value={payerSameAsPlacer ? placedByName : expectedBankSenderName}
              onChange={(e) => setExpectedBankSenderName(e.target.value)}
              placeholder="e.g. Chidi Okafor"
              className={`${inputClass} ${payerSameAsPlacer ? "opacity-70" : ""} ${
                nudgeField === "payer" && !payerSameAsPlacer ? nudgeRing : ""
              }`}
            />
          </div>
        </div>

        <Subheading kicker="Pay" title="Transfer details" />
        {!intakeBlocked && !atDailyCap ? (
          <div className="mt-3 rounded-xl border border-order-line/70 bg-order-bg/95 px-3 py-2.5 text-[11px] leading-snug text-order-taupe ring-1 ring-black/[0.04]">
            {intake.orderForDayLabel && !isDrinksOnly ? (
              <p className="font-sans text-order-brownInk">
                <span className="text-order-muted">Kitchen day</span>{" "}
                <span className="font-semibold">{intake.orderForDayLabel}</span>
              </p>
            ) : null}
            <p className={intake.orderForDayLabel && !isDrinksOnly ? "mt-1.5" : ""}>
              Use the{" "}
              <span className="font-medium text-order-brownInk">exact total</span>{" "}
              and{" "}
              <span className="font-medium text-order-brownInk">BB reference</span>{" "}
              here, then on{" "}
              <span className="font-medium text-order-brownInk">order status</span>{" "}
              tap{" "}
              <span className="font-medium text-order-brownInk">
                I&apos;ve sent the transfer
              </span>
              . Refunds: contact us with your BB reference.
            </p>
          </div>
        ) : null}
        <BankTransferPanel
          reference={orderReference}
          amount={total}
          className="mt-4"
        />
        <p className="mt-2 font-sans text-[11px] leading-snug text-order-muted">
          By placing an order, you agree to our{" "}
          <Link
            href="/privacy"
            className="font-semibold text-order-brownInk underline underline-offset-2"
          >
            Privacy Policy
          </Link>
          .
        </p>
        {orderError ? (
          <p
            id="checkout-order-error"
            className="mt-3 rounded-xl border border-red-200/80 bg-red-50 px-3 py-2 text-sm text-red-800"
            role="alert"
          >
            {orderError}
          </p>
        ) : null}
      </div>

      <StickyAction>
        {intakeBlocked ? (
          <p className="mb-3 text-center font-sans text-[12px] leading-snug text-order-taupe">
            You can still review your cart.
          </p>
        ) : null}
        {atDailyCap ? (
          <p className="mb-3 text-center font-sans text-[12px] leading-snug text-order-taupe">
            Placement is paused until tomorrow or our team adjusts
            capacity.
          </p>
        ) : null}
        <button
          type="button"
          onClick={handlePlaceOrderClick}
          disabled={placing}
          aria-busy={placing}
          aria-disabled={!canPlace && !placing}
          className={`${btnPrimary} ${
            placing ? "pointer-events-none opacity-60" : ""
          } ${!canPlace && !placing ? "opacity-90" : ""}`}
        >
          {placing ? "Placing…" : "Place order"}
          <span aria-hidden className="text-lg font-light">
            →
          </span>
        </button>
      </StickyAction>
    </>
  );
}
