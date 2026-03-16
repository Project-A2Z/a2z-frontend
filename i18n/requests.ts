import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import ar from './../messages/ar/common.json';
import en from './../messages/en/common.json';

const messageMap = { ar, en } as const;
type Locale = keyof typeof messageMap;

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = (cookieStore.get('locale')?.value ?? 'ar') as Locale;
  const safeLocale = locale in messageMap ? locale : 'ar';

  return {
    locale: safeLocale,
    messages: messageMap[safeLocale],
  };
});