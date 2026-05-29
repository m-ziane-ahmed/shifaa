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
import { PRODUCTS } from "@/data/products";

const STORAGE_KEY = "shifaa-compare";
const MAX = 4;

type CompareContextValue = {
  ids: string[];
  count: number;
  products: Product[];
  add: (productId: string) => boolean;
  remove: (productId: string) => void;
  clear: () => void;
  isInCompare: (productId: string) => boolean;
};

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setIds(JSON.parse(raw) as string[]);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }, [ids, hydrated]);

  const add = useCallback((productId: string) => {
    let added = false;
    setIds((prev) => {
      if (prev.includes(productId)) return prev;
      if (prev.length >= MAX) return prev;
      added = true;
      return [...prev, productId];
    });
    return added;
  }, []);

  const remove = useCallback((productId: string) => {
    setIds((prev) => prev.filter((id) => id !== productId));
  }, []);

  const clear = useCallback(() => setIds([]), []);

  const isInCompare = useCallback((productId: string) => ids.includes(productId), [ids]);

  const products = useMemo(
    () => ids.map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean) as Product[],
    [ids]
  );

  const value = useMemo(
    () => ({ ids, count: ids.length, products, add, remove, clear, isInCompare }),
    [ids, products, add, remove, clear, isInCompare]
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}

export const COMPARE_MAX = MAX;
