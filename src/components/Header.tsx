"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
  ChevronDown, ChevronRight, Search, Menu, X,
  User, Phone, Mail, Sparkles, Tag, Bell, Zap
} from "lucide-react";
import { CartBadge } from "@/components/CartBadge";
import { ShifaaLogo } from "@/components/ShifaaLogo";
import { SearchAutocomplete } from "@/components/SearchAutocomplete";
import { WishlistBadge } from "@/components/WishlistBadge";
import { CompareBadge } from "@/components/CompareBadge";
import { CATEGORIES, BESOINS } from "@/data/categories";
import { SITE } from "@/lib/site";
import { SocialLinks } from "@/components/SocialLinks";

// ── Barre de navigation principale ───────────────────────
const NAV: Array<{ href: string; label: string; badge?: string; color?: string }> = [
  { href: "/boutique", label: "Boutique" },
  { href: "/boutique?view=marques", label: "Marques" },
  { href: "/promotions", label: "Promotions", badge: "Promo", color: "text-red-600" },
  { href: "/nouveautes", label: "Nouveautés", badge: "New", color: "text-blue-600" },
  { href: "/diagnostic", label: "Diagnostic IA", badge: "IA", color: "text-purple-600" },
  { href: "/conseils", label: "Conseils & Expertise" },
  { href: "/compte/fidelite", label: "Fidélité", badge: "VIP", color: "text-amber-600" },
  { href: "/contact", label: "Contact" },
];

// ── Marques populaires ────────────────────────────────────
const MARQUES_TOP = [
  { label: "Avène", href: "/boutique?marque=Avène" },
  { label: "Bioderma", href: "/boutique?marque=Bioderma" },
  { label: "Uriage", href: "/boutique?marque=Uriage" },
  { label: "La Roche-Posay", href: "/boutique?marque=La+Roche-Posay" },
  { label: "Mustela", href: "/boutique?marque=Mustela" },
  { label: "Vichy", href: "/boutique?marque=Vichy" },
  { label: "SVR", href: "/boutique?marque=SVR" },
  { label: "Cétaphil", href: "/boutique?marque=Cétaphil" },
];

// ── Produits populaires par catégorie ────────────────────
const POPULAR_BY_CAT: Record<string, Array<{ label: string; brand: string; href: string }>> = {
  "visage-peau": [
    { label: "Crème hydratante Xérial", brand: "Avène", href: "/boutique?q=crème+hydratante+avène" },
    { label: "Sérum Vitamine C", brand: "SVR", href: "/boutique?q=sérum+vitamine+c" },
    { label: "SPF 50+ Photoderm", brand: "Bioderma", href: "/boutique?q=spf50+bioderma" },
    { label: "Gel Nettoyant Doux", brand: "SVR", href: "/boutique?q=gel+nettoyant" },
  ],
  "cheveux": [
    { label: "Shampoing anti-chute", brand: "Vichy", href: "/boutique?q=shampoing+anti-chute" },
    { label: "Masque capillaire", brand: "Uriage", href: "/boutique?q=masque+capillaire" },
    { label: "Huile nourrissante", brand: "Bioderma", href: "/boutique?q=huile+cheveux" },
  ],
  "bebe-maternite": [
    { label: "Lingettes bébé", brand: "Mustela", href: "/boutique?q=lingettes+bébé" },
    { label: "Crème change", brand: "Mustela", href: "/boutique?q=crème+change" },
    { label: "Lait corps bébé", brand: "Avène", href: "/boutique?q=lait+corps+bébé" },
  ],
  "complements": [
    { label: "Vitamine C 1000mg", brand: "Lab", href: "/boutique?q=vitamine+c" },
    { label: "Magnésium marin", brand: "Lab", href: "/boutique?q=magnésium" },
    { label: "Oméga 3", brand: "Lab", href: "/boutique?q=oméga+3" },
  ],
};

const PRODUCT_CATS = CATEGORIES.filter(
  (c) => c.slug !== "marques" && c.slug !== "offres"
);

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
  const popularProducts = activeTab ? POPULAR_BY_CAT[activeTab] : undefined;

  return (
    <header id="site-header" className="fixed top-0 left-0 right-0 z-50 bg-white text-shifaa-ink shadow-sm border-b border-shifaa-border">

      {/* ── Barre supérieure ──────────────────────────────── */}
      <div className="border-b border-shifaa-border bg-gray-50 px-4 py-1.5">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-shifaa-muted">
            <a href={`tel:${SITE.phoneTel}`}
              className="inline-flex items-center gap-1.5 hover:text-shifaa-green transition-colors">
              <Phone className="h-3 w-3 shrink-0" aria-hidden />
              {SITE.phone}
            </a>
            <a href={`mailto:${SITE.email}`}
              className="inline-flex items-center gap-1.5 hover:text-shifaa-green transition-colors">
              <Mail className="h-3 w-3 shrink-0" aria-hidden />
              {SITE.email}
            </a>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">{SITE.hoursShort}</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline text-shifaa-green font-medium">
              🚚 Livraison nationale · Paiement sécurisé
            </span>
          </div>
          <SocialLinks variant="header" />
        </div>
      </div>

      {/* ── Barre principale ──────────────────────────────── */}
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 md:px-6">
        <button type="button" className="text-shifaa-ink md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Fermer" : "Menu"} aria-expanded={mobileOpen}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        <ShifaaLogo compactOnMobile />

        {/* Barre de recherche desktop */}
        <div className="hidden flex-1 md:block">
          <SearchAutocomplete />
        </div>

        {/* CTA "Diagnostic gratuit" (recommandation #6) */}
        <Link href="/diagnostic"
          className="hidden lg:flex items-center gap-1.5 rounded-xl bg-shifaa-green px-4 py-2 text-sm font-semibold text-white hover:bg-shifaa-dark transition-colors shrink-0">
          <Zap className="h-4 w-4" />
          Trouver mon produit
        </Link>

        {/* Icônes header */}
        <div className="ml-auto flex items-center gap-1 md:gap-2 md:ml-0">
          <button type="button" className="rounded-full p-2 text-shifaa-ink hover:bg-gray-100 md:hidden"
            onClick={() => setSearchOpen(!searchOpen)} aria-label="Rechercher">
            <Search className="h-5 w-5" />
          </button>
          <WishlistBadge />
          <CompareBadge />
          {/* Notifications (recommandation #7) */}
          <Link href="/compte" className="relative rounded-full p-2 text-shifaa-ink hover:bg-gray-100"
            aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </Link>
          <Link href="/compte" className="rounded-full p-2 text-shifaa-ink hover:bg-gray-100" aria-label="Mon compte">
            <User className="h-5 w-5" />
          </Link>
          <CartBadge />
        </div>
      </div>

      {/* Recherche mobile */}
      {searchOpen && (
        <div className="border-t border-shifaa-border px-4 py-3 md:hidden">
          <SearchAutocomplete onSelect={() => setSearchOpen(false)} />
        </div>
      )}

      {/* ── Navigation desktop ──────────────────────────────────── */}
      <nav className="hidden border-t border-shifaa-border md:block" aria-label="Navigation principale">
        <div className="mx-auto flex max-w-6xl items-center px-6">

          {/* ── Mega menu Catégories ── */}
          <div ref={megaRef} onMouseEnter={onMegaEnter} onMouseLeave={onMegaLeave} className="relative">
            <button type="button" onClick={() => setMegaOpen(!megaOpen)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold transition-colors ${megaOpen ? "text-shifaa-green" : "text-shifaa-ink hover:text-shifaa-green"}`}
              aria-expanded={megaOpen} aria-haspopup="true">
              Catégories
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${megaOpen ? "rotate-180" : ""}`} />
            </button>

            {megaOpen && (
              <div className="absolute left-0 top-full z-50 w-[900px] rounded-2xl border border-shifaa-border bg-white shadow-2xl overflow-hidden">
                <div className="flex">

                  {/* COL 1 — Liste catégories */}
                  <div className="w-52 shrink-0 border-r border-shifaa-border py-3 bg-gray-50">
                    <p className="px-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-shifaa-muted">
                      Catégories
                    </p>
                    {PRODUCT_CATS.map((cat) => (
                      <button key={cat.slug} type="button"
                        onMouseEnter={() => setActiveTab(cat.slug)}
                        onClick={() => setMegaOpen(false)}
                        className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors
                          ${activeTab === cat.slug
                            ? "bg-white text-shifaa-green font-semibold border-r-2 border-shifaa-green"
                            : "text-shifaa-ink hover:bg-white hover:text-shifaa-green"}`}>
                        <span className="text-base shrink-0">{cat.icon}</span>
                        <span className="flex-1 truncate">{cat.label}</span>
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-shifaa-muted" />
                      </button>
                    ))}
                    <div className="mx-4 my-2 border-t border-shifaa-border" />
                    <Link href="/promotions" onClick={() => setMegaOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-white transition-colors font-medium">
                      <Tag className="h-4 w-4 shrink-0" />
                      <span>Promotions</span>
                      <span className="ml-auto rounded-full bg-red-100 px-1.5 py-0.5 text-[10px]">Promo</span>
                    </Link>
                    <Link href="/nouveautes" onClick={() => setMegaOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-blue-600 hover:bg-white transition-colors font-medium">
                      <Sparkles className="h-4 w-4 shrink-0" />
                      <span>Nouveautés</span>
                      <span className="ml-auto rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px]">New</span>
                    </Link>
                  </div>

                  {/* COL 2 — Sous-catégories + recherches */}
                  <div className="flex-1 p-4">
                    {activeCat ? (
                      <>
                        <div className="mb-3 flex items-center justify-between">
                          <p className="text-xs font-bold uppercase tracking-widest text-shifaa-muted">
                            {activeCat.label}
                          </p>
                          <Link href={activeCat.href} onClick={() => setMegaOpen(false)}
                            className="text-xs text-shifaa-green hover:underline font-medium">
                            Voir tout →
                          </Link>
                        </div>
                        {activeCat.subcategories && activeCat.subcategories.length > 0 && (
                          <div className="grid grid-cols-2 gap-1 mb-4">
                            {activeCat.subcategories.map((sub) => (
                              <Link key={sub.slug} href={sub.href} onClick={() => setMegaOpen(false)}
                                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-shifaa-ink hover:bg-gray-50 hover:text-shifaa-green transition-colors">
                                <span className="text-base shrink-0">{sub.icon}</span>
                                <span className="font-medium truncate">{sub.label}</span>
                              </Link>
                            ))}
                          </div>
                        )}
                        {activeCat.popularSearches && (
                          <>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-shifaa-muted mb-2">
                              Recherches populaires
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {activeCat.popularSearches.map((s) => (
                                <Link key={s} href={`/boutique?q=${encodeURIComponent(s)}`}
                                  onClick={() => setMegaOpen(false)}
                                  className="rounded-full bg-gray-100 px-3 py-1 text-xs text-shifaa-ink hover:bg-shifaa-green hover:text-white transition-colors">
                                  {s}
                                </Link>
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    ) : null}
                  </div>

                  {/* COL 3 — Produits populaires (recommandation #8) */}
                  <div className="w-44 shrink-0 border-l border-shifaa-border p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-shifaa-muted mb-3">
                      Top produits
                    </p>
                    {popularProducts && popularProducts.length > 0 ? (
                      <div className="space-y-2">
                        {popularProducts.map((p) => (
                          <Link key={p.label} href={p.href} onClick={() => setMegaOpen(false)}
                            className="flex flex-col rounded-xl p-2 hover:bg-gray-50 transition-colors group">
                            <span className="text-xs font-semibold text-shifaa-ink group-hover:text-shifaa-green truncate">
                              {p.label}
                            </span>
                            <span className="text-[10px] text-shifaa-muted">{p.brand}</span>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs text-shifaa-muted">Survolez une catégorie</p>
                      </div>
                    )}

                    {/* Marques recommandées (recommandation #9) */}
                    <div className="mt-4 pt-3 border-t border-shifaa-border">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-shifaa-muted mb-2">
                        Marques
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {MARQUES_TOP.slice(0, 4).map((m) => (
                          <Link key={m.label} href={m.href} onClick={() => setMegaOpen(false)}
                            className="rounded-full border border-shifaa-border px-2 py-0.5 text-[10px] text-shifaa-ink hover:border-shifaa-green hover:text-shifaa-green transition-colors">
                            {m.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* COL 4 — Mon besoin + offre promo (recommandation #10) */}
                  <div className="w-44 shrink-0 border-l border-shifaa-border bg-gray-50 flex flex-col">
                    <div className="p-4 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-shifaa-muted mb-3">
                        Mon besoin
                      </p>
                      <div className="space-y-0.5">
                        {BESOINS.slice(0, 8).map((b) => (
                          <Link key={b.slug} href={b.href} onClick={() => setMegaOpen(false)}
                            className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs text-shifaa-ink hover:bg-white hover:text-shifaa-green transition-colors">
                            <span>{b.icon}</span>
                            <span className="font-medium">{b.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Zone promotionnelle (recommandation #10) */}
                    <div className="border-t border-shifaa-border p-3 bg-shifaa-green/5">
                      <div className="rounded-xl bg-shifaa-green p-3 text-center">
                        <p className="text-[10px] font-bold text-white/80 uppercase tracking-wide">🎁 Offre du moment</p>
                        <p className="text-xs font-semibold text-white mt-1">-15% sur les soins solaires</p>
                        <Link href="/promotions" onClick={() => setMegaOpen(false)}
                          className="mt-2 block rounded-lg bg-white px-2 py-1 text-[10px] font-bold text-shifaa-green hover:bg-shifaa-lime transition-colors">
                          Voir l&apos;offre →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Autres liens nav desktop */}
          {NAV.map((item) => (
            <Link key={item.href} href={item.href}
              className={`relative px-3 py-3 text-sm font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap
                ${item.color ?? "text-shifaa-ink hover:text-shifaa-green"}`}>
              {item.label}
              {item.badge && (
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold
                  ${item.badge === "Promo" ? "bg-red-100 text-red-600"
                    : item.badge === "New" ? "bg-blue-100 text-blue-600"
                    : item.badge === "IA" ? "bg-purple-100 text-purple-600"
                    : item.badge === "VIP" ? "bg-amber-100 text-amber-600"
                    : "bg-shifaa-green/10 text-shifaa-green"}`}>
                  {item.badge}
                </span>
              )}
            </Link>
          ))}

          <Link href="/service-client"
            className="ml-auto px-3 py-3 text-sm font-semibold text-shifaa-green hover:text-shifaa-dark whitespace-nowrap">
            Aide
          </Link>
        </div>
      </nav>

      {/* ── Menu mobile ────────────────────────────────────────── */}
      {mobileOpen && (
        <nav className="border-t border-shifaa-border bg-white max-h-[85vh] overflow-y-auto px-4 py-4 md:hidden">
          <div className="mb-4">
            <SearchAutocomplete onSelect={() => setMobileOpen(false)} />
          </div>

          {/* CTA diagnostic mobile */}
          <Link href="/diagnostic" onClick={() => setMobileOpen(false)}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-shifaa-green py-3 text-sm font-semibold text-white">
            <Zap className="h-4 w-4" />
            Trouver mon produit · Diagnostic gratuit
          </Link>

          {/* Catégories */}
          <button type="button" onClick={() => setMobileExpandedCat(!mobileExpandedCat)}
            className="flex w-full items-center justify-between py-3 text-sm font-semibold text-shifaa-ink border-b border-shifaa-border">
            <span>Catégories</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${mobileExpandedCat ? "rotate-180" : ""}`} />
          </button>
          {mobileExpandedCat && (
            <div className="mb-2 space-y-1 pt-2">
              {PRODUCT_CATS.map((cat) => (
                <div key={cat.slug}>
                  <Link href={cat.href} onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 py-2.5 px-2 text-sm font-medium text-shifaa-ink hover:text-shifaa-green rounded-xl hover:bg-gray-50 transition-colors">
                    <span className="text-base">{cat.icon}</span>
                    {cat.label}
                  </Link>
                  {cat.subcategories && cat.subcategories.length > 0 && (
                    <div className="ml-8 mb-1 space-y-0.5">
                      {cat.subcategories.map((sub) => (
                        <Link key={sub.slug} href={sub.href} onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-1.5 py-1.5 text-xs text-shifaa-muted hover:text-shifaa-green transition-colors">
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

          {/* Marques mobile */}
          <div className="border-b border-shifaa-border py-3">
            <p className="text-xs font-bold text-shifaa-muted uppercase tracking-wide mb-2">Marques populaires</p>
            <div className="flex flex-wrap gap-1.5">
              {MARQUES_TOP.map((m) => (
                <Link key={m.label} href={m.href} onClick={() => setMobileOpen(false)}
                  className="rounded-full border border-shifaa-border px-3 py-1 text-xs text-shifaa-ink hover:border-shifaa-green hover:text-shifaa-green transition-colors">
                  {m.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Mon besoin mobile */}
          <button type="button" onClick={() => setMobileExpandedNeed(!mobileExpandedNeed)}
            className="flex w-full items-center justify-between py-3 text-sm font-semibold text-shifaa-ink border-b border-shifaa-border">
            <span>Mon besoin</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${mobileExpandedNeed ? "rotate-180" : ""}`} />
          </button>
          {mobileExpandedNeed && (
            <div className="mb-2 grid grid-cols-2 gap-1.5 pt-2">
              {BESOINS.map((b) => (
                <Link key={b.slug} href={b.href} onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5 text-sm text-shifaa-ink hover:bg-shifaa-green hover:text-white transition-colors">
                  <span>{b.icon}</span>
                  <span className="text-xs font-medium">{b.label}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Liens nav */}
          {NAV.map((item) => (
            <Link key={item.href} href={item.href}
              className="flex items-center justify-between py-3 text-sm font-medium text-shifaa-ink border-b border-shifaa-border hover:text-shifaa-green transition-colors"
              onClick={() => setMobileOpen(false)}>
              <span>{item.label}</span>
              {item.badge && (
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold
                  ${item.badge === "Promo" ? "bg-red-100 text-red-600"
                    : item.badge === "New" ? "bg-blue-100 text-blue-600"
                    : item.badge === "IA" ? "bg-purple-100 text-purple-600"
                    : item.badge === "VIP" ? "bg-amber-100 text-amber-600"
                    : "bg-shifaa-green/10 text-shifaa-green"}`}>
                  {item.badge}
                </span>
              )}
            </Link>
          ))}

          <Link href="/service-client"
            className="block py-3 text-sm font-medium text-shifaa-green border-b border-shifaa-border"
            onClick={() => setMobileOpen(false)}>
            Service client
          </Link>

          <div className="mt-4 border-t border-shifaa-border pt-4">
            <SocialLinks variant="header" />
          </div>
        </nav>
      )}
    </header>
  );
}
