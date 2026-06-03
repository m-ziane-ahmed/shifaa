"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  type Locale,
  type TranslationNamespace,
  DEFAULT_LOCALE,
  LOCALE_CONFIG,
  isRTL,
} from "@/i18n/config";
import { interpolate, resolveKey } from "@/i18n/loader";

// ─── Types ────────────────────────────────────────────────────────────────────

type TranslationDict = Record<string, unknown>;

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  dir: "ltr" | "rtl";
  isRtl: boolean;
  t: (namespace: TranslationNamespace, key: string, vars?: Record<string, string | number>) => string;
  tCommon: (key: string, vars?: Record<string, string | number>) => string;
  formatCurrency: (amount: number) => string;
  formatDate: (date: string | Date) => string;
  isLoading: boolean;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const I18nContext = createContext<I18nContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = "shifaa_locale";
const PRELOAD_NAMESPACES: TranslationNamespace[] = ["common", "nav"];

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [translations, setTranslations] = useState<Partial<Record<TranslationNamespace, TranslationDict>>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Charger les traductions d'un namespace
  const loadNamespace = useCallback(async (loc: Locale, ns: TranslationNamespace) => {
    try {
      const res = await fetch(`/locales/${loc}/${ns}.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTranslations((prev) => ({
        ...prev,
        [ns]: { ...(prev[ns] ?? {}), ...data },
      }));
    } catch {
      // Fallback FR
      if (loc !== "fr") {
        try {
          const res = await fetch(`/locales/fr/${ns}.json`);
          if (res.ok) {
            const data = await res.json();
            setTranslations((prev) => ({ ...prev, [ns]: data }));
          }
        } catch { /* ignore */ }
      }
    }
  }, []);

  // Changer de langue
  const setLocale = useCallback(async (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);

    // Appliquer dir + lang sur <html>
    const html = document.documentElement;
    html.setAttribute("lang", newLocale);
    html.setAttribute("dir", LOCALE_CONFIG[newLocale].dir);

    // Charger les namespaces principaux
    setIsLoading(true);
    await Promise.all(PRELOAD_NAMESPACES.map((ns) => loadNamespace(newLocale, ns)));
    setIsLoading(false);
  }, [loadNamespace]);

  // Initialisation
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    const browserLang = navigator.language.startsWith("ar") ? "ar" : "fr";
    const initial: Locale = saved ?? browserLang;
    setLocale(initial);
  }, [setLocale]);

  // Fonction de traduction
  const t = useCallback((
    namespace: TranslationNamespace,
    key: string,
    vars?: Record<string, string | number>
  ): string => {
    const dict = translations[namespace];
    if (!dict) return key;
    const value = resolveKey(dict, key);
    if (value === null) return key;
    return interpolate(value, vars);
  }, [translations]);

  const tCommon = useCallback((
    key: string,
    vars?: Record<string, string | number>
  ) => t("common", key, vars), [t]);

  // Formatage monétaire DZD
  const formatCurrency = useCallback((amount: number): string => {
    return new Intl.NumberFormat(LOCALE_CONFIG[locale].dateLocale, {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(amount) + " DZD";
  }, [locale]);

  // Formatage date
  const formatDate = useCallback((date: string | Date): string => {
    return new Intl.DateTimeFormat(LOCALE_CONFIG[locale].dateLocale, {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(typeof date === "string" ? new Date(date) : date);
  }, [locale]);

  const dir = LOCALE_CONFIG[locale].dir;
  const value: I18nContextValue = {
    locale,
    setLocale,
    dir,
    isRtl: isRTL(locale),
    t,
    tCommon,
    formatCurrency,
    formatDate,
    isLoading,
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

/**
 * Hook pour charger un namespace à la demande
 */
export function useNamespace(namespace: TranslationNamespace) {
  const { locale, t } = useI18n();

  useEffect(() => {
    fetch(`/locales/${locale}/${namespace}.json`).catch(() => {});
  }, [locale, namespace]);

  return (key: string, vars?: Record<string, string | number>) =>
    t(namespace, key, vars);
}
