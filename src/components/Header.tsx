"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
  ChevronDown, ChevronRight, Search, Menu, X,
  User, Phone, Mail, Sparkles, Tag, Bell, Zap,
  FlaskConical, Award, BookOpen, Heart
} from "lucide-react";
import { CartBadge } from "@/components/CartBadge";
import { ShifaaLogo } from "@/components/ShifaaLogo";
import { SearchAutocomplete } from "@/components/SearchAutocomplete";
import { WishlistBadge } from "@/components/WishlistBadge";
import { CompareBadge } from "@/components/CompareBadge";
import { CATEGORIES, BESOINS } from "@/data/categories";
import { SITE } from "@/lib/site";
import { SocialLinks } from "@/components/SocialLinks";

// ── Marques ───────────────────────────────────────────────
const MARQUES_ALPHA: Record<string, string[]> = {
  A: ["Avène", "Acorelle", "Alphanova"],
  B: ["Bioderma", "Bio Oil", "Burt's Bees"],
  C: ["Cétaphil", "Compeed", "CeraVe"],
  D: ["Ducray", "Dexeryl"],
  E: ["Eucerin", "Eau Thermale Jonzac"],
  L: ["La Roche-Posay", "Lierac"],
  M: ["Mustela", "Magnolia", "Melvita"],
  S: ["SVR", "Saugella", "Sebamed"],
  U: ["Uriage"],
  V: ["Vichy", "Vea"],
};
const MARQUES_TOP = [
  { label: "Avène", desc: "Soins dermatologiques", href: "/boutique?marque=Av%C3%A8ne" },
  { label: "Bioderma", desc: "Hygiène & soins", href: "/boutique?marque=Bioderma" },
  { label: "Uriage", desc: "Eau thermale", href: "/boutique?marque=Uriage" },
  { label: "La Roche-Posay", desc: "Peaux sensibles", href: "/boutique?marque=La+Roche-Posay" },
  { label: "Mustela", desc: "Bébé & maternité", href: "/boutique?marque=Mustela" },
  { label: "Vichy", desc: "Soins experts", href: "/boutique?marque=Vichy" },
];

// ── Diagnostics ───────────────────────────────────────────
const DIAGNOSTICS = [
  { icon: "🌸", label: "Diagnostic peau", sub: "Type, hydratation, acné…", href: "/diagnostic?type=peau" },
  { icon: "💇", label: "Diagnostic cheveux", sub: "Chute, sécheresse, cuir chevelu", href: "/diagnostic?type=cheveux" },
  { icon: "👶", label: "Diagnostic bébé", sub: "Soins adaptés au nourrisson", href: "/diagnostic?type=bebe" },
  { icon: "☀️", label: "Diagnostic bien-être", sub: "Objectifs santé & vitalité", href: "/diagnostic?type=bien-etre" },
  { icon: "🌞", label: "Diagnostic solaire", sub: "Phototype & protection", href: "/diagnostic?type=solaire" },
];

// ── Fidélité ──────────────────────────────────────────────
const FIDELITE_ITEMS = [
  { icon: "⭐", label: "Mes points", sub: "Solde et historique", href: "/compte/fidelite" },
  { icon: "🎁", label: "Mes récompenses", sub: "Coupons et avantages", href: "/compte/fidelite#recompenses" },
  { icon: "🤝", label: "Parrainage", sub: "Invitez un ami, gagnez 150 pts", href: "/compte/fidelite#parrainage" },
  { icon: "👑", label: "Offres VIP", sub: "Réservées aux membres Gold+", href: "/compte/fidelite#vip" },
  { icon: "🥇", label: "Niveaux fidélité", sub: "Découverte → Silver → Gold → VIP", href: "/compte/fidelite#niveaux" },
];

// ── Conseils & Expertise ──────────────────────────────────
const CONSEILS_ITEMS = [
  { icon: "📰", label: "Blog santé", sub: "Articles et actualités santé", href: "/conseils?categorie=sante" },
  { icon: "💄", label: "Conseils beauté", sub: "Routines et astuces experts", href: "/conseils?categorie=beaute" },
  { icon: "📖", label: "Guides d'achat", sub: "Comparatifs et sélections", href: "/conseils?categorie=guides" },
  { icon: "❓", label: "FAQ produits", sub: "Questions fréquentes", href: "/service-client#faq" },
  { icon: "🌱", label: "Nouveautés santé", sub: "Dernières tendances", href: "/nouveautes" },
  { icon: "🗓️", label: "Astuces saisonnières", sub: "Conseils selon la saison", href: "/conseils?categorie=saison" },
];

// ── Produits populaires par catégorie ────────────────────
const POPULAR_BY_CAT: Record<string, Array<{ label: string; brand: string; href: string }>> = {
  "visage-peau": [
    { label: "Crème hydratante", brand: "Avène", href: "/boutique?q=crème+hydratante" },
    { label: "Sérum Vitamine C", brand: "SVR", href: "/boutique?q=sérum+vitamine+c" },
    { label: "SPF 50+ Photoderm", brand: "Bioderma", href: "/boutique?q=spf50" },
    { label: "Gel Nettoyant Doux", brand: "SVR", href: "/boutique?q=gel+nettoyant" },
  ],
  "cheveux": [
    { label: "Shampoing anti-chute", brand: "Vichy", href: "/boutique?q=shampoing+anti-chute" },
    { label: "Masque capillaire", brand: "Uriage", href: "/boutique?q=masque+capillaire" },
    { label: "Huile nourrissante", brand: "Bioderma", href: "/boutique?q=huile+cheveux" },
  ],
  "bebe-maternite": [
    { label: "Lingettes bébé", brand: "Mustela", href: "/boutique?q=lingettes" },
    { label: "Crème change", brand: "Mustela", href: "/boutique?q=crème+change" },
    { label: "Lait corps bébé", brand: "Avène", href: "/boutique?q=lait+bébé" },
  ],
  "complements": [
    { label: "Vitamine C 1000mg", brand: "Lab", href: "/boutique?q=vitamine+c" },
    { label: "Magnésium marin", brand: "Lab", href: "/boutique?q=magnésium" },
    { label: "Oméga 3", brand: "Lab", href: "/boutique?q=oméga+3" },
  ],
};

const PRODUCT_CATS = CATEGORIES.filter((c) => c.slug !== "marques" && c.slug !== "offres");

type MegaId = "categories" | "marques" | "besoins" | "diagnostic" | "fidelite" | "conseils" | null;

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeMega, setActiveMega] = useState<MegaId>(null);
  const [activeCatTab, setActiveCatTab] = useState<string>(PRODUCT_CATS[0]?.slug ?? "");
  const [mobileExpandedCat, setMobileExpandedCat] = useState(false);
  const [mobileExpandedNeed, setMobileExpandedNeed] = useState(false);
  const megaTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setActiveMega(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function openMega(id: MegaId) {
    if (megaTimeout.current) clearTimeout(megaTimeout.current);
    setActiveMega(id);
  }
  function closeMega() {
    megaTimeout.current = setTimeout(() => setActiveMega(null), 180);
  }

  const activeCat = PRODUCT_CATS.find((c) => c.slug === activeCatTab);
  const popularProducts = POPULAR_BY_CAT[activeCatTab];
  const marquesByCat = MARQUES_TOP.slice(0, 4);

  return (
    <header id="site-header" ref={headerRef}
      className="fixed top-0 left-0 right-0 z-50 bg-white text-shifaa-ink shadow-sm border-b border-shifaa-border">

      {/* ── Barre supérieure ─────────────────────────────── */}
      <div className="border-b border-shifaa-border bg-gray-50 px-4 py-1.5">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-4">
          <div className="flex flex-wrap items-center gap-x-4 text-xs text-shifaa-muted">
            <a href={`tel:${SITE.phoneTel}`} className="inline-flex items-center gap-1 hover:text-shifaa-green transition-colors">
              <Phone className="h-3 w-3" />{SITE.phone}
            </a>
            <a href={`mailto:${SITE.email}`} className="inline-flex items-center gap-1 hover:text-shifaa-green transition-colors">
              <Mail className="h-3 w-3" />{SITE.email}
            </a>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">{SITE.hoursShort}</span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline font-medium text-shifaa-green">🚚 Livraison nationale · Paiement sécurisé</span>
          </div>
          <SocialLinks variant="header" />
        </div>
      </div>

      {/* ── Barre principale ─────────────────────────────── */}
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <button type="button" className="text-shifaa-ink md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu" aria-expanded={mobileOpen}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        <ShifaaLogo compactOnMobile />

        <div className="hidden flex-1 md:block">
          <SearchAutocomplete />
        </div>

        {/* CTA "Trouver mon produit" */}
        <Link href="/diagnostic"
          className="hidden lg:flex items-center gap-1.5 rounded-xl bg-shifaa-green px-4 py-2 text-sm font-semibold text-white hover:bg-shifaa-dark transition-colors shrink-0">
          <Zap className="h-4 w-4" />
          Trouver mon produit
        </Link>

        {/* Icônes */}
        <div className="ml-auto flex items-center gap-1 md:gap-2 md:ml-0">
          <button type="button" className="rounded-full p-2 text-shifaa-ink hover:bg-gray-100 md:hidden"
            onClick={() => setSearchOpen(!searchOpen)}>
            <Search className="h-5 w-5" />
          </button>
          <WishlistBadge />
          <CompareBadge />
          <Link href="/compte" className="relative rounded-full p-2 text-shifaa-ink hover:bg-gray-100" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </Link>
          <Link href="/compte" className="rounded-full p-2 text-shifaa-ink hover:bg-gray-100" aria-label="Compte">
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

      {/* ── Navigation desktop ────────────────────────────── */}
      <nav className="hidden border-t border-shifaa-border md:block" aria-label="Navigation principale">
        <div className="mx-auto flex max-w-7xl items-center px-4 overflow-x-auto">

          {/* ─ CATÉGORIES ─ */}
          <div onMouseEnter={() => openMega("categories")} onMouseLeave={closeMega} className="relative">
            <button type="button" onClick={() => setActiveMega(activeMega === "categories" ? null : "categories")}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold transition-colors
                ${activeMega === "categories" ? "text-shifaa-green" : "text-shifaa-ink hover:text-shifaa-green"}`}>
              Catégories
              <ChevronDown className={`h-4 w-4 transition-transform ${activeMega === "categories" ? "rotate-180" : ""}`} />
            </button>

            {activeMega === "categories" && (
              <div className="absolute left-0 top-full z-50 w-[960px] rounded-2xl border border-shifaa-border bg-white shadow-2xl overflow-hidden">
                <div className="flex">
                  {/* Col 1 — Catégories */}
                  <div className="w-52 shrink-0 border-r border-shifaa-border py-3 bg-gray-50">
                    <p className="px-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-shifaa-muted">Catégories</p>
                    {PRODUCT_CATS.map((cat) => (
                      <button key={cat.slug} type="button"
                        onMouseEnter={() => setActiveCatTab(cat.slug)}
                        onClick={() => setActiveMega(null)}
                        className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-sm transition-colors
                          ${activeCatTab === cat.slug ? "bg-white text-shifaa-green font-semibold border-r-2 border-shifaa-green" : "text-shifaa-ink hover:bg-white hover:text-shifaa-green"}`}>
                        <span className="text-base">{cat.icon}</span>
                        <span className="flex-1 truncate">{cat.label}</span>
                        <ChevronRight className="h-3.5 w-3.5 text-shifaa-muted shrink-0" />
                      </button>
                    ))}
                    <div className="mx-4 my-2 border-t border-shifaa-border" />
                    <Link href="/promotions" onClick={() => setActiveMega(null)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-white transition-colors">
                      <Tag className="h-4 w-4" />Promotions
                      <span className="ml-auto rounded-full bg-red-100 px-1.5 text-[10px]">Promo</span>
                    </Link>
                    <Link href="/nouveautes" onClick={() => setActiveMega(null)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-blue-600 hover:bg-white transition-colors">
                      <Sparkles className="h-4 w-4" />Nouveautés
                      <span className="ml-auto rounded-full bg-blue-100 px-1.5 text-[10px]">New</span>
                    </Link>
                  </div>

                  {/* Col 2 — Sous-catégories */}
                  <div className="flex-1 p-4">
                    {activeCat && (
                      <>
                        <div className="mb-3 flex items-center justify-between">
                          <p className="text-xs font-bold uppercase tracking-widest text-shifaa-muted">{activeCat.label}</p>
                          <Link href={activeCat.href} onClick={() => setActiveMega(null)} className="text-xs font-medium text-shifaa-green hover:underline">Voir tout →</Link>
                        </div>
                        {activeCat.subcategories && activeCat.subcategories.length > 0 && (
                          <div className="grid grid-cols-2 gap-1 mb-4">
                            {activeCat.subcategories.map((sub) => (
                              <Link key={sub.slug} href={sub.href} onClick={() => setActiveMega(null)}
                                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-shifaa-ink hover:bg-gray-50 hover:text-shifaa-green transition-colors">
                                <span className="text-base">{sub.icon}</span>
                                <span className="font-medium truncate">{sub.label}</span>
                              </Link>
                            ))}
                          </div>
                        )}
                        {activeCat.popularSearches && (
                          <>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-shifaa-muted mb-2">Recherches populaires</p>
                            <div className="flex flex-wrap gap-1.5">
                              {activeCat.popularSearches.map((s) => (
                                <Link key={s} href={`/boutique?q=${encodeURIComponent(s)}`} onClick={() => setActiveMega(null)}
                                  className="rounded-full bg-gray-100 px-3 py-1 text-xs hover:bg-shifaa-green hover:text-white transition-colors">
                                  {s}
                                </Link>
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>

                  {/* Col 3 — Top produits */}
                  <div className="w-44 shrink-0 border-l border-shifaa-border p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-shifaa-muted mb-3">Top produits</p>
                    {(popularProducts ?? []).map((p) => (
                      <Link key={p.label} href={p.href} onClick={() => setActiveMega(null)}
                        className="flex flex-col rounded-xl p-2 hover:bg-gray-50 transition-colors group mb-1">
                        <span className="text-xs font-semibold text-shifaa-ink group-hover:text-shifaa-green truncate">{p.label}</span>
                        <span className="text-[10px] text-shifaa-muted">{p.brand}</span>
                      </Link>
                    ))}
                    {(popularProducts?.length ?? 0) === 0 && (
                      <p className="text-xs text-shifaa-muted">Survolez une catégorie</p>
                    )}
                    <div className="mt-3 pt-3 border-t border-shifaa-border">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-shifaa-muted mb-2">Marques</p>
                      <div className="flex flex-wrap gap-1">
                        {marquesByCat.map((m) => (
                          <Link key={m.label} href={m.href} onClick={() => setActiveMega(null)}
                            className="rounded-full border border-shifaa-border px-2 py-0.5 text-[10px] hover:border-shifaa-green hover:text-shifaa-green transition-colors">
                            {m.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Col 4 — Besoins + promo */}
                  <div className="w-44 shrink-0 border-l border-shifaa-border bg-gray-50 flex flex-col">
                    <div className="p-4 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-shifaa-muted mb-3">Mon besoin</p>
                      {BESOINS.slice(0, 8).map((b) => (
                        <Link key={b.slug} href={b.href} onClick={() => setActiveMega(null)}
                          className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs hover:bg-white hover:text-shifaa-green transition-colors">
                          <span>{b.icon}</span><span className="font-medium">{b.label}</span>
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-shifaa-border p-3">
                      <div className="rounded-xl bg-shifaa-green p-3 text-center">
                        <p className="text-[10px] font-bold text-white/80 uppercase">🎁 Offre du moment</p>
                        <p className="text-xs font-semibold text-white mt-1">-15% sur les solaires</p>
                        <Link href="/promotions" onClick={() => setActiveMega(null)}
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

          {/* ─ MARQUES ─ */}
          <div onMouseEnter={() => openMega("marques")} onMouseLeave={closeMega} className="relative">
            <button type="button" onClick={() => setActiveMega(activeMega === "marques" ? null : "marques")}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors
                ${activeMega === "marques" ? "text-shifaa-green" : "text-shifaa-ink hover:text-shifaa-green"}`}>
              Marques <ChevronDown className={`h-4 w-4 transition-transform ${activeMega === "marques" ? "rotate-180" : ""}`} />
            </button>
            {activeMega === "marques" && (
              <div className="absolute left-0 top-full z-50 w-[640px] rounded-2xl border border-shifaa-border bg-white shadow-2xl overflow-hidden">
                <div className="flex">
                  {/* Top marques */}
                  <div className="w-56 border-r border-shifaa-border p-4 bg-gray-50">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-shifaa-muted mb-3">Top marques</p>
                    {MARQUES_TOP.map((m) => (
                      <Link key={m.label} href={m.href} onClick={() => setActiveMega(null)}
                        className="flex flex-col rounded-xl px-3 py-2.5 hover:bg-white hover:text-shifaa-green transition-colors group mb-0.5">
                        <span className="text-sm font-semibold text-shifaa-ink group-hover:text-shifaa-green">{m.label}</span>
                        <span className="text-xs text-shifaa-muted">{m.desc}</span>
                      </Link>
                    ))}
                    <div className="mt-3 pt-3 border-t border-shifaa-border">
                      <Link href="/boutique?view=marques" onClick={() => setActiveMega(null)}
                        className="flex items-center justify-center gap-1 rounded-xl bg-shifaa-green py-2 text-xs font-bold text-white hover:bg-shifaa-dark transition-colors">
                        Voir toutes les marques →
                      </Link>
                    </div>
                  </div>
                  {/* Filtre alphabétique */}
                  <div className="flex-1 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-shifaa-muted mb-3">Par lettre</p>
                    <div className="space-y-3">
                      {Object.entries(MARQUES_ALPHA).map(([letter, brands]) => (
                        <div key={letter} className="flex items-start gap-3">
                          <span className="w-5 shrink-0 text-sm font-bold text-shifaa-green">{letter}</span>
                          <div className="flex flex-wrap gap-1.5">
                            {brands.map((b) => (
                              <Link key={b} href={`/boutique?marque=${encodeURIComponent(b)}`} onClick={() => setActiveMega(null)}
                                className="rounded-full border border-shifaa-border px-3 py-1 text-xs hover:border-shifaa-green hover:text-shifaa-green transition-colors">
                                {b}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-shifaa-border grid grid-cols-2 gap-2">
                      <Link href="/boutique?view=marques&filter=nouveautes" onClick={() => setActiveMega(null)}
                        className="rounded-xl bg-blue-50 border border-blue-200 px-3 py-2 text-xs font-medium text-blue-700 text-center hover:bg-blue-100 transition-colors">
                        ✨ Nouveautés par marque
                      </Link>
                      <Link href="/promotions?view=marques" onClick={() => setActiveMega(null)}
                        className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs font-medium text-red-700 text-center hover:bg-red-100 transition-colors">
                        🎁 Promos par marque
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ─ PROMOTIONS ─ */}
          <Link href="/promotions" className="flex items-center px-3 py-3 text-xs font-medium text-red-600 hover:text-red-700 transition-colors whitespace-nowrap">
            Promotions
          </Link>

          {/* ─ NOUVEAUTÉS ─ */}
          <Link href="/nouveautes" className="flex items-center px-3 py-3 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors whitespace-nowrap">
            Nouveautés
          </Link>

          {/* ─ MES BESOINS ─ */}
          <div onMouseEnter={() => openMega("besoins")} onMouseLeave={closeMega} className="relative">
            <button type="button" onClick={() => setActiveMega(activeMega === "besoins" ? null : "besoins")}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap
                ${activeMega === "besoins" ? "text-shifaa-green" : "text-shifaa-ink hover:text-shifaa-green"}`}>
              <Heart className="h-4 w-4" />Mes besoins
              <ChevronDown className={`h-4 w-4 transition-transform ${activeMega === "besoins" ? "rotate-180" : ""}`} />
            </button>
            {activeMega === "besoins" && (
              <div className="absolute left-0 top-full z-50 w-[480px] rounded-2xl border border-shifaa-border bg-white shadow-2xl p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-shifaa-muted mb-3">
                  Je cherche un produit pour…
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {BESOINS.map((b) => (
                    <Link key={b.slug} href={b.href} onClick={() => setActiveMega(null)}
                      className="flex items-center gap-3 rounded-xl border border-shifaa-border px-3 py-3 hover:border-shifaa-green hover:bg-shifaa-lime/10 transition-colors group">
                      <span className="text-xl">{b.icon}</span>
                      <span className="text-sm font-medium text-shifaa-ink group-hover:text-shifaa-green">{b.label}</span>
                    </Link>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-shifaa-border">
                  <Link href="/diagnostic" onClick={() => setActiveMega(null)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-shifaa-green py-2.5 text-sm font-bold text-white hover:bg-shifaa-dark transition-colors">
                    <Zap className="h-4 w-4" />
                    Je ne sais pas — Faire mon diagnostic
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* ─ DIAGNOSTIC IA ─ */}
          <div onMouseEnter={() => openMega("diagnostic")} onMouseLeave={closeMega} className="relative">
            <button type="button" onClick={() => setActiveMega(activeMega === "diagnostic" ? null : "diagnostic")}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap
                ${activeMega === "diagnostic" ? "text-purple-600" : "text-purple-600 hover:text-purple-700"}`}>
              <FlaskConical className="h-4 w-4" />Diagnostic IA
              <span className="rounded-full bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold">IA</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${activeMega === "diagnostic" ? "rotate-180" : ""}`} />
            </button>
            {activeMega === "diagnostic" && (
              <div className="absolute left-0 top-full z-50 w-[500px] rounded-2xl border border-shifaa-border bg-white shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-shifaa-lime/10 px-5 py-4 border-b border-shifaa-border">
                  <p className="font-semibold text-shifaa-ink">🧠 Diagnostic IA personnalisé</p>
                  <p className="text-xs text-shifaa-muted mt-0.5">Répondez à 4 questions — obtenez vos recommandations en 60 secondes</p>
                </div>
                <div className="p-4 grid grid-cols-1 gap-2">
                  {DIAGNOSTICS.map((d) => (
                    <Link key={d.href} href={d.href} onClick={() => setActiveMega(null)}
                      className="flex items-center gap-3 rounded-xl border border-shifaa-border px-4 py-3 hover:border-shifaa-green hover:bg-shifaa-lime/10 transition-colors group">
                      <span className="text-2xl">{d.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-shifaa-ink group-hover:text-shifaa-green">{d.label}</p>
                        <p className="text-xs text-shifaa-muted">{d.sub}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-shifaa-muted ml-auto shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ─ CONSEILS & EXPERTISE ─ */}
          <div onMouseEnter={() => openMega("conseils")} onMouseLeave={closeMega} className="relative">
            <button type="button" onClick={() => setActiveMega(activeMega === "conseils" ? null : "conseils")}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap
                ${activeMega === "conseils" ? "text-shifaa-green" : "text-shifaa-ink hover:text-shifaa-green"}`}>
              <BookOpen className="h-4 w-4" />Conseils & Expertise
              <ChevronDown className={`h-4 w-4 transition-transform ${activeMega === "conseils" ? "rotate-180" : ""}`} />
            </button>
            {activeMega === "conseils" && (
              <div className="absolute left-0 top-full z-50 w-[420px] rounded-2xl border border-shifaa-border bg-white shadow-2xl p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-shifaa-muted mb-3">Notre hub expert</p>
                <div className="space-y-1.5">
                  {CONSEILS_ITEMS.map((c) => (
                    <Link key={c.href} href={c.href} onClick={() => setActiveMega(null)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-gray-50 hover:text-shifaa-green transition-colors group">
                      <span className="text-xl">{c.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-shifaa-ink group-hover:text-shifaa-green">{c.label}</p>
                        <p className="text-xs text-shifaa-muted">{c.sub}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ─ FIDÉLITÉ ─ */}
          <div onMouseEnter={() => openMega("fidelite")} onMouseLeave={closeMega} className="relative">
            <button type="button" onClick={() => setActiveMega(activeMega === "fidelite" ? null : "fidelite")}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap
                ${activeMega === "fidelite" ? "text-amber-600" : "text-amber-600 hover:text-amber-700"}`}>
              <Award className="h-4 w-4" />Fidélité
              <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">VIP</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${activeMega === "fidelite" ? "rotate-180" : ""}`} />
            </button>
            {activeMega === "fidelite" && (
              <div className="absolute right-0 top-full z-50 w-[380px] rounded-2xl border border-shifaa-border bg-white shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-4 border-b border-shifaa-border">
                  <p className="font-semibold text-shifaa-ink flex items-center gap-2">
                    <Award className="h-5 w-5 text-amber-500" />Programme Fidélité Shifaa
                  </p>
                  <p className="text-xs text-shifaa-muted mt-0.5">Cumulez des points à chaque achat</p>
                </div>
                <div className="p-4 space-y-1.5">
                  {FIDELITE_ITEMS.map((f) => (
                    <Link key={f.href} href={f.href} onClick={() => setActiveMega(null)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-amber-50 transition-colors group">
                      <span className="text-xl">{f.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-shifaa-ink group-hover:text-amber-700">{f.label}</p>
                        <p className="text-xs text-shifaa-muted">{f.sub}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="border-t border-shifaa-border p-4">
                  <div className="grid grid-cols-5 gap-1 text-center">
                    {["🌱 Découverte", "🥈 Silver", "🥇 Gold", "💎 Platinum", "👑 Premium"].map((l) => (
                      <div key={l} className="rounded-lg bg-gray-50 p-1.5 text-[9px] font-semibold text-shifaa-muted">{l}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link href="/service-client"
            className="ml-auto px-3 py-3 text-xs font-semibold text-shifaa-green hover:text-shifaa-dark whitespace-nowrap">
            Aide
          </Link>
        </div>
      </nav>

      {/* ── Menu mobile ─────────────────────────────────────── */}
      {mobileOpen && (
        <nav className="border-t border-shifaa-border bg-white max-h-[85vh] overflow-y-auto px-4 py-4 md:hidden">
          <div className="mb-4">
            <SearchAutocomplete onSelect={() => setMobileOpen(false)} />
          </div>

          <Link href="/diagnostic" onClick={() => setMobileOpen(false)}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-shifaa-green py-3 text-sm font-semibold text-white">
            <Zap className="h-4 w-4" />Trouver mon produit · Diagnostic gratuit
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
                    <span className="text-base">{cat.icon}</span>{cat.label}
                  </Link>
                  {cat.subcategories && cat.subcategories.length > 0 && (
                    <div className="ml-8 mb-1 space-y-0.5">
                      {cat.subcategories.map((sub) => (
                        <Link key={sub.slug} href={sub.href} onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-1.5 py-1.5 text-xs text-shifaa-muted hover:text-shifaa-green transition-colors">
                          <span>{sub.icon}</span>{sub.label}
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
                  className="rounded-full border border-shifaa-border px-3 py-1 text-xs hover:border-shifaa-green hover:text-shifaa-green transition-colors">
                  {m.label}
                </Link>
              ))}
              <Link href="/boutique?view=marques" onClick={() => setMobileOpen(false)}
                className="rounded-full border border-shifaa-green text-shifaa-green px-3 py-1 text-xs font-medium">
                Voir toutes →
              </Link>
            </div>
          </div>

          {/* Mon besoin mobile */}
          <button type="button" onClick={() => setMobileExpandedNeed(!mobileExpandedNeed)}
            className="flex w-full items-center justify-between py-3 text-sm font-semibold text-shifaa-ink border-b border-shifaa-border">
            <span>Mes besoins</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${mobileExpandedNeed ? "rotate-180" : ""}`} />
          </button>
          {mobileExpandedNeed && (
            <div className="mb-2 grid grid-cols-2 gap-1.5 pt-2">
              {BESOINS.map((b) => (
                <Link key={b.slug} href={b.href} onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5 text-sm hover:bg-shifaa-green hover:text-white transition-colors">
                  <span>{b.icon}</span><span className="text-xs font-medium">{b.label}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Diagnostics mobile */}
          <div className="border-b border-shifaa-border py-3">
            <p className="text-xs font-bold text-shifaa-muted uppercase tracking-wide mb-2 flex items-center gap-1">
              <FlaskConical className="h-3.5 w-3.5 text-purple-500" />Diagnostic IA
            </p>
            <div className="space-y-1">
              {DIAGNOSTICS.map((d) => (
                <Link key={d.href} href={d.href} onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 py-2 text-sm text-shifaa-ink hover:text-shifaa-green transition-colors">
                  <span>{d.icon}</span>{d.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Fidélité mobile */}
          <div className="border-b border-shifaa-border py-3">
            <p className="text-xs font-bold text-shifaa-muted uppercase tracking-wide mb-2 flex items-center gap-1">
              <Award className="h-3.5 w-3.5 text-amber-500" />Fidélité & récompenses
            </p>
            <div className="space-y-1">
              {FIDELITE_ITEMS.map((f) => (
                <Link key={f.href} href={f.href} onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 py-2 text-sm text-shifaa-ink hover:text-shifaa-green transition-colors">
                  <span>{f.icon}</span>{f.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Conseils */}
          <div className="border-b border-shifaa-border py-3">
            <p className="text-xs font-bold text-shifaa-muted uppercase tracking-wide mb-2 flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5 text-shifaa-green" />Conseils & Expertise
            </p>
            <div className="space-y-1">
              {CONSEILS_ITEMS.map((c) => (
                <Link key={c.href} href={c.href} onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 py-2 text-sm text-shifaa-ink hover:text-shifaa-green transition-colors">
                  <span>{c.icon}</span>{c.label}
                </Link>
              ))}
            </div>
          </div>

          <Link href="/promotions" onClick={() => setMobileOpen(false)}
            className="flex items-center justify-between py-3 text-sm font-medium text-red-600 border-b border-shifaa-border">
            <span>Promotions</span><span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold">Promo</span>
          </Link>
          <Link href="/nouveautes" onClick={() => setMobileOpen(false)}
            className="flex items-center justify-between py-3 text-sm font-medium text-blue-600 border-b border-shifaa-border">
            <span>Nouveautés</span><span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold">New</span>
          </Link>
          <Link href="/service-client" onClick={() => setMobileOpen(false)}
            className="block py-3 text-sm font-semibold text-shifaa-green">
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
