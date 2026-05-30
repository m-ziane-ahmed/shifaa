"use client";

import { Suspense } from "react";
import { useState } from "react";
import { SortBar } from "@/components/SortBar";
import { ProductCard } from "@/components/ProductCard";
import { CatalogPagination } from "@/components/CatalogPagination";
import { ActiveFilterChips } from "@/components/ActiveFilterChips";
import type { Product } from "@/lib/types";

export function BoutiqueClient({
  products,
  total,
  currentPage,
  totalPages,
  searchParams,
}: {
  products: Product[];
  total: number;
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const [view, setView] = useState<"grid" | "list">("grid");

  return (
    <>
      <Suspense fallback={null}>
        <ActiveFilterChips />
      </Suspense>
      <Suspense fallback={<div className="h-14 rounded-xl bg-white animate-pulse mb-6" />}>
        <SortBar
          total={total}
          currentPage={currentPage}
          totalPages={totalPages}
          view={view}
          onViewChange={setView}
        />
      </Suspense>
      {products.length === 0 ? (
        <div className="card-surface p-12 text-center">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-medium text-shifaa-ink mb-1">Aucun produit trouvé</p>
          <p className="text-sm text-shifaa-muted">Essayez d&apos;élargir vos critères de recherche</p>
        </div>
      ) : (
        <>
          <div className={
            view === "list"
              ? "flex flex-col gap-3"
              : "grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
          }>
            {products.map((p) => (
              <ProductCard key={p.id} product={p} view={view} />
            ))}
          </div>
          <CatalogPagination
            currentPage={currentPage}
            totalPages={totalPages}
            searchParams={searchParams}
          />
        </>
      )}
    </>
  );
}
