import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [
    toppingTotal,
    toppingAvailable,
    extraTotal,
    extraAvailable,
  ] = await Promise.all([
    prisma.topping.count(),
    prisma.topping.count({ where: { available: true } }),
    prisma.extra.count(),
    prisma.extra.count({ where: { available: true } }),
  ]);

  const statCards = [
    {
      label: "Menu add-ons",
      value: toppingTotal,
      sub: `${toppingAvailable} available`,
      href: "/admin/menu",
      hint: "Glazing, toppings, syrups, drinks",
    },
    {
      label: "Extras",
      value: extraTotal,
      sub: `${extraAvailable} available`,
      href: "/admin/menu",
      hint: "Managed on the Menu page",
    },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
          Overview
        </h2>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          Quick read on catalog health. Use Menu to edit items and toggles.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        {statCards.map((card) => (
          <li key={card.label}>
            <Link
              href={card.href}
              className="block rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-5 shadow-[var(--ui-shadow)] transition hover:border-stone-300/80 dark:hover:border-stone-600"
            >
              <p className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
                {card.label}
              </p>
              <p className="mt-2 text-3xl font-semibold tabular-nums text-stone-900 dark:text-stone-100">
                {card.value}
              </p>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">
                {card.sub}
              </p>
              <p className="mt-3 text-xs text-stone-500 dark:text-stone-400">
                {card.hint} →
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <section className="rounded-2xl border border-dashed border-[var(--ui-border)] bg-[var(--ui-surface-muted)]/80 p-6">
        <h3 className="text-sm font-semibold text-stone-800 dark:text-stone-100">
          Next: orders &amp; API
        </h3>
        <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
          Customer checkout will move to a persisted order model and routes.
          The{" "}
          <Link
            href="/admin/orders"
            className="font-medium text-stone-800 underline decoration-stone-400/60 underline-offset-2 hover:decoration-stone-600 dark:text-stone-200"
          >
            Orders
          </Link>{" "}
          section is ready to plug in once that layer ships.
        </p>
      </section>
    </div>
  );
}
