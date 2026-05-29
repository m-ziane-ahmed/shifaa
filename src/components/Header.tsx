"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ChevronDown,
  Mail,
  Menu,
  Phone,
  Search,
  User,
  X,
} from "lucide-react";
import { CartBadge } from "@/components/CartBadge";
import { ShifaaLogo } from "@/components/ShifaaLogo";
import { SearchAutocomplete } from "@/components/SearchAutocomplete";
import { WishlistBadge } from "@/components/WishlistBadge";
import { CompareBadge } from "@/components/CompareBadge";
import { CATEGORIES } from "@/data/categories";
import { SITE } from "@/lib/site";
import { SocialLinks } from "@/components/SocialLinks";

const NAV = [
  { href: "/boutique", label: "Boutique" },
  { href: "/promotions", label: "Promotions" },
  { href: "/nouveautes", label: "Nouveautés" },
  { href: "/conseils", label: "Conseils" },
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-shifaa-dark text-white shadow-md">
      <div className="border-b border-white/10 px-4 py-2">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs md:justify-between md:text-sm">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <a
              href={`tel:${SITE.phoneTel}`}
              className="inline-flex items-center gap-1.5 hover:text-shifaa-lime"
            >
              <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {SITE.phone}
            </a>
            <a
              href={`mailto:${SITE.email}`}
              className="inline-flex items-center gap-1.5 hover:text-shifaa-lime"
            >
              <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {SITE.email}
            </a>
            <span className="hidden text-white/60 sm:inline">·</span>
            <span className="text-white/80">{SITE.hoursShort}</span>
          </div>
          <SocialLinks variant="header" />
        </div>
      </div>

      <div className="border-b border-white/10 px-4 py-2 text-center text-xs text-white/80 md:text-sm">
        Livraison dans toute l&apos;Algérie · Paiement sécurisé ·{" "}
        <Link href="/service-client" className="font-medium text-shifaa-lime hover:underline">
          Service client
        </Link>
      </div>

      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 md:px-6">
        <button
          type="button"
          className="text-white md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
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
          <Link
            href="/compte"
            className="rounded-full p-2 text-white hover:bg-white/10"
            aria-label="Mon compte"
          >
            <User className="h-5 w-5" />
          </Link>
          <CartBadge />
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-white/10 px-4 py-3 md:hidden">
          <SearchAutocomplete variant="mobile" onSelect={() => setSearchOpen(false)} />
        </div>
      )}

      <nav
        className="hidden border-t border-white/10 md:block"
        aria-label="Navigation principale"
      >
        <div className="mx-auto flex max-w-6xl items-center gap-1 px-6">
          <div className="group relative">
            <Link
              href="/boutique"
              className="flex items-center gap-1 px-4 py-3 text-sm font-medium text-white hover:text-shifaa-lime"
            >
              Catégories <ChevronDown className="h-4 w-4" />
            </Link>
            <div className="invisible absolute left-0 top-full z-50 w-[480px] rounded-2xl border border-white/15 bg-[#134840] p-4 opacity-0 shadow-lift transition group-hover:visible group-hover:opacity-100">
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.filter((c) => c.slug !== "marques" && c.slug !== "offres").map(
                  (cat) => (
                    <Link
                      key={cat.slug}
                      href={cat.href}
                      className="rounded-xl px-3 py-2 text-sm text-white/90 hover:bg-white/10 hover:text-shifaa-lime"
                    >
                      {cat.label}
                    </Link>
                  )
                )}
              </div>
            </div>
          </div>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-4 py-3 text-sm text-white/85 transition hover:text-shifaa-lime"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/service-client"
            className="ml-auto px-4 py-3 text-sm font-medium text-shifaa-lime"
          >
            Aide
          </Link>
        </div>
      </nav>

      {mobileOpen && (
        <nav
          className="border-t border-white/10 bg-shifaa-dark px-4 py-4 md:hidden"
          aria-label="Menu mobile"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block py-3 text-sm font-medium text-white"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/service-client"
            className="block py-3 text-sm text-shifaa-lime"
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
