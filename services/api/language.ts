export type Locale = "ar" | "en";

const LOCALE_KEY = "selectedLanguage";
const DEFAULT_LOCALE: Locale = "ar";

/** Get the current locale from localStorage (defaults to "ar") */
export function getLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  console.log('Retrieving locale from localStorage:', localStorage.getItem(LOCALE_KEY));
  return (localStorage.getItem(LOCALE_KEY) as Locale) ?? DEFAULT_LOCALE;
  
}

/** Save a new locale to localStorage */
export function setLocale(locale: Locale): void {
  if (typeof window === "undefined") return;
  console.log('Saving locale to localStorage:', locale);
  localStorage.setItem(LOCALE_KEY, locale);
}

export function langQuery(lang : Locale){
  const url = `?lang=${lang}`;
  if (typeof window !== "undefined") {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('lang', lang);
    window.history.replaceState({}, '', currentUrl.toString());
  }
  return url;
  
}