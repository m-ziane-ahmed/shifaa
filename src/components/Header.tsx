"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronRight, Search, Menu, X, User, Phone, Mail, Sparkles, Tag } from "lucide-react";
import { CartBadge } from "@/components/CartBadge";
import { ShifaaLogo } from "@/components/ShifaaLogo";
import { SearchAutocomplete } from "@/components/SearchAutocomplete";
import { WishlistBadge } from "@/components/WishlistBadge";
import { CompareBadge } from "@/components/CompareBadge";
import { CATEGORIES, BESOINS } from "@/data/categories";
import { SITE } from "@/lib/site";
import { SocialLinks } from "@/components/SocialLinks";

const NAV: Array<{ href: string; label: string; badge?: string }> = [
  { href: "/boutique", label: "Boutique" },
  { href: "/diagnostic", label: "Diagnostic", badge: "IA" },
  { href: "/promotions", label: "Promotions", badge: "Promo" },
  { href: "/nouveautes", label: "Nouveautés", badge: "New" },
  { href: "/conseils", label: "Conseils" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

const PRODUCT_CATS = CATEGORIES.filter(
  (c) => c.slug !== "marques" && c.slug !== "offres"
);

// Catégorie active dans le mega menu
type ActiveTab = string | null;

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>(PRODUCT_CATS[0]?.slug ?? null);
  const [mobileExpandedCat, setMobileExpandedCat] = useState(false);
  const [mobileExpandedNeed, setMobileExpandedNeed] = useState(false);
  const megaRef = useRef<HTMLDivElement>(null);
  const megaTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    megaTimeout.current = setTimeout(() => setMegaOpen(false), 180);
  }

  const activeCat = PRODUCT_CATS.find((c) => c.slug === activeTab);

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
        <Link href="/service-client" className="font-medium text-shifaa-lime hover:underline">Service client</Link>
      </div>

      {/* Barre principale */}
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 md:px-6">
        <button type="button" className="text-white md:hidden" onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Fermer" : "Menu"} aria-expanded={mobileOpen}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        <ShifaaLogo compactOnMobile />
        <div className="hidden flex-1 md:block">
          <SearchAutocomplete />
        </div>
        <div className="ml-auto flex items-center gap-2 md:gap-4">
          <button type="button" className="rounded-full p-2 text-white hover:bg-white/10 md:hidden"
            onClick={() => setSearchOpen(!searchOpen)} aria-label="Rechercher">
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

      {/* ── Navigation desktop ─────────────────────────────── */}
      <nav className="hidden border-t border-white/10 md:block" aria-label="Navigation principale">
        <div className="mx-auto flex max-w-6xl items-center gap-0 px-6">

          {/* Mega menu */}
          <div ref={megaRef} onMouseEnter={onMegaEnter} onMouseLeave={onMegaLeave} className="relative">
            <button type="button" onClick={() => setMegaOpen(!megaOpen)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors ${megaOpen ? "text-shifaa-lime" : "text-white hover:text-shifaa-lime"}`}
              aria-expanded={megaOpen} aria-haspopup="true">
              Catégories
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${megaOpen ? "rotate-180" : ""}`} />
            </button>

            {megaOpen && (
              <div className="absolute left-0 top-full z-50 w-[760px] rounded-2xl border border-white/15 bg-[#0d3330] shadow-2xl overflow-hidden">
                <div className="flex">

                  {/* Colonne gauche : liste catégories */}
                  <div className="w-56 shrink-0 border-r border-white/10 py-3">
                    <p className="px-4 pb-2 text-[10px] font-semibold uppercase tracking-widest text-white/30">
                      Catégories
                    </p>
                    {PRODUCT_CATS.map((cat) => (
                      <button key={cat.slug} type="button"
                        onMouseEnter={() => setActiveTab(cat.slug)}
                        onClick={() => { setMegaOpen(false); }}
                        className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors
                          ${activeTab === cat.slug ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
                      >
                        <span className="text-base shrink-0">{cat.icon}</span>
                        <span className="flex-1 font-medium truncate">{cat.label}</span>
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-50" />
                      </button>
                    ))}
                    {/* Séparateur + liens spéciaux */}
                    <div className="mx-4 my-2 border-t border-white/10" />
                    <Link href="/promotions" onClick={() => setMegaOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-shifaa-lime hover:bg-white/5 transition-colors">
                      <Tag className="h-4 w-4 shrink-0" />
                      <span className="font-medium">Promotions</span>
                      <span className="ml-auto rounded-full bg-shifaa-lime/20 px-1.5 py-0.5 text-[10px]">Promo</span>
                    </Link>
                    <Link href="/nouveautes" onClick={() => setMegaOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-blue-300 hover:bg-white/5 transition-colors">
                      <Sparkles className="h-4 w-4 shrink-0" />
                      <span className="font-medium">Nouveautés</span>
                      <span className="ml-auto rounded-full bg-blue-400/20 px-1.5 py-0.5 text-[10px]">New</span>
                    </Link>
                  </div>

                  {/* Colonne centrale : sous-catégories */}
                  <div className="flex-1 p-4">
                    {activeCat ? (
                      <>
                        <div className="mb-3 flex items-center justify-between">
                          <p className="text-xs font-semibold uppercase tracking-widest text-white/30">
                            {activeCat.label}
                          </p>
                          <Link href={activeCat.href} onClick={() => setMegaOpen(false)}
                            className="text-xs text-shifaa-lime hover:underline">
                            Voir tout →
                          </Link>
                        </div>
                        {activeCat.subcategories && activeCat.subcategories.length > 0 ? (
                          <div className="grid grid-cols-2 gap-1 mb-4">
                            {activeCat.subcategories.map((sub) => (
                              <Link key={sub.slug} href={sub.href} onClick={() => setMegaOpen(false)}
                                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors">
                                <span className="text-base shrink-0">{sub.icon}</span>
                                <span className="font-medium truncate">{sub.label}</span>
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-white/50 py-4">Voir tous les produits →</p>
                        )}
                        {activeCat.popularSearches && (
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2">
                              Recherches populaires
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {activeCat.popularSearches.map((s) => (
                                <Link key={s} href={`/boutique?q=${encodeURIComponent(s)}`}
                                  onClick={() => setMegaOpen(false)}
                                  className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70 hover:bg-white/20 hover:text-white transition-colors">
                                  {s}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : null}
                  </div>

                  {/* Colonne droite : navigation par besoin */}
                  <div className="w-48 shrink-0 border-l border-white/10 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-3">
                      Mon besoin
                    </p>
                    <div className="space-y-0.5">
                      {BESOINS.slice(0, 10).map((b) => (
                        <Link key={b.slug} href={b.href} onClick={() => setMegaOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs text-white/70 hover:bg-white/10 hover:text-white transition-colors">
                          <span>{b.icon}</span>
                          <span className="font-medium">{b.label}</span>
                        </Link>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <Link href="/boutique" onClick={() => setMegaOpen(false)}
                        className="block w-full rounded-xl bg-shifaa-lime/20 px-3 py-2 text-center text-xs font-medium text-shifaa-lime hover:bg-shifaa-lime/30 transition-colors">
                        Tout le catalogue →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Autres liens nav */}
          {NAV.map((item) => (
            <Link key={item.href} href={item.href}
              className="relative px-4 py-3 text-sm text-white/85 transition hover:text-shifaa-lime flex items-center gap-1.5">
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

      {/* ── Menu mobile ─────────────────────────────────────── */}
      {mobileOpen && (
        <nav className="border-t border-white/10 bg-[#0d3330] max-h-[85vh] overflow-y-auto px-4 py-4 md:hidden">

          {/* Recherche mobile en premier */}
          <div className="mb-4">
            <SearchAutocomplete onSelect={() => setMobileOpen(false)} />
          </div>

          {/* Catégories avec sous-catégories */}
          <button type="button" onClick={() => setMobileExpandedCat(!mobileExpandedCat)}
            className="flex w-full items-center justify-between py-3 text-sm font-semibold text-white border-b border-white/10">
            <span>Catégories</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${mobileExpandedCat ? "rotate-180" : ""}`} />
          </button>
          {mobileExpandedCat && (
            <div className="mb-2 space-y-1 pt-2">
              {PRODUCT_CATS.map((cat) => (
                <div key={cat.slug}>
                  <Link href={cat.href} onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 py-2.5 px-2 text-sm font-medium text-white/90 hover:text-white rounded-xl hover:bg-white/10 transition-colors">
                    <span className="text-base">{cat.icon}</span>
                    {cat.label}
                  </Link>
                  {cat.subcategories && cat.subcategories.length > 0 && (
                    <div className="ml-8 mb-1 space-y-0.5">
                      {cat.subcategories.map((sub) => (
                        <Link key={sub.slug} href={sub.href} onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-1.5 py-1.5 text-xs text-white/60 hover:text-white/90 transition-colors">
                          <span>{sub.icon}</span>
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Navigation par besoin mobile */}
          <button type="button" onClick={() => setMobileExpandedNeed(!mobileExpandedNeed)}
            className="flex w-full items-center justify-between py-3 text-sm font-semibold text-white border-b border-white/10">
            <span>Mon besoin</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${mobileExpandedNeed ? "rotate-180" : ""}`} />
          </button>
          {mobileExpandedNeed && (
            <div className="mb-2 grid grid-cols-2 gap-1.5 pt-2">
              {BESOINS.map((b) => (
                <Link key={b.slug} href={b.href} onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors">
                  <span>{b.icon}</span>
                  <span className="text-xs font-medium">{b.label}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Liens principaux */}
          {NAV.map((item) => (
            <Link key={item.href} href={item.href}
              className="flex items-center justify-between py-3 text-sm font-medium text-white border-b border-white/5 hover:text-shifaa-lime transition-colors"
              onClick={() => setMobileOpen(false)}>
              <span>{item.label}</span>
              {item.badge && (
                <span className="rounded-full bg-shifaa-lime/20 px-2 py-0.5 text-xs font-semibold text-shifaa-lime">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
          <Link href="/service-client"
            className="block py-3 text-sm text-shifaa-lime border-b border-white/5"
            onClick={() => setMobileOpen(false)}>
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
