import { Suspense } from "react";
import { getAvailableStacks } from "@/lib/data/stacks-public";
import { StatusClient } from "./status-client";

export const dynamic = "force-dynamic";

export default async function OrderStatusPage() {
  const stacks = await getAvailableStacks();
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg px-5 py-12 text-center font-sans text-sm text-order-muted">
          Loading…
        </div>
      }
    >
      <StatusClient stacks={stacks} />
    </Suspense>
  );
}
