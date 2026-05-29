"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Product } from "@/lib/types";
import type { CartItem } from "@/lib/store-types";
import type { AppliedPromo } from "@/lib/cart-pricing";
import { validatePromoCode } from "@/lib/cart-pricing";

const STORAGE_KEY = "shifaa-cart";
const PROMO_KEY = "shifaa-promo";

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  promo: AppliedPromo | null;
  drawerOpen: boolean;
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  applyPromo: (code: string) => { ok: boolean; message: string };
  removePromo: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function toCartItem(product: Product, quantity: number): CartItem {
  return {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    price: product.price,
    quantity,
    image: product.image,
    category: product.category,
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [promo, setPromo] = useState<AppliedPromo | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
      const promoRaw = localStorage.getItem(PROMO_KEY);
      if (promoRaw) setPromo(JSON.parse(promoRaw) as AppliedPromo);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (promo) localStorage.setItem(PROMO_KEY, JSON.stringify(promo));
    else localStorage.removeItem(PROMO_KEY);
  }, [promo, hydrated]);

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.price * i.quantity, 0),
    [items]
  );

  useEffect(() => {
    if (!promo) return;
    const refreshed = validatePromoCode(promo.code, subtotal);
    if (refreshed) setPromo(refreshed);
    else setPromo(null);
  }, [subtotal, promo?.code]); // eslint-disable-line react-hooks/exhaustive-deps

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, toCartItem(product, quantity)];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) {
      setItems((prev) => prev.filter((i) => i.productId !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setPromo(null);
  }, []);

  const applyPromo = useCallback(
    (code: string) => {
      const applied = validatePromoCode(code, subtotal);
      if (!applied) return { ok: false, message: "Code invalide ou expiré." };
      setPromo(applied);
      return { ok: true, message: `Code appliqué : ${applied.label}` };
    },
    [subtotal]
  );

  const removePromo = useCallback(() => setPromo(null), []);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const count = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);

  const value = useMemo(
    () => ({
      items,
      count,
      subtotal,
      promo,
      drawerOpen,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      applyPromo,
      removePromo,
      openDrawer,
      closeDrawer,
    }),
    [
      items,
      count,
      subtotal,
      promo,
      drawerOpen,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      applyPromo,
      removePromo,
      openDrawer,
      closeDrawer,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
