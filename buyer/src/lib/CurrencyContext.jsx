import { createContext, useContext } from 'react';
import { useCurrency } from '@/hooks/useCurrency';

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const value = useCurrency();
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrencyContext() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrencyContext must be used inside CurrencyProvider');
  return ctx;
}
