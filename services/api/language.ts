export type Locale = "ar" | "en";

const LOCALE_KEY = "selectedLanguage";
const DEFAULT_LOCALE: Locale = "ar";

/** Get the current locale from localStorage (defaults to "ar") */
export function getLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  return (localStorage.getItem(LOCALE_KEY) as Locale) ?? DEFAULT_LOCALE;
}

/** Save a new locale to localStorage */
export function setLocale(locale: Locale): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCALE_KEY, locale);
}