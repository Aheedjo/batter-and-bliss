"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { ActionState } from "@/app/admin/menu/actions";
import {
  TOPPING_CATEGORIES,
  labelForToppingCategory,
} from "@/lib/order/menu-categories";

export type MenuKind = "topping" | "extra";

type Item = {
  id: string;
  name: string;
  price: number | null;
  available: boolean;
  category?: string;
};

type Props = {
  kind: MenuKind;
  open: boolean;
  mode: "create" | "edit";
  item: Item | null;
  onClose: () => void;
  action: (
    prev: ActionState | undefined,
    formData: FormData,
  ) => Promise<ActionState>;
};

export function ItemEditorDialog({
  kind,
  open,
  mode,
  item,
  onClose,
  action,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      el.showModal();
    } else {
      el.close();
    }
  }, [open]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const onCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    el.addEventListener("cancel", onCancel);
    return () => el.removeEventListener("cancel", onCancel);
  }, [onClose]);

  const title =
    mode === "create"
      ? kind === "topping"
        ? "New menu add-on"
        : "New extra"
      : kind === "topping"
        ? "Edit menu add-on"
        : "Edit extra";

  return (
    <dialog
      ref={dialogRef}
      className="w-full max-w-md rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-0 text-[var(--foreground)] shadow-[var(--ui-shadow)] backdrop:bg-stone-900/25"
      onClose={onClose}
    >
      <form
        ref={formRef}
        className="flex flex-col gap-4 p-6"
        action={(fd) => {
          setError(null);
          startTransition(async () => {
            const res = await action(undefined, fd);
            if (res.ok) {
              formRef.current?.reset();
              onClose();
            } else {
              setError(res.message);
            }
          });
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight text-stone-800 dark:text-stone-100">
            {title}
          </h2>
          <button
            type="button"
            className="rounded-lg px-2 py-1 text-sm text-stone-500 transition hover:bg-stone-100 hover:text-stone-700 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {mode === "edit" && item ? (
          <input type="hidden" name="id" value={item.id} />
        ) : null}

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`${kind}-name`}
            className="text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400"
          >
            Name
          </label>
          <input
            id={`${kind}-name`}
            name="name"
            required
            maxLength={120}
            defaultValue={item?.name ?? ""}
            className="rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface-elevated)] px-3 py-2.5 text-sm outline-none ring-stone-300 transition placeholder:text-stone-400 focus:ring-2 dark:ring-stone-600"
            placeholder="e.g. Nutella drizzle"
            autoComplete="off"
          />
        </div>

        {kind === "topping" ? (
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={`${kind}-category`}
              className="text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400"
            >
              Menu section
            </label>
            <select
              id={`${kind}-category`}
              name="category"
              required
              defaultValue={item?.category ?? "topping"}
              className="rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface-elevated)] px-3 py-2.5 text-sm outline-none ring-stone-300 transition focus:ring-2 dark:ring-stone-600"
            >
              {TOPPING_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {labelForToppingCategory(c)}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={`${kind}-price`}
            className="text-xs font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400"
          >
            Price <span className="font-normal normal-case">(optional)</span>
          </label>
          <input
            id={`${kind}-price`}
            name="price"
            inputMode="numeric"
            defaultValue={
              item?.price != null ? String(item.price) : ""
            }
            className="rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface-elevated)] px-3 py-2.5 text-sm outline-none ring-stone-300 transition placeholder:text-stone-400 focus:ring-2 dark:ring-stone-600"
            placeholder="Leave empty if included"
          />
        </div>

        {error ? (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-stone-600 transition hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-stone-800 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-stone-700 disabled:opacity-60"
          >
            {pending ? "Saving…" : mode === "create" ? "Add" : "Save"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
