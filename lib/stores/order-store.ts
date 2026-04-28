"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { pruneVisibleActiveOrders } from "@/lib/order/active-order";
import type { PancakeLine } from "@/lib/order/pancake-types";
import type { StackId } from "@/lib/order/stacks";
import type { TrackedOrder } from "@/lib/order/tracked-order";

export type { TrackedOrder, TrackedOrderStatus } from "@/lib/order/tracked-order";
export type { PancakeLine } from "@/lib/order/pancake-types";

function newLineId() {
  return globalThis.crypto?.randomUUID?.() ?? `line-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

type OrderState = {
  pancakeLines: PancakeLine[];
  /** Line being edited in stack / customize / builds */
  editingLineId: string | null;
  drinkQuantities: Record<string, number>;
  note: string;
  /** Delivery address; collected at checkout (delivery-only). */
  deliveryAddress: string;
  /** Buyer phone; collected at checkout. */
  buyerPhone: string;
  activeOrders: TrackedOrder[];
  trackSelectedRef: string | null;

  setEditingLineId: (id: string | null) => void;
  addPancakeLine: (stackId: StackId) => void;
  updateLineStack: (lineId: string, stackId: StackId) => void;
  toggleLineAddOn: (addOnId: string) => void;
  setLineRandomBliss: (on: boolean) => void;
  removePancakeLine: (lineId: string) => void;
  setDrinkQuantity: (drinkId: string, qty: number) => void;
  setNote: (note: string) => void;
  setDeliveryAddress: (address: string) => void;
  setBuyerPhone: (phone: string) => void;
  addActiveOrder: (order: TrackedOrder) => void;
  markTransferSent: (reference: string) => void;
  setTrackSelectedRef: (ref: string | null) => void;
  pruneStaleActiveOrders: () => void;
  resetOrder: () => void;
};

const emptyCart = {
  pancakeLines: [] as PancakeLine[],
  editingLineId: null as string | null,
  drinkQuantities: {} as Record<string, number>,
  note: "",
  deliveryAddress: "",
  buyerPhone: "",
};

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      ...emptyCart,
      activeOrders: [] as TrackedOrder[],
      trackSelectedRef: null as string | null,

      setEditingLineId: (id) => set({ editingLineId: id }),

      addPancakeLine: (stackId) =>
        set((s) => {
          const id = newLineId();
          return {
            pancakeLines: [
              ...s.pancakeLines,
              { id, stackId, addOnIds: [], randomBliss: false },
            ],
            editingLineId: id,
          };
        }),

      updateLineStack: (lineId, stackId) =>
        set((s) => ({
          pancakeLines: s.pancakeLines.map((line) =>
            line.id === lineId ? { ...line, stackId } : line,
          ),
        })),

      toggleLineAddOn: (addOnId) =>
        set((s) => {
          const lid = s.editingLineId;
          if (!lid) return s;
          return {
            pancakeLines: s.pancakeLines.map((line) => {
              if (line.id !== lid) return line;
              if (line.randomBliss) {
                return {
                  ...line,
                  randomBliss: false,
                  addOnIds: line.addOnIds.includes(addOnId)
                    ? line.addOnIds
                    : [...line.addOnIds, addOnId],
                };
              }
              const has = line.addOnIds.includes(addOnId);
              return {
                ...line,
                addOnIds: has
                  ? line.addOnIds.filter((x) => x !== addOnId)
                  : [...line.addOnIds, addOnId],
              };
            }),
          };
        }),

      setLineRandomBliss: (on) =>
        set((s) => {
          const lid = s.editingLineId;
          if (!lid) return s;
          return {
            pancakeLines: s.pancakeLines.map((line) =>
              line.id === lid
                ? { ...line, randomBliss: on, addOnIds: on ? [] : line.addOnIds }
                : line,
            ),
          };
        }),

      removePancakeLine: (lineId) =>
        set((s) => ({
          pancakeLines: s.pancakeLines.filter((l) => l.id !== lineId),
          editingLineId: s.editingLineId === lineId ? null : s.editingLineId,
        })),

      setDrinkQuantity: (drinkId, qty) =>
        set((s) => {
          const q = Math.max(0, Math.min(99, Math.floor(qty)));
          const next = { ...s.drinkQuantities };
          if (q === 0) delete next[drinkId];
          else next[drinkId] = q;
          return { drinkQuantities: next };
        }),

      setNote: (note) => set({ note: note.slice(0, 200) }),

      setDeliveryAddress: (address) =>
        set({ deliveryAddress: address.slice(0, 500) }),

      setBuyerPhone: (phone) => set({ buyerPhone: phone.slice(0, 28) }),

      addActiveOrder: (order) =>
        set((s) => {
          const merged = [
            order,
            ...s.activeOrders.filter((o) => o.reference !== order.reference),
          ];
          const activeOrders = pruneVisibleActiveOrders(merged);
          return {
            activeOrders,
            trackSelectedRef: order.reference,
          };
        }),

      markTransferSent: (reference) =>
        set((s) => {
          const at = new Date().toISOString();
          const activeOrders = s.activeOrders.map((o) =>
            o.reference === reference ? { ...o, transferReportedAt: at } : o,
          );
          return { activeOrders };
        }),

      setTrackSelectedRef: (ref) => set({ trackSelectedRef: ref }),

      pruneStaleActiveOrders: () =>
        set((s) => {
          const activeOrders = pruneVisibleActiveOrders(s.activeOrders);
          const sel = s.trackSelectedRef;
          const still =
            sel != null && activeOrders.some((o) => o.reference === sel);
          return {
            activeOrders,
            trackSelectedRef: still
              ? sel
              : (activeOrders[0]?.reference ?? null),
          };
        }),

      resetOrder: () =>
        set({
          ...emptyCart,
        }),
    }),
    {
      name: "batter-bliss-order-v5",
      partialize: (s) => ({
        pancakeLines: s.pancakeLines,
        editingLineId: s.editingLineId,
        drinkQuantities: s.drinkQuantities,
        note: s.note,
        deliveryAddress: s.deliveryAddress,
        buyerPhone: s.buyerPhone,
        activeOrders: s.activeOrders,
        trackSelectedRef: s.trackSelectedRef,
      }),
    },
  ),
);
