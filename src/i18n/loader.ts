import type { Locale, TranslationNamespace } from "./config";

type TranslationDict = Record<string, unknown>;

// Cache en mémoire pour éviter les rechargements
const cache: Record<string, TranslationDict> = {};

/**
 * Charge un namespace de traduction côté serveur
 */
export async function loadTranslations(
  locale: Locale,
  namespace: TranslationNamespace
): Promise<TranslationDict> {
  const key = `${locale}:${namespace}`;
  if (cache[key]) return cache[key];

  try {
    // Dynamic import depuis /public/locales
    const data = await import(`../../public/locales/${locale}/${namespace}.json`);
    cache[key] = data.default ?? data;
    return cache[key];
  } catch {
    console.warn(`[i18n] Missing translation: ${locale}/${namespace}`);
    // Fallback vers le français
    if (locale !== "fr") {
      return loadTranslations("fr", namespace);
    }
    return {};
  }
}

/**
 * Récupère plusieurs namespaces en une fois
 */
export async function loadMultipleTranslations(
  locale: Locale,
  namespaces: TranslationNamespace[]
): Promise<Record<string, TranslationDict>> {
  const results = await Promise.all(
    namespaces.map(async (ns) => [ns, await loadTranslations(locale, ns)] as const)
  );
  return Object.fromEntries(results);
}

/**
 * Interpole les variables dans une chaîne
 * ex: t("free_above", { amount: "8000 DZD" }) → "Livraison offerte dès 8000 DZD"
 */
export function interpolate(str: string, vars?: Record<string, string | number>): string {
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? `{${key}}`));
}

/**
 * Résoud une clé imbriquée (ex: "status.pending" → dict.status.pending)
 */
export function resolveKey(dict: TranslationDict, key: string): string | null {
  const parts = key.split(".");
  let current: unknown = dict;
  for (const part of parts) {
    if (typeof current !== "object" || current === null) return null;
    current = (current as TranslationDict)[part];
  }
  return typeof current === "string" ? current : null;
}

/**
 * Fonction de traduction principale
 */
export function createTranslator(dict: TranslationDict) {
  return function t(key: string, vars?: Record<string, string | number>): string {
    const value = resolveKey(dict, key);
    if (value === null) {
      console.warn(`[i18n] Missing key: "${key}"`);
      return key;
    }
    return interpolate(value, vars);
  };
}
