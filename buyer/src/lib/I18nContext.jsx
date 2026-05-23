import { createContext, useContext, useState, useCallback } from 'react';
import { t as tModule, setLocale as setLocaleModule, getLocale } from '@/lib/i18n';

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(getLocale);

  const setLocale = useCallback((l) => {
    setLocaleModule(l);
    setLocaleState(l);
  }, []);

  // Re-created on every locale change so consumers re-render with fresh translations
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const t = useCallback((path) => tModule(path), [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
