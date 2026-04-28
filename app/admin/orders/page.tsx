import Link from "next/link";

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-100">
          Orders
        </h2>
        <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
          This area will list incoming orders, statuses, and customer notes
          once the order API and database models are connected.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-6 shadow-[var(--ui-shadow)]">
        <p className="text-sm text-stone-600 dark:text-stone-300">
          Planned capabilities:
        </p>
        <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-stone-600 dark:text-stone-400">
          <li>POST/GET order endpoints and Prisma models for carts and lines</li>
          <li>Admin list with filters (new, in progress, done)</li>
          <li>Detail view with line items, add-ons, and pickup notes</li>
        </ul>
        <p className="mt-6 text-sm text-stone-500 dark:text-stone-400">
          For now, manage the live catalog on{" "}
          <Link
            href="/admin/menu"
            className="font-medium text-stone-800 underline decoration-stone-400/60 underline-offset-2 hover:decoration-stone-600 dark:text-stone-200"
          >
            Menu
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
