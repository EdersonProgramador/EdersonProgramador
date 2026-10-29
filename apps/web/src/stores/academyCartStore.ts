import { ACADEMY_DEMO_COUPONS } from "@ederson-agencia/shared";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AcademyStoreCourseCardData } from "../components/academy/AcademyStoreCourseCard";

type CartState = {
  items: AcademyStoreCourseCardData[];
  couponCode: string | null;
  addItem: (item: AcademyStoreCourseCardData) => void;
  removeItem: (slug: string) => void;
  clear: () => void;
  setCoupon: (code: string | null) => void;
  hasSlug: (slug: string) => boolean;
};

export function cartSubtotalCents(items: AcademyStoreCourseCardData[]): number {
  return items.reduce((sum, i) => sum + i.priceCents, 0);
}

export function cartDiscountCents(subtotalCents: number, couponCode: string | null): number {
  if (!couponCode) return 0;
  const rule = ACADEMY_DEMO_COUPONS[couponCode.toUpperCase()];
  if (!rule) return 0;
  return Math.round((subtotalCents * rule.percentOff) / 100);
}

export function cartTotalCents(items: AcademyStoreCourseCardData[], couponCode: string | null): number {
  const sub = cartSubtotalCents(items);
  return Math.max(0, sub - cartDiscountCents(sub, couponCode));
}

export const useAcademyCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,
      addItem: (item) => {
        if (get().hasSlug(item.slug)) return;
        set((s) => ({ items: [...s.items, item] }));
      },
      removeItem: (slug) => set((s) => ({ items: s.items.filter((i) => i.slug !== slug) })),
      clear: () => set({ items: [], couponCode: null }),
      setCoupon: (couponCode) => set({ couponCode }),
      hasSlug: (slug) => get().items.some((i) => i.slug === slug)
    }),
    { name: "ea_academy_cart_v1" }
  )
);
