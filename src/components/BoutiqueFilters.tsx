"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";
import { ChevronDown, X, SlidersHorizontal } from "lucide-react";
import { CATEGORY_LABELS } from "@/data/categories";
import { AGE_GROUPS, BRAND_LIST, FORMAT_LIST, NEED_LIST, SKIN_TYPES } from "@/data/generate-products";
import type { ProductCategory } from "@/lib/types";

// Compteurs de produits par catégorie (statiques pour l'instant)
const CATEGORY_COUNTS: Partial<Record<ProductCategory, number>> = {
  "visage-peau": 220,
  "corps-hygiene": 220,
  "bio-naturel": 250,
  cheveux: 180,
  complements: 180,
  "bien-etre": 180,
  "bebe-maternite": 150,
  dispositifs: 120,
};

function FilterSection({
  title,
  children,
  defaultOpen = true,
  activeCount = 0,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  activeCount?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-shifaa-border/50 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-sm font-medium text-shifaa-ink mb-2 group"
      >
        <span className="flex items-center gap-2">
          {title}
          {activeCount > 0 && (
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-shifaa-green text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-shifaa-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="space-y-1">{children}</div>}
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-sm transition-colors text-left
        ${active
          ? "bg-shifaa-green/10 text-shifaa-green font-medium"
          : "text-shifaa-muted hover:bg-shifaa-cream hover:text-shifaa-ink"
        }`}
    >
      <span className="flex items-center gap-2">
        {active && <span className="h-1.5 w-1.5 rounded-full bg-shifaa-green shrink-0" />}
        {children}
      </span>
      {count !== undefined && (
        <span className="text-xs text-shifaa-muted/70 tabular-nums">{count}</span>
      )}
    </button>
  );
}

export function BoutiqueFilters({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const params = useSearchParams();

  const update = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      next.delete("page");
      router.push(`/boutique?${next.toString()}`);
      onNavigate?.();
    },
    [params, router, onNavigate]
  );

  const activeFiltersCount = [
    "categorie", "marque", "prix-max", "stock", "peau", "format", "age", "besoin",
  ].filter((k) => params.get(k)).length;

  function clearAll() {
    const next = new URLSearchParams();
    const q = params.get("q");
    if (q) next.set("q", q);
    router.push(next.toString() ? `/boutique?${next.toString()}` : "/boutique");
    onNavigate?.();
  }

  return (
    <aside className="space-y-0">
      {/* En-tête filtres */}
      <div className="flex items-center justify-between mb-4">
        <span className="flex items-center gap-2 text-sm font-semibold text-shifaa-ink">
          <SlidersHorizontal className="h-4 w-4 text-shifaa-green" />
          Filtres
          {activeFiltersCount > 0 && (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-shifaa-green text-[11px] font-bold text-white">
              {activeFiltersCount}
            </span>
          )}
        </span>
        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-shifaa-muted hover:text-red-500 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            Tout effacer
          </button>
        )}
      </div>

      {/* Tri */}
      <FilterSection title="Trier par" defaultOpen={true}>
        {[
          { value: "popularite", label: "Popularité" },
          { value: "nouveaute", label: "Nouveautés" },
          { value: "prix-asc", label: "Prix croissant" },
          { value: "prix-desc", label: "Prix décroissant" },
          { value: "avis", label: "Meilleurs avis" },
        ].map((o) => (
          <FilterButton
            key={o.value}
            active={(params.get("tri") ?? "popularite") === o.value}
            onClick={() => update("tri", o.value)}
          >
            {o.label}
          </FilterButton>
        ))}
      </FilterSection>

      {/* Catégorie */}
      <FilterSection
        title="Catégorie"
        defaultOpen={true}
        activeCount={params.get("categorie") ? 1 : 0}
      >
        <FilterButton
          active={!params.get("categorie")}
          onClick={() => update("categorie", "")}
          count={1500}
        >
          Toutes
        </FilterButton>
        {(Object.entries(CATEGORY_LABELS) as [ProductCategory, string][]).map(([slug, label]) => (
          <FilterButton
            key={slug}
            active={params.get("categorie") === slug}
            onClick={() => update("categorie", params.get("categorie") === slug ? "" : slug)}
            count={CATEGORY_COUNTS[slug]}
          >
            {label}
          </FilterButton>
        ))}
      </FilterSection>

      {/* Prix */}
      <FilterSection title="Prix max (DZD)" activeCount={params.get("prix-max") ? 1 : 0}>
        <div className="px-2">
          {[1000, 2000, 3000, 5000, 10000].map((p) => (
            <FilterButton
              key={p}
              active={params.get("prix-max") === String(p)}
              onClick={() => update("prix-max", params.get("prix-max") === String(p) ? "" : String(p))}
            >
              Moins de {p.toLocaleString("fr-DZ")} DZD
            </FilterButton>
          ))}
          <div className="mt-2">
            <input
              type="number"
              placeholder="Montant personnalisé"
              defaultValue={params.get("prix-max") ?? ""}
              onBlur={(e) => update("prix-max", e.target.value)}
              className="w-full rounded-lg border border-shifaa-border px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-shifaa-green/30"
            />
          </div>
        </div>
      </FilterSection>

      {/* Disponibilité */}
      <FilterSection title="Disponibilité" activeCount={params.get("stock") ? 1 : 0}>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm hover:bg-shifaa-cream transition-colors">
          <input
            type="checkbox"
            checked={params.get("stock") === "1"}
            onChange={(e) => update("stock", e.target.checked ? "1" : "")}
            className="h-4 w-4 rounded border-shifaa-border accent-shifaa-green"
          />
          <span className={params.get("stock") === "1" ? "text-shifaa-green font-medium" : "text-shifaa-muted"}>
            En stock uniquement
          </span>
        </label>
      </FilterSection>

      {/* Marque */}
      <FilterSection title="Marque" defaultOpen={false} activeCount={params.get("marque") ? 1 : 0}>
        <div className="max-h-44 overflow-y-auto space-y-0.5 pr-1 scrollbar-thin">
          {BRAND_LIST.map((brand) => (
            <FilterButton
              key={brand}
              active={params.get("marque") === brand}
              onClick={() => update("marque", params.get("marque") === brand ? "" : brand)}
            >
              {brand}
            </FilterButton>
          ))}
        </div>
      </FilterSection>

      {/* Type de peau */}
      <FilterSection title="Type de peau" defaultOpen={false} activeCount={params.get("peau") ? 1 : 0}>
        {SKIN_TYPES.map((skin) => (
          <FilterButton
            key={skin}
            active={params.get("peau") === skin}
            onClick={() => update("peau", params.get("peau") === skin ? "" : skin)}
          >
            <span className="capitalize">{skin}</span>
          </FilterButton>
        ))}
      </FilterSection>

      {/* Besoin */}
      <FilterSection title="Besoin" defaultOpen={false} activeCount={params.get("besoin") ? 1 : 0}>
        {NEED_LIST.map((n) => (
          <FilterButton
            key={n}
            active={params.get("besoin") === n}
            onClick={() => update("besoin", params.get("besoin") === n ? "" : n)}
          >
            <span className="capitalize">{n}</span>
          </FilterButton>
        ))}
      </FilterSection>

      {/* Format */}
      <FilterSection title="Format" defaultOpen={false} activeCount={params.get("format") ? 1 : 0}>
        <div className="flex flex-wrap gap-1.5">
          {FORMAT_LIST.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => update("format", params.get("format") === f ? "" : f)}
              className={`rounded-full border px-2.5 py-1 text-xs transition-colors
                ${params.get("format") === f
                  ? "border-shifaa-green bg-shifaa-green/10 text-shifaa-green font-medium"
                  : "border-shifaa-border text-shifaa-muted hover:border-shifaa-green"
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Âge */}
      <FilterSection title="Âge" defaultOpen={false} activeCount={params.get("age") ? 1 : 0}>
        {AGE_GROUPS.map((a) => (
          <FilterButton
            key={a}
            active={params.get("age") === a}
            onClick={() => update("age", params.get("age") === a ? "" : a)}
          >
            {a}
          </FilterButton>
        ))}
      </FilterSection>
    </aside>
  );
}
