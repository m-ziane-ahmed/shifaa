"use client";

import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/context/I18nContext";
import { LOCALES, LOCALE_CONFIG, type Locale } from "@/i18n/config";

interface LanguageSwitcherProps {
  variant?: "dropdown" | "toggle" | "pills";
  className?: string;
}

export function LanguageSwitcher({
  variant = "dropdown",
  className = "",
}: LanguageSwitcherProps) {
  const { locale, setLocale, isLoading } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fermer au clic extérieur
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentConfig = LOCALE_CONFIG[locale];

  // ── Variant : pills (FR | AR) ──────────────────────────────────────────────
  if (variant === "pills") {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        {LOCALES.map((loc) => {
          const cfg = LOCALE_CONFIG[loc];
          const isActive = loc === locale;
          return (
            <button
              key={loc}
              onClick={() => setLocale(loc as Locale)}
              disabled={isLoading}
              aria-label={`Changer en ${cfg.label}`}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all
                ${isActive
                  ? "bg-shifaa-green text-white shadow-sm"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }
                ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              {cfg.flag} {cfg.nativeLabel}
            </button>
          );
        })}
      </div>
    );
  }

  // ── Variant : toggle (simple bascule FR↔AR) ────────────────────────────────
  if (variant === "toggle") {
    const otherLocale = locale === "fr" ? "ar" : "fr";
    const otherConfig = LOCALE_CONFIG[otherLocale];
    return (
      <button
        onClick={() => setLocale(otherLocale as Locale)}
        disabled={isLoading}
        aria-label={`Passer en ${otherConfig.label}`}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200
          text-sm font-medium text-gray-700 hover:border-shifaa-green hover:text-shifaa-green
          transition-all ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${className}`}
      >
        <span className="text-base">{otherConfig.flag}</span>
        <span className="font-semibold">{otherConfig.nativeLabel}</span>
      </button>
    );
  }

  // ── Variant : dropdown (défaut) ────────────────────────────────────────────
  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={isLoading}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200
          text-sm font-medium text-gray-700 hover:border-shifaa-green hover:bg-shifaa-green/5
          transition-all bg-white ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <span className="text-base">{currentConfig.flag}</span>
        <span>{currentConfig.nativeLabel}</span>
        <svg
          className={`h-3.5 w-3.5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 min-w-[140px]"
          style={{ [locale === "ar" ? "left" : "right"]: 0 }}
          role="listbox"
        >
          {LOCALES.map((loc) => {
            const cfg = LOCALE_CONFIG[loc];
            const isActive = loc === locale;
            return (
              <button
                key={loc}
                role="option"
                aria-selected={isActive}
                onClick={() => { setLocale(loc as Locale); setOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm
                  hover:bg-shifaa-green/5 transition-colors
                  ${isActive ? "text-shifaa-green font-semibold bg-shifaa-green/5" : "text-gray-700"}
                `}
              >
                <span className="text-base">{cfg.flag}</span>
                <div className="text-left">
                  <p className={`text-sm font-medium ${isActive ? "text-shifaa-green" : ""}`}>
                    {cfg.nativeLabel}
                  </p>
                  <p className="text-xs text-gray-400">{cfg.dir.toUpperCase()}</p>
                </div>
                {isActive && (
                  <svg className="ml-auto h-4 w-4 text-shifaa-green" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15l-4.121-4.121a1 1 0 011.414-1.414L8.414 12.172l7.879-7.879a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
