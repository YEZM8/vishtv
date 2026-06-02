import en from "./en.json";
import si from "./si.json";

export type Locale = "en" | "si";
export type Translations = typeof en;

const translations: Record<Locale, Translations> = { en, si };

/**
 * Get a nested translation value by dot-separated key.
 * e.g. t("nav.home") → "Home" or "මුල් පිටුව"
 */
export function getTranslation(locale: Locale, key: string): string {
  const keys = key.split(".");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = translations[locale];

  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) return key; // fallback to key if missing
  }

  return typeof value === "string" ? value : key;
}

export { translations };
