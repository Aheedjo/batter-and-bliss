import type { ReceiptOrder } from "@/lib/admin/receipt-order";
import { formatReceiptTimestamp } from "@/lib/admin/order-display";
import type { CartSummaryLine } from "@/lib/order/pricing";
import { formatPrice } from "@/lib/order/money";
import { forwardRef } from "react";

function ReceiptRule() {
  return <hr className="order-receipt-rule" aria-hidden />;
}

function ReceiptLine({ line }: { line: CartSummaryLine }) {
  if (line.kind === "fee") {
    return (
      <p style={{ padding: "0.25em 0", fontSize: "1em" }}>
        {line.label} — {formatPrice(line.lineTotal)}
      </p>
    );
  }
  if (line.kind === "pancake") {
    return (
      <div style={{ padding: "3px 0" }}>
        <p style={{ fontWeight: 700 }}>1× {line.title}</p>
        {line.details ? (
          <p className="order-receipt-topping">+ {line.details}</p>
        ) : null}
      </div>
    );
  }
  return (
    <p style={{ padding: "2px 0", fontWeight: 700 }}>
      {line.qty}× {line.name}
    </p>
  );
}

function statusLabel(order: ReceiptOrder) {
  if (order.status === "confirmed") return "CONFIRMED";
  if (order.status === "rejected") return "REJECTED";
  return "PENDING";
}

type Props = {
  order: ReceiptOrder;
};

export const OrderReceiptView = forwardRef<HTMLElement, Props>(
  function OrderReceiptView({ order }, ref) {
    const lines = (order.summaryLines ?? []).filter((l) => l.kind !== "fee");

    return (
      <article ref={ref} data-order-receipt className="order-receipt-paper">
        <header className="order-receipt-header">
          <p className="order-receipt-brand" style={{ fontSize: "1.125em", fontWeight: 700 }}>
            BATTER &amp; BLISS
          </p>
          <p
            style={{
              marginTop: 6,
              fontFamily: "ui-monospace, monospace",
              fontSize: "1.25em",
              fontWeight: 700,
            }}
          >
            {order.reference}
          </p>
          <p
            className="order-receipt-status"
            style={{
              marginTop: 3,
              fontSize: "1em",
              opacity: 0.75,
            }}
          >
            {statusLabel(order)}
          </p>
          <p style={{ marginTop: 3, fontSize: "1em", opacity: 0.8 }}>
            {formatReceiptTimestamp(order.placedAt)}
          </p>
        </header>

        <ReceiptRule />

        <section className="order-receipt-body">
          <p style={{ fontSize: "1.25em", fontWeight: 700, lineHeight: 1.25 }}>
            {order.placedByName}
          </p>
          <p style={{ marginTop: 3 }}>{order.buyerPhone}</p>
          <p style={{ marginTop: 4, lineHeight: 1.3 }}>{order.deliveryAddress}</p>
        </section>

        <ReceiptRule />

        <section className="order-receipt-body">
          <p
            style={{
              marginBottom: 4,
              fontSize: "1em",
              fontWeight: 700,
              letterSpacing: "0.1em",
              paddingRight: "0.1em",
            }}
          >
            ORDER
          </p>
          {lines.length > 0 ? (
            lines.map((line, i) => <ReceiptLine key={i} line={line} />)
          ) : (
            <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.3 }}>
              {order.customization}
            </p>
          )}
        </section>

        {order.note.trim() ? (
          <>
            <ReceiptRule />
            <section
              style={{
                border: "1px solid rgba(0,0,0,0.25)",
                borderRadius: 4,
                padding: "6px 8px",
              }}
            >
              <p
                style={{
                  fontSize: "1em",
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                }}
              >
                BOX CARD
              </p>
              <p
                style={{
                  marginTop: 4,
                  fontSize: "1.25em",
                  fontWeight: 700,
                  lineHeight: 1.3,
                }}
              >
                &ldquo;{order.note.trim()}&rdquo;
              </p>
            </section>
          </>
        ) : null}

        <ReceiptRule />

        <footer>
          <p style={{ fontSize: "1.375em", fontWeight: 700 }}>
            {formatPrice(order.total)}
          </p>
        </footer>
      </article>
    );
  },
);
