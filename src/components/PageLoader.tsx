"use client";

import { useEffect, useState } from "react";

export function PageLoader() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const minDisplay = 600;
    const start = Date.now();

    function hide() {
      const elapsed = Date.now() - start;
      const delay = Math.max(0, minDisplay - elapsed);
      setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => setVisible(false), 400);
      }, delay);
    }

    if (document.readyState === "complete") {
      hide();
    } else {
      window.addEventListener("load", hide);
      return () => window.removeEventListener("load", hide);
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-shifaa-cream transition-opacity duration-300 ${
        fadeOut ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      role="status"
      aria-live="polite"
      aria-label="Chargement"
    >
      <div className="relative flex h-20 w-20 items-center justify-center">
        <div
          className="absolute inset-0 rounded-full border-4 border-shifaa-lime/30"
          aria-hidden
        />
        <div
          className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-shifaa-green border-r-shifaa-header"
          aria-hidden
        />
        <span className="font-display text-2xl font-semibold text-shifaa-header">S</span>
      </div>
      <p className="mt-6 text-sm font-medium text-shifaa-header">Shifaa</p>
      <div className="mt-4 flex gap-1.5" aria-hidden>
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-shifaa-lime [animation-delay:0ms]" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-shifaa-green [animation-delay:150ms]" />
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-shifaa-header [animation-delay:300ms]" />
      </div>
    </div>
  );
}
