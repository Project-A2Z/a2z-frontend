export type Locale = 'ar' | 'en';

export const getLocale = (): Locale => {
  const match = document.cookie.match(/(?:^|; )locale=([^;]*)/);
  return (match?.[1] as Locale) ?? 'ar';
};

export const setLocale = (locale: Locale) => {
  // Set cookie for 1 year, readable by server
  document.cookie = `locale=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
};

export const getLangQueryParam = (locale: Locale): string => {
  return `?lang=${locale}`;
};