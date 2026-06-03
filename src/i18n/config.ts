export type Locale = "fr" | "ar";

export const LOCALES: Locale[] = ["fr", "ar"];
export const DEFAULT_LOCALE: Locale = "fr";
export const RTL_LOCALES: Locale[] = ["ar"];

export const LOCALE_CONFIG: Record<Locale, {
  label: string;
  nativeLabel: string;
  dir: "ltr" | "rtl";
  font: string;
  dateLocale: string;
  flag: string;
}> = {
  fr: {
    label: "Français",
    nativeLabel: "Français",
    dir: "ltr",
    font: "Rubik, sans-serif",
    dateLocale: "fr-DZ",
    flag: "🇫🇷",
  },
  ar: {
    label: "العربية",
    nativeLabel: "العربية",
    dir: "rtl",
    font: "Noto Sans Arabic, Rubik, sans-serif",
    dateLocale: "ar-DZ",
    flag: "🇩🇿",
  },
};

export function isRTL(locale: Locale): boolean {
  return RTL_LOCALES.includes(locale);
}

export function getDir(locale: Locale): "ltr" | "rtl" {
  return LOCALE_CONFIG[locale].dir;
}

// Namespaces de traduction disponibles
export type TranslationNamespace =
  | "common"
  | "nav"
  | "orders"
  | "brands"
  | "boutique"
  | "product"
  | "auth"
  | "checkout"
  | "account";
