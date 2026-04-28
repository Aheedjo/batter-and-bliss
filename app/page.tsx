import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6">
      <div className="text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-stone-500">
          Batter &amp; Bliss
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
          Welcome
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-stone-600">
          Project boilerplate is ready. Manage toppings and extras from the admin
          screen.
        </p>
      </div>
      <Link
        href="/admin/menu"
        className="rounded-xl bg-stone-800 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-stone-700"
      >
        Open admin — menu
      </Link>
    </div>
  );
}
