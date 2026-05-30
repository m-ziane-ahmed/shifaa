"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, List } from "lucide-react";

const SORT_OPTIONS = [
  { value: "popularite", label: "Popularité" },
  { value: "nouveaute", label: "Nouveautés" },
  { value: "prix-asc", label: "Prix ↑" },
  { value: "prix-desc", label: "Prix ↓" },
  { value: "avis", label: "Mieux notés" },
];

export function SortBar({
  total,
  currentPage,
  totalPages,
  onViewChange,
  view,
}: {
  total: number;
  currentPage: number;
  totalPages: number;
  onViewChange?: (v: "grid" | "list") => void;
  view?: "grid" | "list";
}) {
  const router = useRouter();
  const params = useSearchParams();
  const currentSort = params.get("tri") ?? "popularite";

  function setSort(value: string) {
    const next = new URLSearchParams(params.toString());
    next.set("tri", value);
    next.delete("page");
    router.push(`/boutique?${next.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6 rounded-xl border border-shifaa-border bg-white px-4 py-3">
      {/* Info résultats */}
      <p className="text-sm text-shifaa-muted shrink-0">
        <span className="font-medium text-shifaa-ink">{total}</span> produit{total !== 1 ? "s" : ""}
        {totalPages > 1 && (
          <span className="text-shifaa-muted/70"> · page {currentPage}/{totalPages}</span>
        )}
      </p>

      <div className="flex items-center gap-3 flex-wrap">
        {/* Tri */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-shifaa-muted whitespace-nowrap">Trier :</span>
          <div className="flex gap-1 flex-wrap">
            {SORT_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setSort(o.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap
                  ${currentSort === o.value
                    ? "bg-shifaa-green text-white"
                    : "border border-shifaa-border text-shifaa-muted hover:border-shifaa-green hover:text-shifaa-green"
                  }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Toggle vue grille/liste */}
        {onViewChange && (
          <div className="flex items-center gap-1 border border-shifaa-border rounded-lg p-0.5 shrink-0">
            <button
              type="button"
              onClick={() => onViewChange("grid")}
              className={`p-1.5 rounded-md transition-colors ${view === "grid" ? "bg-shifaa-green text-white" : "text-shifaa-muted hover:text-shifaa-green"}`}
              aria-label="Vue grille"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewChange("list")}
              className={`p-1.5 rounded-md transition-colors ${view === "list" ? "bg-shifaa-green text-white" : "text-shifaa-muted hover:text-shifaa-green"}`}
              aria-label="Vue liste"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
