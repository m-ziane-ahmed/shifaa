"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAManager() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Enregistrement Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("[PWA] SW enregistré"))
        .catch((err) => console.error("[PWA] SW error:", err));
    }

    // Capture de l'évènement install
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Afficher la bannière après 30s si non installé
      const dismissed = sessionStorage.getItem("pwa-dismissed");
      if (!dismissed) setTimeout(() => setShowBanner(true), 30_000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShowBanner(false);
    setDeferredPrompt(null);
  }

  function dismiss() {
    setShowBanner(false);
    sessionStorage.setItem("pwa-dismissed", "1");
  }

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-20 left-3 right-3 z-50 md:hidden">
      <div className="flex items-center gap-3 rounded-2xl border border-shifaa-green/30 bg-white p-4 shadow-xl">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-shifaa-green">
          <span className="text-xl">💊</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-shifaa-ink">Installer Shifaa</p>
          <p className="text-xs text-shifaa-muted">Ajoutez sur votre écran d&apos;accueil</p>
        </div>
        <div className="flex gap-1 shrink-0">
          <button type="button" onClick={install}
            className="flex items-center gap-1.5 rounded-xl bg-shifaa-green px-3 py-1.5 text-xs font-semibold text-white">
            <Download className="h-3.5 w-3.5" />
            Installer
          </button>
          <button type="button" onClick={dismiss}
            className="p-1.5 text-shifaa-muted hover:text-shifaa-ink rounded-xl">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
