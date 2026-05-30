"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";
import { ChevronDown, X, SlidersHorizontal, Star } from "lucide-react";
import { CATEGORY_LABELS, BESOINS } from "@/data/categories";
import { AGE_GROUPS, BRAND_LIST, FORMAT_LIST, SKIN_TYPES } from "@/data/generate-products";
import type { ProductCategory } from "@/lib/types";

const CATEGORY_COUNTS: Partial<Record<ProductCategory, number>> = {
  "visage-peau": 220, "corps-hygiene": 220, "bio-naturel": 250,
  cheveux: 180, complements: 180, "bien-etre": 180,
  "bebe-maternite": 150, dispositifs: 120,
};

const SORT_OPTIONS = [
  { value: "popularite", label: "Popularité" },
  { value: "recommandes", label: "Recommandés" },
  { value: "nouveaute", label: "Nouveautés" },
  { value: "promotions", label: "Promotions" },
  { value: "prix-asc", label: "Prix croissant" },
  { value: "prix-desc", label: "Prix décroissant" },
  { value: "avis", label: "Mieux notés" },
];

function FilterSection({ title, children, defaultOpen = true, activeCount = 0 }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean; activeCount?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-shifaa-border/50 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <button type="button" onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-sm font-medium text-shifaa-ink mb-2">
        <span className="flex items-center gap-2">
          {title}
          {activeCount > 0 && (
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-shifaa-green text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </span>
        <ChevronDown className={`h-4 w-4 text-shifaa-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="space-y-1">{children}</div>}
    </div>
  );
}

function FilterButton({ active, onClick, children, count }: {
  active: boolean; onClick: () => void; children: React.ReactNode; count?: number;
}) {
  return (
    <button type="button" onClick={onClick}
      className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-sm transition-colors text-left
        ${active ? "bg-shifaa-green/10 text-shifaa-green font-medium" : "text-shifaa-muted hover:bg-shifaa-cream hover:text-shifaa-ink"}`}
    >
      <span className="flex items-center gap-2">
        {active && <span className="h-1.5 w-1.5 rounded-full bg-shifaa-green shrink-0" />}
        {children}
      </span>
      {count !== undefined && <span className="text-xs text-shifaa-muted/70 tabular-nums">{count}</span>}
    </button>
  );
}

function ToggleChip({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-all
        ${active
          ? "border-shifaa-green bg-shifaa-green text-white"
          : "border-shifaa-border text-shifaa-muted hover:border-shifaa-green hover:text-shifaa-green"
        }`}
    >
      {children}
    </button>
  );
}

export function BoutiqueFilters({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const params = useSearchParams();

  const update = useCallback((key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    router.push(`/boutique?${next.toString()}`);
    onNavigate?.();
  }, [params, router, onNavigate]);

  const toggle = useCallback((key: string) => {
    const next = new URLSearchParams(params.toString());
    if (next.get(key)) next.delete(key);
    else next.set(key, "1");
    next.delete("page");
    router.push(`/boutique?${next.toString()}`);
    onNavigate?.();
  }, [params, router, onNavigate]);

  const activeFiltersCount = [
    "categorie","marque","prix-max","prix-min","stock","peau","format",
    "age","besoin","genre","note","bio","vegan","sans-parfum","sans-parabene",
    "certifie","promo","nouveau",
  ].filter((k) => params.get(k)).length;

  function clearAll() {
    const next = new URLSearchParams();
    const q = params.get("q");
    if (q) next.set("q", q);
    router.push(next.toString() ? `/boutique?${next.toString()}` : "/boutique");
    onNavigate?.();
  }

  const currentNote = Number(params.get("note") ?? 0);

  return (
    <aside className="space-y-0">
      {/* En-tête */}
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
          <button type="button" onClick={clearAll}
            className="flex items-center gap-1 text-xs text-shifaa-muted hover:text-red-500 transition-colors">
            <X className="h-3.5 w-3.5" /> Tout effacer
          </button>
        )}
      </div>

      {/* Tri */}
      <FilterSection title="Trier par" defaultOpen={true}>
        {SORT_OPTIONS.map((o) => (
          <FilterButton key={o.value}
            active={(params.get("tri") ?? "popularite") === o.value}
            onClick={() => update("tri", o.value)}>
            {o.label}
          </FilterButton>
        ))}
      </FilterSection>

      {/* Catégorie */}
      <FilterSection title="Catégorie" defaultOpen={true} activeCount={params.get("categorie") ? 1 : 0}>
        <FilterButton active={!params.get("categorie")} onClick={() => update("categorie", "")} count={1500}>
          Toutes
        </FilterButton>
        {(Object.entries(CATEGORY_LABELS) as [ProductCategory, string][]).map(([slug, label]) => (
          <FilterButton key={slug}
            active={params.get("categorie") === slug}
            onClick={() => update("categorie", params.get("categorie") === slug ? "" : slug)}
            count={CATEGORY_COUNTS[slug]}>
            {label}
          </FilterButton>
        ))}
      </FilterSection>

      {/* Navigation par besoin */}
      <FilterSection title="Mon besoin" defaultOpen={false} activeCount={params.get("besoin") ? 1 : 0}>
        <div className="flex flex-wrap gap-1.5">
          {BESOINS.map((b) => (
            <ToggleChip key={b.slug}
              active={params.get("besoin") === b.slug || params.get("q") === b.label}
              onClick={() => {
                const next = new URLSearchParams(params.toString());
                next.set("besoin", b.slug);
                next.delete("page");
                router.push(`/boutique?${next.toString()}`);
                onNavigate?.();
              }}>
              {b.icon} {b.label}
            </ToggleChip>
          ))}
        </div>
      </FilterSection>

      {/* Prix */}
      <FilterSection title="Prix (DZD)" activeCount={(params.get("prix-max") || params.get("prix-min")) ? 1 : 0}>
        <div className="space-y-1">
          {[
            { label: "Moins de 1 000 DZD", max: "1000" },
            { label: "1 000 – 2 000 DZD", min: "1000", max: "2000" },
            { label: "2 000 – 5 000 DZD", min: "2000", max: "5000" },
            { label: "Plus de 5 000 DZD", min: "5000" },
          ].map((range) => (
            <FilterButton key={`${range.min ?? ""}-${range.max ?? ""}`}
              active={params.get("prix-max") === (range.max ?? "") && params.get("prix-min") === (range.min ?? "")}
              onClick={() => {
                const next = new URLSearchParams(params.toString());
                if (range.max) next.set("prix-max", range.max); else next.delete("prix-max");
                if (range.min) next.set("prix-min", range.min); else next.delete("prix-min");
                next.delete("page");
                router.push(`/boutique?${next.toString()}`);
                onNavigate?.();
              }}>
              {range.label}
            </FilterButton>
          ))}
        </div>
      </FilterSection>

      {/* Note client */}
      <FilterSection title="Note client" activeCount={params.get("note") ? 1 : 0}>
        <div className="space-y-1">
          {[4, 3, 2].map((note) => (
            <FilterButton key={note}
              active={currentNote === note}
              onClick={() => update("note", currentNote === note ? "" : String(note))}>
              <span className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i < note ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                ))}
                <span className="ml-1 text-xs">& plus</span>
              </span>
            </FilterButton>
          ))}
        </div>
      </FilterSection>

      {/* Disponibilité & promotions */}
      <FilterSection title="Disponibilité" activeCount={(params.get("stock") || params.get("promo")) ? 1 : 0}>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm hover:bg-shifaa-cream transition-colors">
          <input type="checkbox" checked={params.get("stock") === "1"}
            onChange={() => toggle("stock")}
            className="h-4 w-4 rounded accent-shifaa-green" />
          <span className={params.get("stock") === "1" ? "text-shifaa-green font-medium" : "text-shifaa-muted"}>
            En stock uniquement
          </span>
        </label>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm hover:bg-shifaa-cream transition-colors">
          <input type="checkbox" checked={params.get("promo") === "1"}
            onChange={() => toggle("promo")}
            className="h-4 w-4 rounded accent-shifaa-green" />
          <span className={params.get("promo") === "1" ? "text-shifaa-green font-medium" : "text-shifaa-muted"}>
            En promotion
          </span>
        </label>
        <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm hover:bg-shifaa-cream transition-colors">
          <input type="checkbox" checked={params.get("nouveau") === "1"}
            onChange={() => toggle("nouveau")}
            className="h-4 w-4 rounded accent-shifaa-green" />
          <span className={params.get("nouveau") === "1" ? "text-shifaa-green font-medium" : "text-shifaa-muted"}>
            Nouveautés uniquement
          </span>
        </label>
      </FilterSection>

      {/* Filtres parapharmacie spécifiques */}
      <FilterSection title="Formule & certification" activeCount={
        [params.get("bio"), params.get("vegan"), params.get("sans-parfum"), params.get("sans-parabene"), params.get("certifie")]
          .filter(Boolean).length
      }>
        <div className="flex flex-wrap gap-1.5">
          {[
            { key: "bio", label: "🌿 Bio" },
            { key: "vegan", label: "🐰 Vegan" },
            { key: "sans-parfum", label: "🚫 Sans parfum" },
            { key: "sans-parabene", label: "✅ Sans parabène" },
            { key: "certifie", label: "🏆 Certifié" },
          ].map(({ key, label }) => (
            <ToggleChip key={key} active={!!params.get(key)} onClick={() => toggle(key)}>
              {label}
            </ToggleChip>
          ))}
        </div>
      </FilterSection>

      {/* Genre */}
      <FilterSection title="Genre" defaultOpen={false} activeCount={params.get("genre") ? 1 : 0}>
        {[
          { value: "femme", label: "Femme" },
          { value: "homme", label: "Homme" },
          { value: "mixte", label: "Mixte" },
          { value: "bebe", label: "Bébé" },
        ].map((g) => (
          <FilterButton key={g.value}
            active={params.get("genre") === g.value}
            onClick={() => update("genre", params.get("genre") === g.value ? "" : g.value)}>
            {g.label}
          </FilterButton>
        ))}
      </FilterSection>

      {/* Marque */}
      <FilterSection title="Marque" defaultOpen={false} activeCount={params.get("marque") ? 1 : 0}>
        <div className="max-h-44 overflow-y-auto space-y-0.5 pr-1">
          {BRAND_LIST.map((brand) => (
            <FilterButton key={brand}
              active={params.get("marque") === brand}
              onClick={() => update("marque", params.get("marque") === brand ? "" : brand)}>
              {brand}
            </FilterButton>
          ))}
        </div>
      </FilterSection>

      {/* Type de peau */}
      <FilterSection title="Type de peau" defaultOpen={false} activeCount={params.get("peau") ? 1 : 0}>
        {SKIN_TYPES.map((skin) => (
          <FilterButton key={skin}
            active={params.get("peau") === skin}
            onClick={() => update("peau", params.get("peau") === skin ? "" : skin)}>
            <span className="capitalize">{skin}</span>
          </FilterButton>
        ))}
      </FilterSection>

      {/* Format */}
      <FilterSection title="Format" defaultOpen={false} activeCount={params.get("format") ? 1 : 0}>
        <div className="flex flex-wrap gap-1.5">
          {FORMAT_LIST.map((f) => (
            <ToggleChip key={f} active={params.get("format") === f}
              onClick={() => update("format", params.get("format") === f ? "" : f)}>
              {f}
            </ToggleChip>
          ))}
        </div>
      </FilterSection>

      {/* Âge */}
      <FilterSection title="Âge" defaultOpen={false} activeCount={params.get("age") ? 1 : 0}>
        {AGE_GROUPS.map((a) => (
          <FilterButton key={a}
            active={params.get("age") === a}
            onClick={() => update("age", params.get("age") === a ? "" : a)}>
            {a}
          </FilterButton>
        ))}
      </FilterSection>
    </aside>
  );
}
