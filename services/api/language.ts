export type Locale = string;

const DEFAULT_LOCALE: Locale = 'ar';

export const getLocale = (): Locale => {
  if (typeof document === 'undefined') {
    // Server-side: document is not available
    return DEFAULT_LOCALE;
  }
  const match = document.cookie.match(/(?:^|; )locale=([^;]*)/);
  return (match?.[1] as Locale) ?? DEFAULT_LOCALE;
};

export const setLocale = (locale: Locale) => {
  if (typeof document === 'undefined') return;
  document.cookie = `locale=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
};

export const getLangQueryParam = (locale: Locale): string => {
  return `?lang=${locale}`;
};