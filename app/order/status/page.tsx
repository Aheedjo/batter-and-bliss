import { Suspense } from "react";
import { StatusClient } from "./status-client";

export default function OrderStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg px-5 py-12 text-center font-sans text-sm text-order-muted">
          Loading…
        </div>
      }
    >
      <StatusClient />
    </Suspense>
  );
}
