import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

const CURRENCY_KEY = 'trustlink_currency';

export function useCurrency() {
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem(CURRENCY_KEY) || 'XOF';
  });
  const [rate, setRate] = useState(0.89);

  useEffect(() => {
    supabase.from('exchange_rates').select('rate').eq('from_currency', 'NGN').eq('to_currency', 'XOF').maybeSingle()
      .then(({ data }) => { if (data?.rate) setRate(data.rate); });
  }, []);

  const setCurrency = useCallback((c) => {
    setCurrencyState(c);
    localStorage.setItem(CURRENCY_KEY, c);
    window.dispatchEvent(new CustomEvent('currency-change', { detail: c }));
  }, []);

  const formatPrice = useCallback((amountXOF) => {
    if (currency === 'NGN') {
      return `₦${Math.round(amountXOF / rate).toLocaleString()}`;
    }
    return `${Number(amountXOF).toLocaleString()} FCFA`;
  }, [currency, rate]);

  return { currency, setCurrency, rate, formatPrice };
}
