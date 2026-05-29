"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 400);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollUp() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <button
      type="button"
      onClick={scrollUp}
      aria-label="Retour en haut de la page"
      className={cn(
        "fixed bottom-6 left-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-shifaa-dark text-white shadow-lift transition-all duration-300 hover:bg-shifaa-green focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-shifaa-lime md:left-6",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      )}
    >
      <ChevronUp className="h-5 w-5" aria-hidden />
    </button>
  );
}
