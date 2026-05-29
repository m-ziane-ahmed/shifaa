"use client";

import { useCart } from "@/context/CartContext";

export function CartBadge() {
  const { count, openDrawer } = useCart();
  return (
    <button
      type="button"
      onClick={openDrawer}
      className="relative rounded-full p-2 text-white hover:bg-white/10"
      aria-label="Panier"
    >
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-shifaa-lime px-1 text-[10px] font-bold text-shifaa-header">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
