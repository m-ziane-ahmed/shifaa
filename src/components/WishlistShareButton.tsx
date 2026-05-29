"use client";

import { Share2 } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/context/ToastContext";

export function WishlistShareButton() {
  const { ids } = useWishlist();
  const { showToast } = useToast();

  if (ids.length === 0) return null;

  function share() {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${base}/liste-partagee?ids=${ids.join(",")}`;
    if (navigator.share) {
      navigator.share({ title: "Ma liste Shifaa", url }).catch(() => copy(url));
    } else {
      copy(url);
    }
  }

  function copy(url: string) {
    navigator.clipboard.writeText(url).then(() => showToast("Lien copié"));
  }

  return (
    <button type="button" onClick={share} className="btn-secondary inline-flex items-center gap-2">
      <Share2 className="h-4 w-4" />
      Partager ma liste
    </button>
  );
}
