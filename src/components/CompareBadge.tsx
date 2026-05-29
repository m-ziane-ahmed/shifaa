"use client";

import Link from "next/link";
import { Scale } from "lucide-react";
import { useCompare } from "@/context/CompareContext";

export function CompareBadge() {
  const { count } = useCompare();
  return (
    <Link
      href="/comparateur"
      className="relative rounded-full p-2 text-white hover:bg-white/10"
      aria-label="Comparateur"
    >
      <Scale className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-shifaa-lime px-1 text-[10px] font-bold text-shifaa-header">
          {count}
        </span>
      )}
    </Link>
  );
}
