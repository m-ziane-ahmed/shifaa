"use client";

import { ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { WishlistButton } from "@/components/WishlistButton";

export function ProductQuickActions({ product }: { product: Product }) {
  const { addItem, openDrawer } = useCart();
  const { showToast } = useToast();

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!product.inStock) return;
    addItem(product, 1);
    showToast(`${product.name} ajouté au panier`);
    openDrawer();
  }

  return (
    <div className="mt-3 flex items-center gap-2">
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
        <span className="flex-1 text-center text-xs font-medium text-amber-700">Rupture</span>
      )}
      <WishlistButton productId={product.id} size="sm" className="border border-shifaa-border bg-white" />
    </div>
  );
}
