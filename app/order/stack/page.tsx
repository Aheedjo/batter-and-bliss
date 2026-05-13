import { Suspense } from "react";
import { getAvailableStacks } from "@/lib/data/stacks-public";
import { StackClient } from "./stack-client";

export const dynamic = "force-dynamic";

export default async function ChooseStackPage() {
  const stacks = await getAvailableStacks();
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg px-5 py-12 text-center font-sans text-sm text-order-muted">
          Loading…
        </div>
      }
    >
      <StackClient stacks={stacks} />
    </Suspense>
  );
}
