import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useTranslations } from 'next-intl';
import { locales, getStoredLocale, storeLocale } from '@/lib/i18n';

interface LanguageToggleProps {
  className?: string;
  onLanguageChange?: (locale: string) => void;
}

export function LanguageToggle({ className, onLanguageChange }: LanguageToggleProps) {
  const t = useTranslations('common');
  const [mounted, setMounted] = useState(false);
  const [currentLocale, setCurrentLocale] = useState<string>('en');

  useEffect(() => {
    setMounted(true);
    setCurrentLocale(getStoredLocale());
  }, []);

  const handleLanguageChange = (locale: string) => {
    setCurrentLocale(locale);
    storeLocale(locale);
    if (onLanguageChange) {
      onLanguageChange(locale);
    }
    // Reload the page to apply the new language
    window.location.reload();
  };

  // Don't render anything on the server to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  const getLanguageName = (locale: string) => {
    switch (locale) {
      case 'en':
        return 'English';
      case 'mr':
        return 'मराठी';
      default:
        return locale.toUpperCase();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={className}
          aria-label={t('language')}
        >
          <Globe className="h-5 w-5 text-accent-foreground/70 hover:text-primary" />
          <span className="sr-only">{t('language')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => handleLanguageChange(locale)}
            className={currentLocale === locale ? 'bg-accent font-medium' : ''}
          >
            {getLanguageName(locale)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 