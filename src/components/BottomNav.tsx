"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Search, Heart, ShoppingBag, User } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useSearch } from "@/context/SearchContext";

const NAV_ITEMS = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/boutique", label: "Catégories", icon: LayoutGrid },
  { href: null, label: "Recherche", icon: Search, action: "search" },
  { href: "/compte/favoris", label: "Favoris", icon: Heart },
  { href: "/panier", label: "Panier", icon: ShoppingBag },
  { href: "/compte", label: "Compte", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const { items } = useCart();
  const { ids: wishlistIds } = useWishlist();
  const { openSearch } = useSearch();

  const cartCount = items.reduce((s, i) => s + i.quantity, 0);
  const wishCount = wishlistIds.length;

  // Masquer sur l'admin et le checkout
  if (pathname.startsWith("/admin") || pathname.startsWith("/commande")) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-400 bg-white pb-safe md:hidden"
      aria-label="Navigation principale mobile"
    >
      <div className="grid grid-cols-6">
        {NAV_ITEMS.map(({ href, label, icon: Icon, action }) => {
          const isActive = href ? (href === "/" ? pathname === "/" : pathname.startsWith(href)) : false;
          const count = href === "/panier" ? cartCount : href === "/compte/favoris" ? wishCount : 0;

          if (action === "search") {
            return (
              <button
                key="search"
                type="button"
                onClick={openSearch}
                className="flex flex-col items-center justify-center gap-1 py-2.5 text-shifaa-muted hover:text-shifaa-green transition-colors active:scale-95"
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-medium">{label}</span>
              </button>
            );
          }

          return (
            <Link
              key={href}
              href={href!}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 transition-colors active:scale-95 ${
                isActive ? "text-shifaa-green" : "text-shifaa-muted hover:text-shifaa-green"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${isActive ? "stroke-[2.5]" : ""}`} />
                {count > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-shifaa-green text-[9px] font-bold text-white">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? "text-shifaa-green" : ""}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
