"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search, X, Loader2, TrendingUp, Clock,
  Camera, Sparkles, ArrowRight, AlertCircle,
} from "lucide-react";
import { formatDZD } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/data/categories";
import type { ProductCategory } from "@/lib/types";

// ── Types ────────────────────────────────────────────────────
type SearchResult = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  image: string;
  rating: number;
  inStock: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
};

type Props = { onSelect?: () => void };

// ── Constantes ───────────────────────────────────────────────
const POPULAR_SEARCHES = [
  "Vitamine C", "Crème hydratante", "Shampoing", "Magnésium", "Gel douche bio", "Bébé",
];

const SESSION_ID = typeof window !== "undefined"
  ? (sessionStorage.getItem("sid") ?? (() => {
      const id = Math.random().toString(36).slice(2);
      sessionStorage.setItem("sid", id);
      return id;
    })())
  : "";

const HISTORY_KEY = "shifaa_search_history";

function getHistory(): string[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]");
  } catch { return []; }
}

function addToHistory(term: string) {
  try {
    const history = getHistory().filter((h) => h !== term);
    localStorage.setItem(HISTORY_KEY, JSON.stringify([term, ...history].slice(0, 5)));
  } catch {}
}

// ── Highlight ─────────────────────────────────────────────────
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query || query.length < 2) return <>{text}</>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-shifaa-lime/50 text-shifaa-ink rounded px-0.5 not-italic font-medium">
            {part}
          </mark>
        ) : part
      )}
    </>
  );
}

// ── Composant principal ───────────────────────────────────────
export function SearchAutocomplete({ onSelect }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [correction, setCorrection] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [history, setHistory] = useState<string[]>([]);
  const [imageLoading, setImageLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Charger historique
  useEffect(() => {
    setHistory(getHistory());
  }, []);

  // Fermer clic dehors
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setFocusedIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Raccourci Ctrl+K
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  // Fetch suggestions
  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); setCorrection(null); setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(q)}&mode=suggest&sid=${SESSION_ID}`
      );
      const data = await res.json();
      setResults(data.results ?? []);
      setCorrection(data.correction ?? null);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
      setFocusedIndex(-1);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) { setResults([]); setCorrection(null); setLoading(false); return; }
    setLoading(true);
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 280);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, fetchSuggestions]);

  function goToSearch(q: string) {
    addToHistory(q);
    setHistory(getHistory());
    router.push(`/boutique?q=${encodeURIComponent(q)}`);
    setOpen(false);
    setQuery("");
    setFocusedIndex(-1);
    onSelect?.();
  }

  function clear() {
    setQuery("");
    setResults([]);
    setCorrection(null);
    setOpen(true);
    setFocusedIndex(-1);
    inputRef.current?.focus();
  }

  // Navigation clavier
  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === "Escape") { setOpen(false); setFocusedIndex(-1); return; }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((i) => Math.min(i + 1, results.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((i) => Math.max(i - 1, -1));
    }
    if (e.key === "Enter" && focusedIndex >= 0 && results[focusedIndex]) {
      e.preventDefault();
      const p = results[focusedIndex];
      addToHistory(query);
      router.push(`/produit/${p.slug}`);
      setOpen(false);
      setQuery("");
      onSelect?.();
    }
  }

  // Recherche par image
  async function handleImageSearch(file: File) {
    setImageLoading(true);
    setImagePreview(URL.createObjectURL(file));
    setOpen(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/search/image", { method: "POST", body: fd });
      const data = await res.json();
      if (data.results) {
        setResults(data.results);
        if (data.analysis?.searchQuery) {
          setQuery(data.analysis.searchQuery);
        }
      }
    } catch {
      setResults([]);
    } finally {
      setImageLoading(false);
    }
  }

  const showDropdown = open;
  const showPopular = query.length === 0;
  const hasResults = results.length > 0;
  const hasHistory = history.length > 0;

  const inputClass =
    "w-full rounded-full border border-gray-300 bg-gray-50 py-2.5 pl-11 pr-20 text-sm text-shifaa-ink placeholder:text-shifaa-muted focus:border-gray-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all";

  return (
    <div ref={ref} className="relative w-full">
      <form
        onSubmit={(e) => { e.preventDefault(); if (query.trim()) goToSearch(query.trim()); }}
        className="relative"
        role="search"
      >
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-shifaa-muted" aria-hidden />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setImagePreview(null); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Rechercher… (Ctrl+K)"
          className={inputClass}
          autoComplete="off"
          aria-label="Recherche de produits"
          aria-autocomplete="list"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {/* Bouton recherche par image */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-full p-1.5 text-shifaa-muted hover:bg-gray-100 hover:text-shifaa-ink transition-colors"
            aria-label="Recherche par image"
            title="Recherche par image"
          >
            <Camera className="h-4 w-4" />
          </button>
          {/* Effacer */}
          {query && (
            <button
              type="button"
              onClick={clear}
              className="rounded-full p-1.5 text-shifaa-muted hover:text-red-500 transition-colors"
              aria-label="Effacer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {/* Input file caché */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageSearch(f); e.target.value = ""; }}
        />
      </form>

      {showDropdown && (
        <div
          id="search-dropdown"
          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-shifaa-border bg-white shadow-2xl"
        >
          {/* Image preview */}
          {imagePreview && (
            <div className="flex items-center gap-3 border-b border-shifaa-border px-4 py-3 bg-shifaa-cream/50">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                <Image src={imagePreview} alt="Aperçu" fill className="object-cover" sizes="40px" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-shifaa-ink flex items-center gap-1">
                  <Camera className="h-3.5 w-3.5 text-shifaa-green" />
                  Recherche par image
                </p>
                {imageLoading ? (
                  <p className="text-xs text-shifaa-muted">Analyse de l&apos;image en cours…</p>
                ) : (
                  <p className="text-xs text-shifaa-muted">{results.length} produit(s) trouvé(s)</p>
                )}
              </div>
              <button onClick={() => { setImagePreview(null); setResults([]); setQuery(""); }}
                className="text-shifaa-muted hover:text-red-500"><X className="h-4 w-4" /></button>
            </div>
          )}

          {/* Loading image */}
          {imageLoading && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-shifaa-muted">
              <Loader2 className="h-4 w-4 animate-spin text-shifaa-green" />
              <span>Analyse de l&apos;image par IA…</span>
            </div>
          )}

          {/* Recherches populaires + historique */}
          {showPopular && !imageLoading && (
            <div className="p-4 space-y-4">
              {/* Historique */}
              {hasHistory && (
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-shifaa-muted">
                    <Clock className="h-3.5 w-3.5" aria-hidden />
                    Recherches récentes
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {history.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => goToSearch(term)}
                        className="flex items-center gap-1 rounded-full border border-shifaa-border bg-white px-3 py-1 text-xs text-shifaa-ink hover:border-shifaa-green hover:text-shifaa-green transition-colors"
                      >
                        <Clock className="h-3 w-3 text-shifaa-muted" />
                        {term}
                      </button>
                    ))}
                    <button
                      onClick={() => { localStorage.removeItem(HISTORY_KEY); setHistory([]); }}
                      className="text-xs text-shifaa-muted hover:text-red-500 px-2"
                    >
                      Effacer
                    </button>
                  </div>
                </div>
              )}

              {/* Populaires */}
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-shifaa-muted">
                  <TrendingUp className="h-3.5 w-3.5" aria-hidden />
                  Tendances
                </p>
                <div className="flex flex-wrap gap-1.5">
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

              {/* Astuce image */}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex w-full items-center gap-2 rounded-xl bg-shifaa-cream px-3 py-2.5 text-left text-sm hover:bg-shifaa-lime/20 transition-colors"
              >
                <Camera className="h-4 w-4 text-shifaa-green shrink-0" />
                <div>
                  <p className="font-medium text-shifaa-ink text-xs">Recherche par image</p>
                  <p className="text-xs text-shifaa-muted">Photographiez un produit pour le trouver</p>
                </div>
              </button>
            </div>
          )}

          {/* Spinner */}
          {loading && query.length >= 2 && !imageLoading && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-shifaa-muted">
              <Loader2 className="h-4 w-4 animate-spin text-shifaa-green" />
              Recherche en cours…
            </div>
          )}

          {/* Suggestion correction */}
          {!loading && correction && query.length >= 2 && (
            <div className="flex items-center gap-2 border-b border-shifaa-border px-4 py-2.5 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
              <p className="text-xs text-amber-700">
                Vouliez-vous dire{" "}
                <button
                  type="button"
                  onClick={() => goToSearch(correction)}
                  className="font-semibold underline hover:text-amber-900"
                >
                  {correction}
                </button>
                {" "}?
              </p>
            </div>
          )}

          {/* Zéro résultat */}
          {!loading && !imageLoading && query.length >= 2 && results.length === 0 && !correction && (
            <div className="px-4 py-5 text-center">
              <p className="text-2xl mb-2">🔍</p>
              <p className="text-sm font-medium text-shifaa-ink">Aucun résultat pour « {query} »</p>
              <p className="mt-1 text-xs text-shifaa-muted">
                Essayez un autre mot-clé ou{" "}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="text-shifaa-green hover:underline"
                >
                  recherchez par image
                </button>
              </p>
            </div>
          )}

          {/* Résultats */}
          {!loading && !imageLoading && hasResults && (
            <ul role="listbox" aria-label="Suggestions de produits">
              {results.map((p, index) => (
                <li key={p.id} role="option" aria-selected={focusedIndex === index}>
                  <Link
                    href={`/produit/${p.slug}`}
                    onClick={() => {
                      addToHistory(query || p.name);
                      setOpen(false);
                      setQuery("");
                      setImagePreview(null);
                      onSelect?.();
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 transition-colors
                      ${focusedIndex === index ? "bg-shifaa-cream" : "hover:bg-shifaa-cream/60"}`}
                  >
                    {/* Image */}
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-shifaa-cream border border-shifaa-border/50">
                      <Image src={p.image} alt={p.name} fill className="object-cover" sizes="44px" />
                    </div>
                    {/* Infos */}
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] text-shifaa-muted">
                        {p.brand}
                        <span className="mx-1">·</span>
                        <span className="text-shifaa-green">
                          {CATEGORY_LABELS[p.category as ProductCategory] ?? p.category}
                        </span>
                        {p.isNew && <span className="ml-1 text-blue-500 font-medium">· Nouveau</span>}
                      </p>
                      <p className="truncate text-sm font-medium text-shifaa-ink">
                        <Highlight text={p.name} query={query} />
                      </p>
                    </div>
                    {/* Prix + stock */}
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-shifaa-ink">{formatDZD(p.price)}</p>
                      {!p.inStock && <p className="text-[11px] text-amber-600">Rupture</p>}
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-shifaa-muted/40 shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {/* Voir tous */}
          {query.length >= 2 && !imageLoading && (
            <button
              type="button"
              onClick={() => goToSearch(query)}
              className="flex w-full items-center justify-between border-t border-shifaa-border px-4 py-2.5 text-sm font-medium text-shifaa-green hover:bg-shifaa-cream transition-colors"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Voir tous les résultats pour « {query} »
              </span>
              <Search className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
