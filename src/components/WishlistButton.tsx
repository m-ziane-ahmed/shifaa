"use client";

import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/context/ToastContext";

type Props = {
  productId: string;
  className?: string;
  size?: "sm" | "md";
};

export function WishlistButton({ productId, className, size = "md" }: Props) {
  const { isWishlisted, toggle } = useWishlist();
  const { showToast } = useToast();
  const active = isWishlisted(productId);
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <button
      type="button"
      onClick={() => {
        toggle(productId);
        showToast(active ? "Retiré des favoris" : "Ajouté aux favoris");
      }}
      className={cn(
        "rounded-full transition",
        size === "sm" ? "p-1.5" : "p-2",
        active ? "text-red-500 hover:bg-red-50" : "text-shifaa-muted hover:bg-shifaa-cream hover:text-shifaa-green",
        className
      )}
      aria-label={active ? "Retirer des favoris" : "Ajouter aux favoris"}
    >
      <Heart className={cn(iconSize, active && "fill-current")} />
    </button>
  );
}
