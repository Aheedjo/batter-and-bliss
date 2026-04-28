"use client";

import { useState } from "react";
import type { ActionState } from "@/app/admin/menu/actions";
import { ItemEditorDialog, type MenuKind } from "./item-editor-dialog";
import { MenuItemRow } from "./menu-item-row";

type Item = {
  id: string;
  name: string;
  price: number | null;
  available: boolean;
  category?: string;
};

type Props = {
  title: string;
  description: string;
  kind: MenuKind;
  items: Item[];
  createAction: (
    prev: ActionState | undefined,
    formData: FormData,
  ) => Promise<ActionState>;
  updateAction: (
    prev: ActionState | undefined,
    formData: FormData,
  ) => Promise<ActionState>;
  setAvailable: (id: string, available: boolean) => Promise<void>;
};

export function MenuSection({
  title,
  description,
  kind,
  items,
  createAction,
  updateAction,
  setAvailable,
}: Props) {
  const [editor, setEditor] = useState<{
    open: boolean;
    mode: "create" | "edit";
    item: Item | null;
  }>({ open: false, mode: "create", item: null });
  const [dialogNonce, setDialogNonce] = useState(0);

  const action =
    editor.mode === "create" ? createAction : updateAction;

  const openCreate = () => {
    setDialogNonce((n) => n + 1);
    setEditor({ open: true, mode: "create", item: null });
  };

  const openEdit = (row: Item) => {
    setDialogNonce((n) => n + 1);
    setEditor({ open: true, mode: "edit", item: row });
  };

  return (
    <section className="rounded-2xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-6 shadow-[var(--ui-shadow)]">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-stone-900 dark:text-stone-100">
            {title}
          </h2>
          <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
            {description}
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-stone-800 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-stone-700"
        >
          Add {kind === "topping" ? "item" : "extra"}
        </button>
      </div>

      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--ui-border)] bg-[var(--ui-surface-muted)] px-4 py-8 text-center text-sm text-stone-500">
            No items yet. Add one to get started.
          </p>
        ) : (
          items.map((row) => (
            <MenuItemRow
              key={row.id}
              id={row.id}
              name={row.name}
              price={row.price}
              available={row.available}
              category={kind === "topping" ? row.category : undefined}
              onEdit={() => openEdit(row)}
              onToggleAvailable={setAvailable}
            />
          ))
        )}
      </div>

      <ItemEditorDialog
        key={`${kind}-${editor.mode}-${editor.item?.id ?? "new"}-${dialogNonce}`}
        kind={kind}
        open={editor.open}
        mode={editor.mode}
        item={editor.item}
        onClose={() => setEditor((e) => ({ ...e, open: false }))}
        action={action}
      />
    </section>
  );
}
