import { Suspense } from "react";
import { StackClient } from "./stack-client";

export default function ChooseStackPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg px-5 py-12 text-center font-sans text-sm text-order-muted">
          Loading…
        </div>
      }
    >
      <StackClient />
    </Suspense>
  );
}
