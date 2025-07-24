import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Define all supported languages
export const locales = ['en', 'mr'];
export const defaultLocale = 'en';

// Get translations for the current locale
export default getRequestConfig(async ({ locale }) => {
  // Validate that the locale is supported
  if (!locales.includes(locale as any)) {
    notFound();
  }

  return {
    locale: locale as string,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});

// Helper function to get the locale from local storage or default
export function getStoredLocale(): string {
  if (typeof window === 'undefined') return defaultLocale;
  
  const storedLocale = localStorage.getItem('locale');
  return storedLocale && locales.includes(storedLocale) ? storedLocale : defaultLocale;
}

// Helper function to store the locale in local storage
export function storeLocale(locale: string): void {
  if (typeof window !== 'undefined' && locales.includes(locale)) {
    localStorage.setItem('locale', locale);
  }
} 