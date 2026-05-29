"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, TrendingUp } from "lucide-react";
import { formatDZD } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/data/categories";
import type { ProductCategory } from "@/lib/types";

type SearchResult = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  rating: number;
  inStock: boolean;
};

type Props = {
  variant?: "header" | "mobile";
  onSelect?: () => void;
};

const POPULAR_SEARCHES = [
  "Vitamine C", "Crème hydratante", "Shampoing", "Magnésium", "Gel douche bio",
];

function highlight(text: string, query: string): React.ReactNode {
  if (!query || query.length < 2) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-shifaa-lime/50 text-shifaa-ink rounded px-0.5 not-italic">
        {part}
      </mark>
    ) : part
  );
}

export function SearchAutocomplete({ variant = "header", onSelect }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fermer en cliquant dehors
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Recherche avec debounce 300ms
  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&mode=suggest`);
      const data = await res.json();
      setResults(data.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchSuggestions]);

  function goToSearch(q: string) {
    router.push(`/boutique?q=${encodeURIComponent(q)}`);
    setOpen(false);
    setQuery("");
    onSelect?.();
  }

  function clear() {
    setQuery("");
    setResults([]);
    setOpen(false);
    inputRef.current?.focus();
  }

  const showDropdown = open && (query.length >= 2 || query.length === 0);
  const showPopular = query.length === 0;

  const inputClass =
    "w-full rounded-full border border-white/20 bg-white/10 py-2.5 pl-11 pr-10 text-sm text-white placeholder:text-white/50 focus:border-shifaa-lime focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-shifaa-lime/50";

  return (
    <div ref={ref} className="relative w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim()) goToSearch(query.trim());
        }}
        className="relative"
        role="search"
      >
        <Search
          className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60"
          aria-hidden
        />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Rechercher parmi 1500+ références…"
          className={inputClass}
          autoComplete="off"
          aria-label="Recherche de produits"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
        />
        {query && (
          <button
            type="button"
            onClick={clear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
            aria-label="Effacer la recherche"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-shifaa-border bg-white shadow-lift">

          {/* Recherches populaires (quand champ vide) */}
          {showPopular && (
            <div className="p-3">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-shifaa-muted">
                <TrendingUp className="h-3.5 w-3.5" aria-hidden />
                Recherches populaires
              </p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => goToSearch(term)}
                    className="rounded-full border border-shifaa-border px-3 py-1 text-xs text-shifaa-ink hover:border-shifaa-green hover:text-shifaa-green transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Spinner */}
          {loading && query.length >= 2 && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-shifaa-muted">
              <Loader2 className="h-4 w-4 animate-spin" />
              Recherche en cours…
            </div>
          )}

          {/* Résultats */}
          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="px-4 py-4 text-center">
              <p className="text-sm text-shifaa-muted">Aucun résultat pour « {query} »</p>
              <p className="mt-1 text-xs text-shifaa-muted">Essayez un autre mot-clé</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <ul role="listbox" aria-label="Suggestions de produits">
              {results.map((p) => (
                <li key={p.id} role="option">
                  <Link
                    href={`/produit/${p.slug}`}
                    onClick={() => {
                      setOpen(false);
                      setQuery("");
                      onSelect?.();
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-shifaa-cream transition-colors"
                  >
                    {/* Image */}
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-shifaa-cream">
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    {/* Infos */}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-shifaa-muted">
                        {p.brand} ·{" "}
                        <span className="text-shifaa-green">
                          {CATEGORY_LABELS[p.category as ProductCategory] ?? p.category}
                        </span>
                      </p>
                      <p className="truncate text-sm text-shifaa-ink">
                        {highlight(p.name, query)}
                      </p>
                    </div>
                    {/* Prix */}
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-medium text-shifaa-ink">{formatDZD(p.price)}</p>
                      {!p.inStock && (
                        <p className="text-xs text-amber-600">Rupture</p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {/* Voir tous les résultats */}
          {query.length >= 2 && (
            <button
              type="button"
              onClick={() => goToSearch(query)}
              className="flex w-full items-center justify-between border-t border-shifaa-border px-4 py-2.5 text-left text-sm font-medium text-shifaa-green hover:bg-shifaa-cream transition-colors"
            >
              <span>Voir tous les résultats pour « {query} »</span>
              <Search className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
