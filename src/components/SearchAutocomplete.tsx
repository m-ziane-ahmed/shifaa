"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { PRODUCTS } from "@/data/products";
import { formatDZD } from "@/lib/utils";

type Props = {
  variant?: "header" | "mobile";
  onSelect?: () => void;
};

export function SearchAutocomplete({ variant = "header", onSelect }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const results =
    query.length >= 2
      ? PRODUCTS.filter(
          (p) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.brand.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 6)
      : [];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const inputClass =
    variant === "header"
      ? "w-full rounded-full border border-white/20 bg-white/10 py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-white/50 focus:border-shifaa-lime focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-shifaa-lime/50"
      : "w-full rounded-full border border-white/20 bg-white/10 py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-white/50 focus:border-shifaa-lime focus:outline-none focus:ring-2 focus:ring-shifaa-lime/50";

  function goToSearch(q: string) {
    router.push(`/boutique?q=${encodeURIComponent(q)}`);
    setOpen(false);
    setQuery("");
    onSelect?.();
  }

  return (
    <div ref={ref} className="relative w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim()) goToSearch(query.trim());
        }}
        className="relative"
      >
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
        <input
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
        />
      </form>
      {open && query.length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-shifaa-border bg-white shadow-lift">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-shifaa-muted">Aucun résultat</p>
          ) : (
            <ul>
              {results.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/produit/${p.slug}`}
                    onClick={() => {
                      setOpen(false);
                      onSelect?.();
                    }}
                    className="flex items-center justify-between gap-2 px-4 py-2.5 text-sm hover:bg-shifaa-cream"
                  >
                    <span className="line-clamp-1">
                      <span className="text-shifaa-muted">{p.brand} · </span>
                      {p.name}
                    </span>
                    <span className="shrink-0 font-medium">{formatDZD(p.price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            onClick={() => goToSearch(query)}
            className="w-full border-t border-shifaa-border px-4 py-2.5 text-left text-sm font-medium text-shifaa-green hover:bg-shifaa-cream"
          >
            Voir tous les résultats pour « {query} »
          </button>
        </div>
      )}
    </div>
  );
}
