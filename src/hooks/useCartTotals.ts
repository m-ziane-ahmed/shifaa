"use client";

import { useMemo } from "react";
import { useCart } from "@/context/CartContext";
import { calcCartTotals } from "@/lib/cart-pricing";

export function useCartTotals() {
  const { subtotal, promo } = useCart();
  return useMemo(() => calcCartTotals(subtotal, promo), [subtotal, promo]);
}
