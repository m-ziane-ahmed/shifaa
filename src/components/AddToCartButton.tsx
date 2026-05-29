"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { formatDZD } from "@/lib/utils";
import { WishlistButton } from "@/components/WishlistButton";
import { CompareButton } from "@/components/CompareButton";

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem, openDrawer } = useCart();
  const { showToast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd(openMiniCart = true) {
    if (!product.inStock) return;
    addItem(product, quantity);
    setAdded(true);
    showToast(`${quantity} × ${product.name} ajouté au panier`);
    if (openMiniCart) openDrawer();
    setTimeout(() => setAdded(false), 2000);
  }

  if (!product.inStock) {
    return (
      <button type="button" disabled className="btn-primary cursor-not-allowed opacity-50">
        Indisponible
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center rounded-xl border border-shifaa-border">
        <button
          type="button"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="px-3 py-2 text-lg hover:bg-shifaa-cream"
          aria-label="Diminuer"
        >
          −
        </button>
        <span className="min-w-[2rem] text-center text-sm font-medium">{quantity}</span>
        <button
          type="button"
          onClick={() => setQuantity((q) => q + 1)}
          className="px-3 py-2 text-lg hover:bg-shifaa-cream"
          aria-label="Augmenter"
        >
          +
        </button>
      </div>
      <button type="button" onClick={() => handleAdd(true)} className="btn-primary">
        {added ? "Ajouté ✓" : "Ajouter au panier"}
      </button>
      <WishlistButton productId={product.id} className="border border-shifaa-border" />
      <CompareButton productId={product.id} />
    </div>
  );
}

export function ProductStickyBar({ product }: { product: Product }) {
  const { addItem, openDrawer } = useCart();
  const { showToast } = useToast();

  if (!product.inStock) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-shifaa-border bg-white p-3 shadow-lg md:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{product.name}</p>
          <p className="font-semibold text-shifaa-green">{formatDZD(product.price)}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            addItem(product, 1);
            showToast("Ajouté au panier");
            openDrawer();
          }}
          className="btn-primary shrink-0 py-2.5"
        >
          Ajouter
        </button>
      </div>
    </div>
  );
}
