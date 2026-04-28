import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--ui-canvas)]">
      <header className="border-b border-[var(--ui-border)] bg-[var(--ui-surface)]/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Batter &amp; Bliss
            </p>
            <h1 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              Admin
            </h1>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-stone-600 transition hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100"
          >
            ← Site
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </div>
    </div>
  );
}
