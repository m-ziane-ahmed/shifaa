"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { BoutiqueFilters } from "@/components/BoutiqueFilters";

export function MobileFilterSheet() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-secondary inline-flex items-center gap-2 lg:hidden"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filtrer
      </button>
      {open && (
        <>
          <button type="button" className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)} aria-label="Fermer" />
          <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-6 shadow-lift lg:hidden">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">Filtres</h2>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-shifaa-cream">
                <X className="h-5 w-5" />
              </button>
            </div>
            <BoutiqueFilters onNavigate={() => setOpen(false)} />
          </div>
        </>
      )}
    </>
  );
}
