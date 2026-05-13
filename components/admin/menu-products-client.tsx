"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import type { ActionState } from "@/app/admin/menu/actions";
import { ItemEditorSheet, type MenuEditorItem, type MenuKind } from "./item-editor-sheet";
import { MenuProductCard } from "./menu-product-card";

export type MenuStackRow = {
  id: string;
  name: string;
  kind: "pancake" | "platter";
  price: number | null;
  available: boolean;
  description: string | null;
};

export type MenuToppingRow = {
  id: string;
  name: string;
  price: number | null;
  category: string;
  available: boolean;
  description: string | null;
};

export type MenuExtraRow = {
  id: string;
  name: string;
  price: number | null;
  available: boolean;
  description: string | null;
};

type Tab = "pancakes" | "platters" | "toppings" | "drinks" | "extras";

type Props = {
  stacks: MenuStackRow[];
  toppings: MenuToppingRow[];
  extras: MenuExtraRow[];
  createStack: (
    prev: ActionState | undefined,
    formData: FormData,
  ) => Promise<ActionState>;
  updateStack: (
    prev: ActionState | undefined,
    formData: FormData,
  ) => Promise<ActionState>;
  deleteStack: (
    prev: ActionState | undefined,
    formData: FormData,
  ) => Promise<ActionState>;
  setStackAvailable: (id: string, available: boolean) => Promise<void>;
  createTopping: (
    prev: ActionState | undefined,
    formData: FormData,
  ) => Promise<ActionState>;
  updateTopping: (
    prev: ActionState | undefined,
    formData: FormData,
  ) => Promise<ActionState>;
  deleteTopping: (
    prev: ActionState | undefined,
    formData: FormData,
  ) => Promise<ActionState>;
  setToppingAvailable: (id: string, available: boolean) => Promise<void>;
  createExtra: (
    prev: ActionState | undefined,
    formData: FormData,
  ) => Promise<ActionState>;
  updateExtra: (
    prev: ActionState | undefined,
    formData: FormData,
  ) => Promise<ActionState>;
  deleteExtra: (
    prev: ActionState | undefined,
    formData: FormData,
  ) => Promise<ActionState>;
  setExtraAvailable: (id: string, available: boolean) => Promise<void>;
};

const TOPPING_TAB_CATEGORIES = [
  "glazing",
  "platter_glazing",
  "topping",
  "platter_topping",
  "syrup",
] as const;

function matchesSearch(name: string, q: string) {
  if (!q.trim()) return true;
  return name.toLowerCase().includes(q.trim().toLowerCase());
}

export function MenuProductsClient({
  stacks,
  toppings,
  extras,
  createStack,
  updateStack,
  deleteStack,
  setStackAvailable,
  createTopping,
  updateTopping,
  deleteTopping,
  setToppingAvailable,
  createExtra,
  updateExtra,
  deleteExtra,
  setExtraAvailable,
}: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("toppings");
  const [addTarget, setAddTarget] = useState<Tab>("toppings");
  const [search, setSearch] = useState("");
  const [editor, setEditor] = useState<{
    open: boolean;
    mode: "create" | "edit";
    kind: MenuKind;
    item: MenuEditorItem | null;
    defaultCategory: string;
  }>({
    open: false,
    mode: "create",
    kind: "stack",
    item: null,
    defaultCategory: "topping",
  });
  const [sheetNonce, setSheetNonce] = useState(0);

  const toppingAddOns = useMemo(
    () =>
      toppings.filter((t) =>
        (TOPPING_TAB_CATEGORIES as readonly string[]).includes(t.category),
      ),
    [toppings],
  );

  const drinkRows = useMemo(
    () => toppings.filter((t) => t.category === "drink"),
    [toppings],
  );

  const filteredStacks = useMemo(() => {
    return stacks.filter((s) => matchesSearch(s.name, search));
  }, [stacks, search]);
  const filteredPancakes = useMemo(
    () => filteredStacks.filter((s) => s.kind === "pancake"),
    [filteredStacks],
  );
  const filteredPlatters = useMemo(
    () => filteredStacks.filter((s) => s.kind === "platter"),
    [filteredStacks],
  );

  const filteredToppingAddOns = useMemo(() => {
    return toppingAddOns.filter((t) => matchesSearch(t.name, search));
  }, [toppingAddOns, search]);

  const filteredDrinks = useMemo(() => {
    return drinkRows.filter((t) => matchesSearch(t.name, search));
  }, [drinkRows, search]);

  const filteredExtras = useMemo(() => {
    return extras.filter((e) => matchesSearch(e.name, search));
  }, [extras, search]);

  const activeCount =
    tab === "pancakes"
      ? filteredPancakes.filter((s) => s.available).length
      : tab === "platters"
        ? filteredPlatters.filter((s) => s.available).length
      : tab === "toppings"
        ? filteredToppingAddOns.filter((t) => t.available).length
        : tab === "drinks"
          ? filteredDrinks.filter((t) => t.available).length
          : filteredExtras.filter((e) => e.available).length;

  const totalCount =
    tab === "pancakes"
      ? filteredPancakes.length
      : tab === "platters"
        ? filteredPlatters.length
      : tab === "toppings"
        ? filteredToppingAddOns.length
        : tab === "drinks"
          ? filteredDrinks.length
          : filteredExtras.length;

  function openCreate() {
    setSheetNonce((n) => n + 1);
    if (addTarget === "pancakes" || addTarget === "platters") {
      setEditor({
        open: true,
        mode: "create",
        kind: "stack",
        item: null,
        defaultCategory: addTarget === "platters" ? "platter" : "pancake",
      });
      return;
    }
    if (addTarget === "extras") {
      setEditor({
        open: true,
        mode: "create",
        kind: "extra",
        item: null,
        defaultCategory: "topping",
      });
      return;
    }
    setEditor({
      open: true,
      mode: "create",
      kind: "topping",
      item: null,
      defaultCategory: addTarget === "drinks" ? "drink" : "topping",
    });
  }

  function openEditStack(row: MenuStackRow) {
    setSheetNonce((n) => n + 1);
    setEditor({
      open: true,
      mode: "edit",
      kind: "stack",
      item: {
        id: row.id,
        name: row.name,
        price: row.price,
        available: row.available,
        category: row.kind,
        description: row.description,
      },
      defaultCategory: row.kind,
    });
  }

  function openEditTopping(row: MenuToppingRow) {
    setSheetNonce((n) => n + 1);
    setEditor({
      open: true,
      mode: "edit",
      kind: "topping",
      item: {
        id: row.id,
        name: row.name,
        price: row.price,
        available: row.available,
        category: row.category,
        description: row.description,
      },
      defaultCategory: row.category,
    });
  }

  function openEditExtra(row: MenuExtraRow) {
    setSheetNonce((n) => n + 1);
    setEditor({
      open: true,
      mode: "edit",
      kind: "extra",
      item: {
        id: row.id,
        name: row.name,
        price: row.price,
        available: row.available,
        description: row.description,
      },
      defaultCategory: "topping",
    });
  }

  const saveAction =
    editor.kind === "stack"
      ? editor.mode === "create"
        ? createStack
        : updateStack
      : editor.kind === "topping"
      ? editor.mode === "create"
        ? createTopping
        : updateTopping
      : editor.mode === "create"
        ? createExtra
        : updateExtra;

  const deleteAction =
    editor.kind === "stack"
      ? deleteStack
      : editor.kind === "topping"
        ? deleteTopping
        : deleteExtra;

  const refreshToggleStack = useCallback(
    async (id: string, available: boolean) => {
      await setStackAvailable(id, available);
      router.refresh();
    },
    [router, setStackAvailable],
  );

  const refreshToggleTopping = useCallback(
    async (id: string, available: boolean) => {
      await setToppingAvailable(id, available);
      router.refresh();
    },
    [router, setToppingAvailable],
  );

  const refreshToggleExtra = useCallback(
    async (id: string, available: boolean) => {
      await setExtraAvailable(id, available);
      router.refresh();
    },
    [router, setExtraAvailable],
  );

  const tabs: { id: Tab; label: string }[] = [
    { id: "pancakes", label: "Pancakes" },
    { id: "platters", label: "Platters" },
    { id: "toppings", label: "Toppings" },
    { id: "drinks", label: "Drinks" },
    { id: "extras", label: "Extras" },
  ];

  return (
    <div className="space-y-6 pb-4 pt-5 sm:space-y-7 sm:pt-8">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-order-brownInk sm:text-[2rem]">
            Menu products
          </h1>
          <p className="mt-1.5 font-sans text-sm text-order-taupe">
            Manage pancakes, add-ons, drinks, and extras from one place.
          </p>
        </div>
      </div>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-order-muted"
          strokeWidth={2}
          aria-hidden
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          className="w-full rounded-full border border-order-line/90 bg-order-card py-2.5 pr-3 pl-10 font-sans text-sm text-order-brownInk outline-none transition placeholder:text-order-muted/70 focus:border-order-brownBtn/35 focus:ring-1 focus:ring-order-brownBtn/20"
          aria-label="Search menu"
        />
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map(({ id, label }) => {
          const on = tab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => {
                setTab(id);
                setAddTarget(id);
              }}
              className={`shrink-0 rounded-full px-4 py-2 font-sans text-xs font-semibold transition sm:text-[13px] ${
                on
                  ? "bg-order-brownBtn text-white shadow-order-btn ring-1 ring-order-brownBtn/20"
                  : "border border-order-line/90 bg-order-card text-order-taupe hover:bg-order-bg hover:text-order-brownInk"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2 rounded-[1rem] border border-order-line/80 bg-order-card px-3 py-2.5 shadow-soft ring-1 ring-white/80">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-order-taupe">
            Add to
          </span>
          <select
            value={addTarget}
            onChange={(e) => setAddTarget(e.target.value as Tab)}
            className="min-w-0 rounded-full border border-order-line/80 bg-order-bg px-3 py-1.5 font-sans text-xs font-semibold text-order-brownInk outline-none transition focus:border-order-brownBtn/35 focus:ring-1 focus:ring-order-brownBtn/20"
            aria-label="Choose category to add"
          >
            <option value="pancakes">Pancakes</option>
            <option value="platters">Platters</option>
            <option value="toppings">Toppings</option>
            <option value="drinks">Drinks</option>
            <option value="extras">Extras</option>
          </select>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="shrink-0 rounded-full border border-order-line/90 bg-white px-3.5 py-1.5 font-sans text-xs font-semibold text-order-brownInk shadow-sm ring-1 ring-white/80 transition hover:bg-order-bg"
        >
          + Add
        </button>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <p className="font-sans text-[10px] font-bold uppercase tracking-[0.18em] text-order-taupe">
          {tab === "pancakes"
            ? "Pancake items"
            : tab === "platters"
              ? "Platter items"
              : "Active items"}
        </p>
        <span className="rounded-full border border-order-line/80 bg-order-card px-2.5 py-0.5 font-sans text-[10px] font-semibold text-order-taupe">
          {tab === "pancakes"
            ? `${filteredPancakes.filter((s) => s.available).length} / ${filteredPancakes.length}`
            : tab === "platters"
              ? `${filteredPlatters.filter((s) => s.available).length} / ${filteredPlatters.length}`
            : `${activeCount} / ${totalCount}`}
        </span>
      </div>

      <div className="space-y-2.5">
        {tab === "pancakes" ? (
          filteredPancakes.length === 0 ? (
            <p className="rounded-[1.25rem] border border-dashed border-order-line/70 bg-order-card/60 px-4 py-10 text-center font-sans text-sm text-order-muted">
              No pancakes match your search.
            </p>
          ) : (
            filteredPancakes.map((s) => (
              <MenuProductCard
                key={s.id}
                variant="db"
                id={s.id}
                name={s.name}
                price={s.price}
                available={s.available}
                onEdit={() => openEditStack(s)}
                onToggleAvailable={refreshToggleStack}
              />
            ))
          )
        ) : tab === "platters" ? (
          filteredPlatters.length === 0 ? (
            <p className="rounded-[1.25rem] border border-dashed border-order-line/70 bg-order-card/60 px-4 py-10 text-center font-sans text-sm text-order-muted">
              No platters match your search.
            </p>
          ) : (
            filteredPlatters.map((s) => (
              <MenuProductCard
                key={s.id}
                variant="db"
                id={s.id}
                name={s.name}
                price={s.price}
                available={s.available}
                onEdit={() => openEditStack(s)}
                onToggleAvailable={refreshToggleStack}
              />
            ))
          )
        ) : tab === "toppings" ? (
          filteredToppingAddOns.length === 0 ? (
            <p className="rounded-[1.25rem] border border-dashed border-order-line/70 bg-order-card/60 px-4 py-10 text-center font-sans text-sm text-order-muted">
              No toppings yet. Add one below.
            </p>
          ) : (
            filteredToppingAddOns.map((row) => (
              <MenuProductCard
                key={row.id}
                variant="db"
                id={row.id}
                name={row.name}
                price={row.price}
                available={row.available}
                onEdit={() => openEditTopping(row)}
                onToggleAvailable={refreshToggleTopping}
              />
            ))
          )
        ) : tab === "drinks" ? (
          filteredDrinks.length === 0 ? (
            <p className="rounded-[1.25rem] border border-dashed border-order-line/70 bg-order-card/60 px-4 py-10 text-center font-sans text-sm text-order-muted">
              No drinks yet.
            </p>
          ) : (
            filteredDrinks.map((row) => (
              <MenuProductCard
                key={row.id}
                variant="db"
                id={row.id}
                name={row.name}
                price={row.price}
                available={row.available}
                onEdit={() => openEditTopping(row)}
                onToggleAvailable={refreshToggleTopping}
              />
            ))
          )
        ) : filteredExtras.length === 0 ? (
          <p className="rounded-[1.25rem] border border-dashed border-order-line/70 bg-order-card/60 px-4 py-10 text-center font-sans text-sm text-order-muted">
            No extras yet.
          </p>
        ) : (
          filteredExtras.map((row) => (
            <MenuProductCard
              key={row.id}
              variant="db"
              id={row.id}
              name={row.name}
              price={row.price}
              available={row.available}
              onEdit={() => openEditExtra(row)}
              onToggleAvailable={refreshToggleExtra}
            />
          ))
        )}
      </div>

      <ItemEditorSheet
        key={`${editor.kind}-${editor.mode}-${editor.item?.id ?? "new"}-${sheetNonce}`}
        kind={editor.kind}
        open={editor.open}
        mode={editor.mode}
        item={editor.item}
        defaultCategory={editor.defaultCategory}
        onClose={() => setEditor((e) => ({ ...e, open: false }))}
        saveAction={saveAction}
        deleteAction={editor.mode === "edit" ? deleteAction : undefined}
      />
    </div>
  );
}
