"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 400);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Retour en haut de la page"
      className="fixed right-4 bottom-20 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-shifaa-dark/80 text-white shadow-lg backdrop-blur transition-all hover:bg-shifaa-green active:scale-95 md:bottom-6"
    >
      <ChevronUp className="h-5 w-5" aria-hidden />
    </button>
  );
}
