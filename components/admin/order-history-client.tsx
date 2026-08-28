"use client";

import { Search } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import type { AdminOrderListItem } from "@/lib/admin/admin-order-types";
import { fetchOrderHistoryPage } from "@/app/admin/history/actions";
import { CompletedOrderCard } from "@/components/admin/completed-order-card";
import type { OrderHistoryQuery, OrderHistoryStatusFilter } from "@/lib/data/orders-admin";

const STATUS_TABS: { value: OrderHistoryStatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "rejected", label: "Rejected" },
];

function StatusTab({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-2.5 py-1.5 pr-3.5 font-sans text-[10px] font-semibold uppercase tracking-[0.14em] transition sm:px-3 sm:py-1.5 sm:pr-4 sm:text-[11px] ${
        active
          ? "bg-order-brownBtn text-white shadow-order-btn ring-1 ring-order-brownBtn/20"
          : "border border-order-line/90 bg-order-card text-order-taupe hover:bg-order-bg hover:text-order-brownInk"
      }`}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

export function OrderHistoryClient({
  initialOrders,
  initialHasMore,
  renderedAtMs,
}: {
  initialOrders: AdminOrderListItem[];
  initialHasMore: boolean;
  renderedAtMs: number;
}) {
  const [status, setStatus] = useState<OrderHistoryStatusFilter>("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [orders, setOrders] = useState(initialOrders);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isPending, startTransition] = useTransition();
  const requestId = useRef(0);
  const skipNextFetch = useRef(true);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    if (skipNextFetch.current) {
      skipNextFetch.current = false;
      return;
    }
    const id = ++requestId.current;
    const query: OrderHistoryQuery = {
      status,
      search,
      dateFrom: dateFrom || null,
      dateTo: dateTo || null,
    };
    startTransition(async () => {
      const res = await fetchOrderHistoryPage(query, 0);
      if (id !== requestId.current) return;
      setOrders(res.orders);
      setHasMore(res.hasMore);
    });
  }, [status, search, dateFrom, dateTo]);

  function loadMore() {
    const id = requestId.current;
    const query: OrderHistoryQuery = {
      status,
      search,
      dateFrom: dateFrom || null,
      dateTo: dateTo || null,
    };
    startTransition(async () => {
      const res = await fetchOrderHistoryPage(query, orders.length);
      if (id !== requestId.current) return;
      setOrders((prev) => [...prev, ...res.orders]);
      setHasMore(res.hasMore);
    });
  }

  const hasFilters = status !== "all" || search || dateFrom || dateTo;

  return (
    <div className="space-y-5 pt-5 sm:pt-8">
      <h1 className="font-serif text-3xl font-semibold italic tracking-tight text-order-brownInk sm:text-[2rem]">
        Order history
      </h1>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-order-muted"
          aria-hidden
        />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search name, phone, or reference"
          className="w-full rounded-full border border-order-line/90 bg-order-card py-2.5 pl-10 pr-4 font-sans text-sm text-order-brownInk outline-none transition placeholder:text-order-muted/70 focus:border-order-brownBtn/40 focus:ring-1 focus:ring-order-brownBtn/25"
        />
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-2">
        {STATUS_TABS.map((tab) => (
          <StatusTab
            key={tab.value}
            active={status === tab.value}
            label={tab.label}
            onClick={() => setStatus(tab.value)}
          />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1.5 font-sans text-xs text-order-taupe">
          From
          <input
            type="date"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-lg border border-order-line/90 bg-order-card px-2 py-1.5 font-sans text-xs text-order-brownInk outline-none transition focus:border-order-brownBtn/40 focus:ring-1 focus:ring-order-brownBtn/25"
          />
        </label>
        <label className="flex items-center gap-1.5 font-sans text-xs text-order-taupe">
          To
          <input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-lg border border-order-line/90 bg-order-card px-2 py-1.5 font-sans text-xs text-order-brownInk outline-none transition focus:border-order-brownBtn/40 focus:ring-1 focus:ring-order-brownBtn/25"
          />
        </label>
        {hasFilters ? (
          <button
            type="button"
            onClick={() => {
              setStatus("all");
              setSearchInput("");
              setSearch("");
              setDateFrom("");
              setDateTo("");
            }}
            className="font-sans text-xs font-semibold text-order-brownBtn underline-offset-2 hover:underline"
          >
            Clear filters
          </button>
        ) : null}
      </div>

      {orders.length === 0 && !isPending ? (
        <p className="rounded-[1.25rem] border border-dashed border-order-line/70 bg-order-card/60 px-4 py-8 text-center font-sans text-sm text-order-muted">
          No orders match{hasFilters ? " these filters" : ""}.
        </p>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <CompletedOrderCard
              key={order.id}
              order={order}
              renderedAtMs={renderedAtMs}
            />
          ))}
        </ul>
      )}

      {hasMore ? (
        <button
          type="button"
          onClick={loadMore}
          disabled={isPending}
          className="w-full rounded-full border border-order-line/90 bg-order-card py-3 font-sans text-sm font-semibold text-order-brownInk shadow-sm transition hover:bg-order-bg disabled:opacity-50"
        >
          {isPending ? "Loading…" : "Load more"}
        </button>
      ) : null}
    </div>
  );
}
