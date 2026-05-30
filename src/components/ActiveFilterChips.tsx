"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { X, SlidersHorizontal } from "lucide-react";
import { CATEGORY_LABELS } from "@/data/categories";
import { WILAYAS } from "@/data/wilayas";
import type { ProductCategory } from "@/lib/types";

const FILTER_CONFIG: Record<string, { label: string; color: string }> = {
  q:          { label: "Recherche", color: "bg-blue-50 border-blue-200 text-blue-700" },
  categorie:  { label: "Catégorie", color: "bg-shifaa-lime/20 border-shifaa-lime text-shifaa-ink" },
  marque:     { label: "Marque",    color: "bg-purple-50 border-purple-200 text-purple-700" },
  "prix-max": { label: "Prix max",  color: "bg-amber-50 border-amber-200 text-amber-700" },
  stock:      { label: "En stock",  color: "bg-green-50 border-green-200 text-green-700" },
  peau:       { label: "Peau",      color: "bg-pink-50 border-pink-200 text-pink-700" },
  format:     { label: "Format",    color: "bg-gray-50 border-gray-200 text-gray-700" },
  age:        { label: "Âge",       color: "bg-orange-50 border-orange-200 text-orange-700" },
  besoin:     { label: "Besoin",    color: "bg-teal-50 border-teal-200 text-teal-700" },
  tri:        { label: "Tri",       color: "bg-indigo-50 border-indigo-200 text-indigo-700" },
};

// Filtres qu'on n'affiche pas en chip
const HIDDEN = new Set(["page", "tri"]);

export function ActiveFilterChips() {
  const router = useRouter();
  const params = useSearchParams();

  const entries = [...params.entries()].filter(
    ([key, val]) => val && !HIDDEN.has(key)
  );

  if (entries.length === 0) return null;

  function remove(key: string) {
    const next = new URLSearchParams(params.toString());
    next.delete(key);
    next.delete("page");
    const q = next.toString();
    router.push(q ? `/boutique?${q}` : "/boutique");
  }

  function clearAll() {
    router.push("/boutique");
  }

  function displayValue(key: string, val: string) {
    if (key === "categorie") return CATEGORY_LABELS[val as ProductCategory] ?? val;
    if (key === "wilaya") return WILAYAS.find((w) => w.code === val)?.name ?? val;
    if (key === "stock") return "En stock uniquement";
    if (key === "prix-max") return `≤ ${Number(val).toLocaleString("fr-DZ")} DZD`;
    return val;
  }

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      <span className="flex items-center gap-1 text-xs text-shifaa-muted shrink-0">
        <SlidersHorizontal className="h-3.5 w-3.5" />
        {entries.length} filtre{entries.length > 1 ? "s" : ""} actif{entries.length > 1 ? "s" : ""} :
      </span>

      {entries.map(([key, val]) => {
        const config = FILTER_CONFIG[key];
        const color = config?.color ?? "bg-white border-shifaa-border text-shifaa-muted";
        return (
          <button
            key={key}
            type="button"
            onClick={() => remove(key)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-opacity hover:opacity-75 ${color}`}
          >
            <span className="opacity-70">{config?.label ?? key} :</span>
            <span>{displayValue(key, val)}</span>
            <X className="h-3 w-3 shrink-0" />
          </button>
        );
      })}

      <button
        type="button"
        onClick={clearAll}
        className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-700 hover:underline transition-colors"
      >
        <X className="h-3.5 w-3.5" />
        Tout effacer
      </button>
    </div>
  );
}
