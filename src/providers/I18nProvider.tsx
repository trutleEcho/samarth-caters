'use client';

import { ReactNode, useEffect, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getStoredLocale } from '@/lib/i18n';

interface I18nProviderProps {
  children: ReactNode;
}

export default function I18nProvider({ children }: I18nProviderProps) {
  const [messages, setMessages] = useState<Record<string, any> | null>(null);
  const [locale, setLocale] = useState<string>('en');

  useEffect(() => {
    const currentLocale = getStoredLocale();
    setLocale(currentLocale);

    // Dynamically import the messages for the current locale
    import(`../messages/${currentLocale}.json`)
      .then((messages) => {
        setMessages(messages.default);
      })
      .catch((error) => {
        console.error(`Error loading messages for locale ${currentLocale}:`, error);
        // Fallback to English if there's an error
        import('../messages/en.json').then((messages) => {
          setMessages(messages.default);
        });
      });
  }, []);

  if (!messages) {
    // Show nothing until messages are loaded
    return null;
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
} 