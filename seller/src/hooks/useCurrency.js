import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

const CURRENCY_KEY = 'trustlink_currency';
const RATE_KEY = 'trustlink_rate';

export function useCurrency() {
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem(CURRENCY_KEY) || 'XOF';
  });
  const [rate, setRate] = useState(() => {
    const cached = localStorage.getItem(RATE_KEY);
    return cached ? parseFloat(cached) : null;
  });

  useEffect(() => {
    supabase.from('exchange_rates').select('rate').eq('from_currency', 'NGN').eq('to_currency', 'XOF').maybeSingle()
      .then(({ data }) => {
        if (data?.rate) {
          setRate(data.rate);
          localStorage.setItem(RATE_KEY, data.rate.toString());
        }
      });
  }, []);

  useEffect(() => {
    const handler = (e) => setCurrencyState(e.detail);
    window.addEventListener('currency-change', handler);
    return () => window.removeEventListener('currency-change', handler);
  }, []);

  const setCurrency = useCallback((c) => {
    setCurrencyState(c);
    localStorage.setItem(CURRENCY_KEY, c);
    window.dispatchEvent(new CustomEvent('currency-change', { detail: c }));
  }, []);

  const formatPrice = useCallback((amountXOF) => {
    if (currency === 'NGN' && rate) {
      return `₦${Math.round(amountXOF / rate).toLocaleString()}`;
    }
    return `${Number(amountXOF).toLocaleString()} FCFA`;
  }, [currency, rate]);

  return { currency, setCurrency, rate, formatPrice };
}
