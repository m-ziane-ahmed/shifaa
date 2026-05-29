"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "shifaa-cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function accept(all: boolean) {
    localStorage.setItem(STORAGE_KEY, all ? "all" : "essential");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-shifaa-border bg-white p-4 shadow-lift md:p-6"
      role="dialog"
      aria-label="Gestion des cookies"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-shifaa-muted md:max-w-2xl">
          Nous utilisons des cookies pour le fonctionnement du site, la mesure d&apos;audience et
          l&apos;amélioration de votre expérience. Consultez notre{" "}
          <Link href="/legal/cookies" className="font-medium text-shifaa-green underline">
            politique cookies
          </Link>{" "}
          et notre{" "}
          <Link href="/legal/confidentialite" className="font-medium text-shifaa-green underline">
            politique de confidentialité
          </Link>
          .
        </p>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button type="button" onClick={() => accept(false)} className="btn-secondary text-sm py-2">
            Essentiels uniquement
          </button>
          <button type="button" onClick={() => accept(true)} className="btn-primary text-sm py-2">
            Tout accepter
          </button>
        </div>
      </div>
    </div>
  );
}
