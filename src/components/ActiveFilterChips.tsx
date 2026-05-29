"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { CATEGORY_LABELS } from "@/data/categories";
import { WILAYAS } from "@/data/wilayas";
import type { ProductCategory } from "@/lib/types";

const LABELS: Record<string, string> = {
  q: "Recherche",
  categorie: "Catégorie",
  marque: "Marque",
  "prix-max": "Prix max",
  wilaya: "Wilaya",
  peau: "Peau",
  format: "Format",
  age: "Âge",
  besoin: "Besoin",
  stock: "En stock",
  tri: "Tri",
};

export function ActiveFilterChips() {
  const router = useRouter();
  const params = useSearchParams();

  const entries = [...params.entries()].filter(
    ([key, val]) => val && !["page"].includes(key)
  );

  if (entries.length === 0) return null;

  function remove(key: string) {
    const next = new URLSearchParams(params.toString());
    next.delete(key);
    next.delete("page");
    router.push(`/boutique?${next.toString()}`);
  }

  function clearAll() {
    router.push("/boutique");
  }

  function displayValue(key: string, val: string) {
    if (key === "categorie") return CATEGORY_LABELS[val as ProductCategory] ?? val;
    if (key === "wilaya") return WILAYAS.find((w) => w.code === val)?.name ?? val;
    if (key === "stock") return "Oui";
    return val;
  }

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      {entries.map(([key, val]) => (
        <button
          key={key}
          type="button"
          onClick={() => remove(key)}
          className="inline-flex items-center gap-1 rounded-full border border-shifaa-border bg-white px-3 py-1 text-xs hover:border-shifaa-green"
        >
          <span className="text-shifaa-muted">{LABELS[key] ?? key} :</span>
          <span className="font-medium">{displayValue(key, val)}</span>
          <X className="h-3 w-3" />
        </button>
      ))}
      <button type="button" onClick={clearAll} className="text-xs font-medium text-shifaa-green hover:underline">
        Tout effacer
      </button>
    </div>
  );
}
