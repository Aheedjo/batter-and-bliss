"use client";

import { useActionState } from "react";
import { loginAdmin } from "./actions";

const inputClass =
  "mt-1.5 w-full rounded-2xl border border-order-line/90 bg-order-bg px-4 py-3 font-sans text-base text-order-brownInk placeholder:text-order-muted/50 focus:border-order-brownBtn/40 focus:outline-none focus:ring-1 focus:ring-order-brownBtn/25";

const btnClass =
  "mt-6 w-full rounded-full bg-order-brownBtn py-3.5 font-serif text-[15px] font-semibold tracking-[0.01em] text-white shadow-order-btn ring-1 ring-order-brownBtn/20 transition hover:brightness-110 active:scale-[0.99] disabled:opacity-50";

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(loginAdmin, null);

  return (
    <form action={formAction} className="mt-8 space-y-4">
      <div>
        <label
          htmlFor="admin-username"
          className="font-sans text-[11px] font-semibold uppercase tracking-wide text-order-muted"
        >
          Username
        </label>
        <input
          id="admin-username"
          name="username"
          type="text"
          autoComplete="username"
          required
          className={inputClass}
        />
      </div>
      <div>
        <label
          htmlFor="admin-password"
          className="font-sans text-[11px] font-semibold uppercase tracking-wide text-order-muted"
        >
          Password
        </label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </div>
      {state?.error ? (
        <p
          className="rounded-xl border border-red-200/80 bg-red-50 px-3 py-2 font-sans text-sm text-red-900"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className={btnClass}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
