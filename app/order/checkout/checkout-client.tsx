"use client";

import { useRouter } from "next/navigation";
import { useMemo, useEffect, useState } from "react";
import { FlowNavBack } from "@/components/brand/flow-nav-back";
import { SectionHeading } from "@/components/brand/section-heading";
import { BankTransferPanel } from "@/components/order/bank-transfer-panel";
import { CartSummaryLineRow } from "@/components/order/cart-summary-line-row";
import { StickyAction } from "@/components/order/sticky-action";
import type { PublicTopping } from "@/lib/data/toppings-public";
import { computeCartTotal } from "@/lib/order/pricing";
import { formatPrice } from "@/lib/order/money";
import { getStackById } from "@/lib/order/stacks";
import { useOrderStore } from "@/lib/stores/order-store";

function newOrderReference() {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `BB-${n}`;
}

const inputClass =
  "mt-1.5 w-full rounded-2xl border border-order-line/90 bg-order-bg px-4 py-3 font-sans text-[14px] text-order-brownInk placeholder:text-order-muted/50 focus:border-order-brownBtn/40 focus:outline-none focus:ring-1 focus:ring-order-brownBtn/25";

const btnPrimary =
  "flex w-full items-center justify-center gap-2 rounded-full bg-order-brownBtn py-[1.05rem] font-serif text-[15px] font-semibold tracking-[0.01em] text-white shadow-order-btn ring-1 ring-order-brownBtn/20 transition hover:brightness-110 active:scale-[0.99]";

const cardRing = "ring-1 ring-black/[0.05]";

type Props = {
  toppings: PublicTopping[];
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
  "mt-1.5 w-full resize-y rounded-2xl border border-order-line/90 bg-order-bg px-4 py-3 font-sans text-[14px] leading-relaxed text-order-brownInk placeholder:text-order-muted/50 focus:border-order-brownBtn/40 focus:outline-none focus:ring-1 focus:ring-order-brownBtn/25 min-h-[5.5rem]";

export function CheckoutClient({ toppings }: Props) {
  const router = useRouter();
  const pancakeLines = useOrderStore((s) => s.pancakeLines);
  const drinkQuantities = useOrderStore((s) => s.drinkQuantities);
  const note = useOrderStore((s) => s.note);
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

  const catalog = useMemo(
    () =>
      toppings.map((t) => ({
        id: t.id,
        name: t.name,
        price: t.price,
      })),
    [toppings],
  );

  const { total, lines: detailLines, summaryLines } = useMemo(
    () => computeCartTotal(pancakeLines, drinkQuantities, catalog),
    [pancakeLines, drinkQuantities, catalog],
  );

  const first = pancakeLines[0];
  const firstStack = first ? getStackById(first.stackId) : null;

  useEffect(() => {
    if (pancakeLines.length === 0) router.replace("/order/builds");
  }, [pancakeLines.length, router]);

  if (!first || !firstStack) return null;

  const stackNameForTrack =
    pancakeLines.length > 1
      ? `${pancakeLines.length} pancake orders`
      : firstStack.name;

  const customization = detailLines.join(" · ") || "—";

  const placerOk = placedByName.trim().length >= 2;
  const payerNameEffective = payerSameAsPlacer
    ? placedByName.trim()
    : expectedBankSenderName.trim();
  const deliveryOk = deliveryAddress.trim().length >= 12;
  const phoneDigits = buyerPhone.replace(/\D/g, "").length;
  const phoneOk = phoneDigits >= 10 && phoneDigits <= 14;
  const canPlace =
    placerOk && payerNameEffective.length >= 2 && deliveryOk && phoneOk;

  function placeOrder() {
    if (!canPlace) return;
    const reference = orderReference;
    const emailTrim = optionalEmail.trim().slice(0, 120);
    addActiveOrder({
      reference,
      stackId: first.stackId,
      stackName: stackNameForTrack,
      customization,
      note,
      total,
      placedAt: new Date().toISOString(),
      status: "pending",
      etaLabel: "Today, 4:30 PM",
      placedByName: placedByName.trim(),
      expectedBankSenderName: payerNameEffective,
      buyerPhone: buyerPhone.trim(),
      ...(emailTrim ? { email: emailTrim } : {}),
      deliveryAddress: deliveryAddress.trim(),
      summaryLines,
    });
    resetOrder();
    router.push(`/order/status?ref=${encodeURIComponent(reference)}`);
  }

  return (
    <>
      <div className="mx-auto max-w-lg px-5 pb-40 pt-8 sm:px-6 sm:pt-10">
        <FlowNavBack href="/order/note">Note</FlowNavBack>

        <SectionHeading
          eyebrow="Checkout"
          title="Complete your order"
          className="mb-2"
        />

        <Subheading kicker="Review" title="Order summary" className="mt-10" />
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

        <Subheading kicker="Delivery" title={"Where we're bringing it"} />
        <div className="mt-4 rounded-[1.25rem] bg-order-card p-4 shadow-soft ring-1 ring-order-line/50">
          <label
            htmlFor="checkout-delivery"
            className="font-sans text-[11px] font-semibold uppercase tracking-wide text-order-muted"
          >
            Delivery address
          </label>
          <p className="mt-0.5 font-sans text-[11px] text-order-taupe">
            We deliver only—include house or flat number, street, area, a nearby
            landmark, and city so the rider can find you.
          </p>
          <textarea
            id="checkout-delivery"
            name="deliveryAddress"
            autoComplete="street-address"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            placeholder="e.g. 12 Admiralty Way, Lekki Phase 1 — blue gate, 3rd floor"
            maxLength={500}
            className={textareaClass}
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
              className={inputClass}
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
              className={inputClass}
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
                className="h-4 w-4 shrink-0 rounded border-order-line text-order-brownBtn focus:ring-order-brownBtn/30"
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
              className={`${inputClass} ${payerSameAsPlacer ? "opacity-70" : ""}`}
            />
          </div>
        </div>

        <Subheading kicker="Pay" title="Transfer details" />
        <BankTransferPanel
          reference={orderReference}
          amount={total}
          className="mt-4"
        />
        <p className="mt-3 flex items-start gap-2 rounded-2xl bg-order-bg px-3 py-2.5 font-sans text-[11px] leading-snug text-order-taupe ring-1 ring-black/[0.04]">
          <span className="mt-0.5 text-order-muted" aria-hidden>
            ⓘ
          </span>
          After you pay, open your order status and tap &quot;I&apos;ve sent the
          transfer&quot; so we know to look out for it.
        </p>
      </div>

      <StickyAction>
        <button
          type="button"
          onClick={placeOrder}
          disabled={!canPlace}
          className={`${btnPrimary} ${!canPlace ? "pointer-events-none opacity-50" : ""}`}
        >
          Place order
          <span aria-hidden className="text-lg font-light">
            →
          </span>
        </button>
      </StickyAction>
    </>
  );
}
