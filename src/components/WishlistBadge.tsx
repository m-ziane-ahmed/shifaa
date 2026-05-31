"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";

export function WishlistBadge() {
  const { count } = useWishlist();
  return (
    <Link
      href="/compte/favoris"
      className="relative rounded-full p-2 text-shifaa-ink hover:bg-gray-100"
      aria-label="Favoris"
    >
      <Heart className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-shifaa-green px-1 text-[10px] font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
