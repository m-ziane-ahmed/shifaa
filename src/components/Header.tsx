"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronRight, Search, Menu, X, User, Phone, Mail } from "lucide-react";
import { CartBadge } from "@/components/CartBadge";
import { ShifaaLogo } from "@/components/ShifaaLogo";
import { SearchAutocomplete } from "@/components/SearchAutocomplete";
import { WishlistBadge } from "@/components/WishlistBadge";
import { CompareBadge } from "@/components/CompareBadge";
import { CATEGORIES } from "@/data/categories";
import { SITE } from "@/lib/site";
import { SocialLinks } from "@/components/SocialLinks";

const NAV: Array<{ href: string; label: string; badge?: string }> = [
  { href: "/boutique", label: "Boutique" },
  { href: "/promotions", label: "Promotions", badge: "Promo" },
  { href: "/nouveautes", label: "Nouveautés", badge: "New" },
  { href: "/conseils", label: "Conseils" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

const PRODUCT_CATS = CATEGORIES.filter(
  (c) => c.slug !== "marques" && c.slug !== "offres"
);

const QUICK_LINKS = [
  { href: "/promotions", label: "🎁 Promotions du moment" },
  { href: "/nouveautes", label: "✨ Nouveautés" },
  { href: "/boutique?is_best_seller=1", label: "⭐ Best-sellers" },
  { href: "/boutique?stock=1", label: "📦 En stock uniquement" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileExpandedCat, setMobileExpandedCat] = useState(false);
  const megaRef = useRef<HTMLDivElement>(null);
  const megaTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fermer mega menu si clic dehors
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) {
        setMegaOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function onMegaEnter() {
    if (megaTimeout.current) clearTimeout(megaTimeout.current);
    setMegaOpen(true);
  }

  function onMegaLeave() {
    megaTimeout.current = setTimeout(() => setMegaOpen(false), 150);
  }

  return (
    <header className="sticky top-0 z-40 bg-shifaa-dark text-white shadow-md">
      {/* Barre supérieure */}
      <div className="border-b border-white/10 px-4 py-2">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs md:justify-between md:text-sm">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <a href={`tel:${SITE.phoneTel}`} className="inline-flex items-center gap-1.5 hover:text-shifaa-lime transition-colors">
              <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {SITE.phone}
            </a>
            <a href={`mailto:${SITE.email}`} className="inline-flex items-center gap-1.5 hover:text-shifaa-lime transition-colors">
              <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {SITE.email}
            </a>
            <span className="hidden text-white/60 sm:inline">·</span>
            <span className="text-white/80">{SITE.hoursShort}</span>
          </div>
          <SocialLinks variant="header" />
        </div>
      </div>

      {/* Bannière livraison */}
      <div className="border-b border-white/10 px-4 py-2 text-center text-xs text-white/80 md:text-sm">
        Livraison dans toute l&apos;Algérie · Paiement sécurisé ·{" "}
        <Link href="/service-client" className="font-medium text-shifaa-lime hover:underline">
          Service client
        </Link>
      </div>

      {/* Barre principale */}
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 md:px-6">
        <button
          type="button"
          className="text-white md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        <ShifaaLogo compactOnMobile />

        <div className="hidden flex-1 md:block">
          <SearchAutocomplete />
        </div>

        <div className="ml-auto flex items-center gap-2 md:gap-4">
          <button
            type="button"
            className="rounded-full p-2 text-white hover:bg-white/10 md:hidden"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Rechercher"
          >
            <Search className="h-5 w-5" />
          </button>
          <WishlistBadge />
          <CompareBadge />
          <Link href="/compte" className="rounded-full p-2 text-white hover:bg-white/10" aria-label="Mon compte">
            <User className="h-5 w-5" />
          </Link>
          <CartBadge />
        </div>
      </div>

      {/* Recherche mobile */}
      {searchOpen && (
        <div className="border-t border-white/10 px-4 py-3 md:hidden">
          <SearchAutocomplete onSelect={() => setSearchOpen(false)} />
        </div>
      )}

      {/* Navigation desktop avec mega menu */}
      <nav className="hidden border-t border-white/10 md:block" aria-label="Navigation principale">
        <div className="mx-auto flex max-w-6xl items-center gap-1 px-6">

          {/* Mega menu catégories */}
          <div ref={megaRef} onMouseEnter={onMegaEnter} onMouseLeave={onMegaLeave} className="relative">
            <button
              type="button"
              onClick={() => setMegaOpen(!megaOpen)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors ${megaOpen ? "text-shifaa-lime" : "text-white hover:text-shifaa-lime"}`}
              aria-expanded={megaOpen}
              aria-haspopup="true"
            >
              Catégories
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${megaOpen ? "rotate-180" : ""}`} />
            </button>

            {megaOpen && (
              <div className="absolute left-0 top-full z-50 w-[600px] rounded-2xl border border-white/15 bg-[#0f3d3a] shadow-2xl overflow-hidden">
                <div className="grid grid-cols-3 gap-0">
                  {/* Catégories */}
                  <div className="col-span-2 p-4 border-r border-white/10">
                    <p className="text-xs font-medium uppercase tracking-widest text-white/40 mb-3 px-2">
                      Catégories
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      {PRODUCT_CATS.map((cat) => (
                        <Link
                          key={cat.slug}
                          href={cat.href}
                          onClick={() => setMegaOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors group"
                        >
                          <span className="text-base shrink-0">{cat.icon}</span>
                          <div className="min-w-0">
                            <p className="font-medium truncate">{cat.label}</p>
                            <p className="text-xs text-white/40 truncate">{cat.description}</p>
                          </div>
                          <ChevronRight className="h-3.5 w-3.5 ml-auto text-white/30 group-hover:text-white/60 shrink-0" />
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Liens rapides */}
                  <div className="p-4">
                    <p className="text-xs font-medium uppercase tracking-widest text-white/40 mb-3">
                      Accès rapide
                    </p>
                    <div className="space-y-1">
                      {QUICK_LINKS.map((l) => (
                        <Link
                          key={l.href}
                          href={l.href}
                          onClick={() => setMegaOpen(false)}
                          className="block rounded-xl px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                        >
                          {l.label}
                        </Link>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <Link
                        href="/boutique"
                        onClick={() => setMegaOpen(false)}
                        className="block w-full rounded-xl bg-shifaa-lime/20 px-3 py-2.5 text-center text-sm font-medium text-shifaa-lime hover:bg-shifaa-lime/30 transition-colors"
                      >
                        Voir tout le catalogue →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Autres liens nav */}
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative px-4 py-3 text-sm text-white/85 transition hover:text-shifaa-lime flex items-center gap-1.5"
            >
              {item.label}
              {item.badge && (
                <span className="rounded-full bg-shifaa-lime/20 px-1.5 py-0.5 text-[10px] font-semibold text-shifaa-lime">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}

          <Link href="/service-client" className="ml-auto px-4 py-3 text-sm font-medium text-shifaa-lime">
            Aide
          </Link>
        </div>
      </nav>

      {/* Menu mobile */}
      {mobileOpen && (
        <nav className="border-t border-white/10 bg-shifaa-dark px-4 py-4 md:hidden" aria-label="Menu mobile">
          {/* Catégories mobile */}
          <button
            type="button"
            onClick={() => setMobileExpandedCat(!mobileExpandedCat)}
            className="flex w-full items-center justify-between py-3 text-sm font-medium text-white"
          >
            <span>Catégories</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${mobileExpandedCat ? "rotate-180" : ""}`} />
          </button>

          {mobileExpandedCat && (
            <div className="mb-2 ml-2 space-y-0.5 border-l border-white/10 pl-4">
              {PRODUCT_CATS.map((cat) => (
                <Link
                  key={cat.slug}
                  href={cat.href}
                  className="flex items-center gap-2 py-2 text-sm text-white/80 hover:text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </Link>
              ))}
            </div>
          )}

          {/* Autres liens */}
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between py-3 text-sm font-medium text-white border-t border-white/5"
              onClick={() => setMobileOpen(false)}
            >
              <span>{item.label}</span>
              {item.badge && (
                <span className="rounded-full bg-shifaa-lime/20 px-2 py-0.5 text-xs font-semibold text-shifaa-lime">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
          <Link
            href="/service-client"
            className="block py-3 text-sm text-shifaa-lime border-t border-white/5"
            onClick={() => setMobileOpen(false)}
          >
            Service client
          </Link>
          <div className="mt-4 border-t border-white/10 pt-4">
            <SocialLinks variant="header" />
          </div>
        </nav>
      )}
    </header>
  );
}
