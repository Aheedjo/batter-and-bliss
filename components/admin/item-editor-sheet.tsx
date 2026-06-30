"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import type { ActionState } from "@/app/admin/menu/actions";
import { MenuImageField } from "@/components/admin/menu-image-field";
import {
  TOPPING_CATEGORIES,
  labelForToppingCategory,
} from "@/lib/order/menu-categories";

export type MenuKind = "stack" | "topping" | "extra";
const STACK_KINDS = ["pancake", "platter"] as const;

export type MenuEditorItem = {
  id: string;
  name: string;
  price: number | null;
  available: boolean;
  category?: string;
  description?: string | null;
  imageUrl?: string | null;
};

type Props = {
  kind: MenuKind;
  open: boolean;
  mode: "create" | "edit";
  item: MenuEditorItem | null;
  defaultCategory?: string;
  onClose: () => void;
  saveAction: (
    prev: ActionState | undefined,
    formData: FormData,
  ) => Promise<ActionState>;
  deleteAction?: (
    prev: ActionState | undefined,
    formData: FormData,
  ) => Promise<ActionState>;
};

export function ItemEditorSheet({
  kind,
  open,
  mode,
  item,
  defaultCategory = "topping",
  onClose,
  saveAction,
  deleteAction,
}: Props) {
  const EXIT_MS = 260;
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const formId = useId();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [deletePending, startDelete] = useTransition();
  const [rendered, setRendered] = useState(open);
  const [closing, setClosing] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRendered(true);
      setClosing(false);
      setEntered(false);
      const raf = window.requestAnimationFrame(() => {
        setEntered(true);
      });
      return () => window.cancelAnimationFrame(raf);
    }
    if (!rendered) return;
    setClosing(true);
    const t = window.setTimeout(() => {
      setRendered(false);
      setClosing(false);
      setEntered(false);
    }, EXIT_MS);
    return () => window.clearTimeout(t);
  }, [open, rendered]);

  useEffect(() => {
    if (!rendered) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [rendered]);

  useEffect(() => {
    if (!rendered) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [rendered, onClose]);

  if (!rendered || typeof document === "undefined") return null;

  const title =
    mode === "create"
      ? kind === "stack"
        ? defaultCategory === "platter"
          ? "New platter"
          : "New pancake"
        : kind === "topping"
        ? "New item"
        : "New extra"
      : kind === "stack"
        ? item?.category === "platter"
          ? "Edit platter"
          : "Edit pancake"
        : kind === "topping"
        ? "Edit menu item"
        : "Edit extra";

  return createPortal(
    (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end">
      <button
        type="button"
        className={`absolute inset-0 bg-order-brownInk/40 backdrop-blur-[2px] transition-opacity duration-300 ${
          closing || !entered ? "opacity-0" : "opacity-100"
        }`}
        aria-label="Close editor"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className={`relative z-10 mx-auto mt-[calc(3.5rem+env(safe-area-inset-top))] flex h-[calc(100dvh-3.5rem-env(safe-area-inset-top))] max-h-[calc(100dvh-3.5rem-env(safe-area-inset-top))] w-full max-w-lg flex-col rounded-t-[1.75rem] border border-order-line/80 bg-order-card shadow-lift ring-1 ring-white/90 [color-scheme:light] transition-transform duration-300 ${
          closing || !entered ? "translate-y-full ease-in" : "translate-y-0 ease-out"
        } sm:mt-[calc(3.75rem+env(safe-area-inset-top))] sm:h-[calc(100dvh-3.75rem-env(safe-area-inset-top))] sm:max-h-[calc(100dvh-3.75rem-env(safe-area-inset-top))]`}
      >
        <div className="flex h-full min-h-0 flex-col px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 sm:px-6">
          <div className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-order-line/80" aria-hidden />
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-serif text-xl font-semibold tracking-tight text-order-brownInk">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-order-line/80 bg-order-bg text-order-brownInk shadow-sm transition hover:bg-order-cream/80"
              aria-label="Close"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>

          <form
            id={formId}
            ref={formRef}
            className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain pb-2"
            action={(fd) => {
              setError(null);
              startTransition(async () => {
                const res = await saveAction(undefined, fd);
                if (res.ok) {
                  formRef.current?.reset();
                  router.refresh();
                  onClose();
                } else {
                  setError(res.message);
                }
              });
            }}
          >
            {mode === "edit" && item ? (
              <input type="hidden" name="id" value={item.id} />
            ) : null}

            {kind === "stack" || kind === "topping" ? (
              <MenuImageField
                key={`${mode}-${item?.id ?? "new"}-${item?.imageUrl ?? ""}`}
                initialUrl={item?.imageUrl}
                itemName={item?.name}
              />
            ) : null}

            <div className="flex flex-col gap-2">
              <label
                htmlFor={`${formId}-name`}
                className="font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-order-taupe"
              >
                Name
              </label>
              <input
                id={`${formId}-name`}
                name="name"
                required
                maxLength={120}
                defaultValue={item?.name ?? ""}
                className="rounded-xl border border-order-line/90 bg-white px-3 py-3 font-sans text-base text-order-brownInk outline-none transition placeholder:text-order-muted/60 focus:border-order-brownBtn/40 focus:ring-1 focus:ring-order-brownBtn/25"
                placeholder="e.g. Rose & Raspberry"
                autoComplete="off"
              />
            </div>

            {kind === "topping" ? (
              <div className="flex flex-col gap-2">
                <label
                  htmlFor={`${formId}-category`}
                  className="font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-order-taupe"
                >
                  Menu section
                </label>
                <select
                  id={`${formId}-category`}
                  name="category"
                  required
                  defaultValue={item?.category ?? defaultCategory}
                  className="rounded-xl border border-order-line/90 bg-white px-3 py-3 font-sans text-base text-order-brownInk outline-none transition focus:border-order-brownBtn/40 focus:ring-1 focus:ring-order-brownBtn/25"
                >
                  {TOPPING_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {labelForToppingCategory(c)}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
            {kind === "stack" ? (
              <div className="flex flex-col gap-2">
                <label
                  htmlFor={`${formId}-kind`}
                  className="font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-order-taupe"
                >
                  Package type
                </label>
                <select
                  id={`${formId}-kind`}
                  name="kind"
                  required
                  defaultValue={item?.category ?? defaultCategory}
                  className="rounded-xl border border-order-line/90 bg-white px-3 py-3 font-sans text-base text-order-brownInk outline-none transition focus:border-order-brownBtn/40 focus:ring-1 focus:ring-order-brownBtn/25"
                >
                  {STACK_KINDS.map((k) => (
                    <option key={k} value={k}>
                      {k === "pancake" ? "Pancake" : "Platter"}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div className="flex flex-col gap-2">
              <label
                htmlFor={`${formId}-price`}
                className="font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-order-taupe"
              >
                Price
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-sans text-sm text-order-muted">
                  ₦
                </span>
                <input
                  id={`${formId}-price`}
                  name="price"
                  inputMode="decimal"
                  defaultValue={
                    item?.price != null ? String(item.price) : ""
                  }
                  className="w-full rounded-xl border border-order-line/90 bg-white py-3 pr-3 pl-8 font-sans text-base text-order-brownInk outline-none transition placeholder:text-order-muted/60 focus:border-order-brownBtn/40 focus:ring-1 focus:ring-order-brownBtn/25"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor={`${formId}-description`}
                className="font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-order-taupe"
              >
                Description
              </label>
              <textarea
                id={`${formId}-description`}
                name="description"
                rows={4}
                maxLength={2000}
                defaultValue={item?.description ?? ""}
                className="resize-none rounded-xl border border-order-line/90 bg-white px-3 py-3 font-sans text-sm leading-relaxed text-order-brownInk outline-none transition placeholder:text-order-muted/60 focus:border-order-brownBtn/40 focus:ring-1 focus:ring-order-brownBtn/25"
                placeholder="Shown to your team on printed prep sheets and in the app when we wire it through."
              />
            </div>

            {error ? (
              <p className="font-sans text-sm text-order-red-text" role="alert">
                {error}
              </p>
            ) : null}
          </form>

          <div className="sticky bottom-0 mt-2 flex gap-2 border-t border-order-line/50 bg-order-card/95 pt-4 pb-1 backdrop-blur supports-[backdrop-filter]:bg-order-card/80">
            {mode === "edit" && item && deleteAction ? (
              <button
                type="button"
                disabled={deletePending || pending}
                onClick={() => {
                  if (
                    !window.confirm(
                      `Delete “${item.name}”? This cannot be undone.`,
                    )
                  ) {
                    return;
                  }
                  setError(null);
                  startDelete(async () => {
                    const fd = new FormData();
                    fd.set("id", item.id);
                    const res = await deleteAction(undefined, fd);
                    if (res.ok) {
                      router.refresh();
                      onClose();
                    } else setError(res.message);
                  });
                }}
                className="flex-1 rounded-full border border-order-line/90 bg-white py-3.5 font-sans text-sm font-semibold text-order-brownInk transition hover:bg-order-bg disabled:opacity-50"
              >
                {deletePending ? "Deleting…" : "Delete"}
              </button>
            ) : null}
            <button
              type="submit"
              form={formId}
              disabled={pending || deletePending}
              className={`rounded-full bg-order-brownBtn py-3.5 font-sans text-sm font-semibold text-white shadow-order-btn ring-1 ring-order-brownBtn/20 transition hover:brightness-110 disabled:opacity-60 ${
                mode === "edit" && deleteAction ? "flex-[2]" : "w-full"
              }`}
            >
              {pending ? "Saving…" : mode === "create" ? "Add item" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
    ),
    document.body,
  );
}
