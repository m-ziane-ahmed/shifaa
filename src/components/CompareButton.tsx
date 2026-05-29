"use client";

import { Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompare, COMPARE_MAX } from "@/context/CompareContext";
import { useToast } from "@/context/ToastContext";

export function CompareButton({ productId, className }: { productId: string; className?: string }) {
  const { add, remove, isInCompare, ids } = useCompare();
  const { showToast } = useToast();
  const active = isInCompare(productId);

  return (
    <button
      type="button"
      onClick={() => {
        if (active) {
          remove(productId);
          showToast("Retiré du comparateur");
        } else if (ids.length >= COMPARE_MAX) {
          showToast(`Maximum ${COMPARE_MAX} produits à comparer`);
        } else if (add(productId)) {
          showToast("Ajouté au comparateur");
        }
      }}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition",
        active
          ? "border-shifaa-green bg-shifaa-lime/30 text-shifaa-green"
          : "border-shifaa-border hover:border-shifaa-green",
        className
      )}
    >
      <Scale className="h-3.5 w-3.5" />
      {active ? "Dans le comparateur" : "Comparer"}
    </button>
  );
}
