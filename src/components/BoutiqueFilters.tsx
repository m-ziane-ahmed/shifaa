"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { WILAYAS } from "@/data/wilayas";
import { CATEGORY_LABELS } from "@/data/categories";
import { AGE_GROUPS, BRAND_LIST, FORMAT_LIST, NEED_LIST, SKIN_TYPES } from "@/data/generate-products";
import type { ProductCategory } from "@/lib/types";

const SORT_OPTIONS = [
  { value: "popularite", label: "Popularité" },
  { value: "nouveaute", label: "Nouveauté" },
  { value: "prix-asc", label: "Prix croissant" },
  { value: "prix-desc", label: "Prix décroissant" },
  { value: "avis", label: "Meilleurs avis" },
];

export function BoutiqueFilters({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    router.push(`/boutique?${next.toString()}`);
    onNavigate?.();
  }

  return (
    <aside className="space-y-6">
      <div>
        <label htmlFor="sort" className="text-sm font-medium text-shifaa-ink">
          Trier par
        </label>
        <select
          id="sort"
          value={params.get("tri") ?? "popularite"}
          onChange={(e) => update("tri", e.target.value)}
          className="mt-2 w-full rounded-xl border border-shifaa-border bg-white px-3 py-2 text-sm"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <p className="text-sm font-medium text-shifaa-ink">Catégorie</p>
        <ul className="mt-2 space-y-1">
          <li>
            <button
              type="button"
              onClick={() => update("categorie", "")}
              className={`text-sm ${!params.get("categorie") ? "font-medium text-shifaa-green" : "text-shifaa-muted hover:text-shifaa-ink"}`}
            >
              Toutes
            </button>
          </li>
          {(Object.entries(CATEGORY_LABELS) as [ProductCategory, string][]).map(([slug, label]) => (
            <li key={slug}>
              <button
                type="button"
                onClick={() => update("categorie", slug)}
                className={`text-sm ${params.get("categorie") === slug ? "font-medium text-shifaa-green" : "text-shifaa-muted hover:text-shifaa-ink"}`}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-sm font-medium text-shifaa-ink">Marque</p>
        <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto">
          {BRAND_LIST.map((brand) => (
            <li key={brand}>
              <button
                type="button"
                onClick={() => update("marque", params.get("marque") === brand ? "" : brand)}
                className={`text-sm ${params.get("marque") === brand ? "font-medium text-shifaa-green" : "text-shifaa-muted hover:text-shifaa-ink"}`}
              >
                {brand}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <label htmlFor="prix-max" className="text-sm font-medium text-shifaa-ink">
          Prix max (DZD)
        </label>
        <input
          id="prix-max"
          type="number"
          placeholder="Ex. 5000"
          defaultValue={params.get("prix-max") ?? ""}
          onBlur={(e) => update("prix-max", e.target.value)}
          className="mt-2 w-full rounded-xl border border-shifaa-border px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label htmlFor="wilaya" className="text-sm font-medium text-shifaa-ink">
          Livraison (wilaya)
        </label>
        <select
          id="wilaya"
          value={params.get("wilaya") ?? ""}
          onChange={(e) => update("wilaya", e.target.value)}
          className="mt-2 w-full rounded-xl border border-shifaa-border bg-white px-3 py-2 text-sm"
        >
          <option value="">Toutes les wilayas</option>
          {WILAYAS.map((w) => (
            <option key={w.code} value={w.code}>
              {w.name}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={params.get("stock") === "1"}
          onChange={(e) => update("stock", e.target.checked ? "1" : "")}
          className="rounded border-shifaa-border text-shifaa-green focus:ring-shifaa-green"
        />
        En stock uniquement
      </label>

      <div>
        <p className="text-sm font-medium text-shifaa-ink">Type de peau</p>
        <ul className="mt-2 space-y-1">
          {SKIN_TYPES.map((skin) => (
            <li key={skin}>
              <button
                type="button"
                onClick={() => update("peau", params.get("peau") === skin ? "" : skin)}
                className={`text-sm capitalize ${params.get("peau") === skin ? "font-medium text-shifaa-green" : "text-shifaa-muted hover:text-shifaa-ink"}`}
              >
                {skin}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <label htmlFor="format" className="text-sm font-medium text-shifaa-ink">Format</label>
        <select
          id="format"
          value={params.get("format") ?? ""}
          onChange={(e) => update("format", e.target.value)}
          className="mt-2 w-full rounded-xl border border-shifaa-border bg-white px-3 py-2 text-sm"
        >
          <option value="">Tous les formats</option>
          {FORMAT_LIST.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="age" className="text-sm font-medium text-shifaa-ink">Âge</label>
        <select
          id="age"
          value={params.get("age") ?? ""}
          onChange={(e) => update("age", e.target.value)}
          className="mt-2 w-full rounded-xl border border-shifaa-border bg-white px-3 py-2 text-sm"
        >
          <option value="">Tous âges</option>
          {AGE_GROUPS.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="besoin" className="text-sm font-medium text-shifaa-ink">Besoin</label>
        <select
          id="besoin"
          value={params.get("besoin") ?? ""}
          onChange={(e) => update("besoin", e.target.value)}
          className="mt-2 w-full rounded-xl border border-shifaa-border bg-white px-3 py-2 text-sm"
        >
          <option value="">Tous les besoins</option>
          {NEED_LIST.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>
    </aside>
  );
}
