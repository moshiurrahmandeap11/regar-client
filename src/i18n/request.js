import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;
  const locales = ['fr', 'en'];
  
  const finalLocale = (!locale || !locales.includes(locale)) ? 'fr' : locale;

  return {
    locale: finalLocale,
    messages: (await import(`../../messages/${finalLocale}.json`)).default,
  };
});
