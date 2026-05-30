"use client";

import { ShoppingBag, Heart, Scale, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { useWishlist } from "@/context/WishlistContext";
import { useCompare, COMPARE_MAX } from "@/context/CompareContext";

export function ProductQuickActions({ product }: { product: Product }) {
  const { addItem, openDrawer } = useCart();
  const { showToast } = useToast();
  const { isWishlisted, toggle: toggleWishlist } = useWishlist();
  const { add: addCompare, remove: removeCompare, isInCompare, ids } = useCompare();

  const wishlisted = isWishlisted(product.id);
  const inCompare = isInCompare(product.id);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;
    addItem(product, 1);
    showToast(`${product.name} ajouté au panier`);
    openDrawer();
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
    showToast(wishlisted ? "Retiré des favoris" : "Ajouté aux favoris");
  }

  function handleCompare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (inCompare) {
      removeCompare(product.id);
      showToast("Retiré du comparateur");
    } else if (ids.length >= COMPARE_MAX) {
      showToast(`Maximum ${COMPARE_MAX} produits à comparer`);
    } else {
      addCompare(product.id);
      showToast("Ajouté au comparateur");
    }
  }

  function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/produit/${product.slug}`;
    if (navigator.share) {
      navigator.share({ title: product.name, url });
    } else {
      navigator.clipboard.writeText(url);
      showToast("Lien copié !");
    }
  }

  return (
    <div className="mt-3 space-y-2">
      {/* Bouton panier principal */}
      <div className="flex items-center gap-2">
        {product.inStock ? (
          <button
            type="button"
            onClick={handleAdd}
            className="btn-primary flex flex-1 items-center justify-center gap-2 py-2 text-sm"
          >
            <ShoppingBag className="h-4 w-4" />
            Ajouter
          </button>
        ) : (
          <span className="flex-1 text-center text-xs font-medium text-amber-700">Rupture de stock</span>
        )}

        {/* Favoris */}
        <button
          type="button"
          onClick={handleWishlist}
          className={cn(
            "rounded-full border p-2 transition-colors",
            wishlisted
              ? "border-red-200 bg-red-50 text-red-500"
              : "border-shifaa-border bg-white text-shifaa-muted hover:border-red-200 hover:text-red-400"
          )}
          aria-label={wishlisted ? "Retirer des favoris" : "Ajouter aux favoris"}
          title={wishlisted ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <Heart className={cn("h-4 w-4", wishlisted && "fill-current")} />
        </button>
      </div>

      {/* Actions secondaires : comparer + partager */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleCompare}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-full border py-1.5 text-xs font-medium transition-colors",
            inCompare
              ? "border-shifaa-green bg-shifaa-lime/20 text-shifaa-green"
              : "border-shifaa-border text-shifaa-muted hover:border-shifaa-green hover:text-shifaa-green"
          )}
          title={inCompare ? "Retirer du comparateur" : "Ajouter au comparateur"}
        >
          <Scale className="h-3.5 w-3.5" />
          {inCompare ? "Comparé" : "Comparer"}
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-1.5 rounded-full border border-shifaa-border px-3 py-1.5 text-xs text-shifaa-muted transition-colors hover:border-shifaa-green hover:text-shifaa-green"
          title="Partager ce produit"
        >
          <Share2 className="h-3.5 w-3.5" />
          Partager
        </button>
      </div>
    </div>
  );
}
