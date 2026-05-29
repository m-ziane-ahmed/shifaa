"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { PRODUCTS } from "@/data/products";

const STORAGE_KEY = "shifaa-recent";
const MAX = 8;

export function trackProductView(productId: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const ids = raw ? (JSON.parse(raw) as string[]) : [];
    const next = [productId, ...ids.filter((id) => id !== productId)].slice(0, MAX);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function RecentlyViewed() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setIds(JSON.parse(raw) as string[]);
    } catch {
      /* ignore */
    }
  }, []);

  const products = ids
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter(Boolean)
    .slice(0, 4);

  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
      <h2 className="section-title">Récemment consultés</h2>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p!.id} product={p!} />
        ))}
      </div>
    </section>
  );
}

export function ProductViewTracker({ productId }: { productId: string }) {
  useEffect(() => {
    trackProductView(productId);
  }, [productId]);
  return null;
}
