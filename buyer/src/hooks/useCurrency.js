import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

const CURRENCY_KEY = 'trustlink_currency';
const RATE_KEY = 'trustlink_rate';
// Pas de temps réel sur exchange_rates : on revérifie périodiquement pour
// qu'un onglet resté ouvert plusieurs heures/jours ne continue pas
// d'afficher un taux NGN périmé indéfiniment.
const REFRESH_INTERVAL_MS = 10 * 60 * 1000;

export function useCurrency() {
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem(CURRENCY_KEY) || 'XOF';
  });
  const [rate, setRate] = useState(() => {
    const cached = localStorage.getItem(RATE_KEY);
    return cached ? parseFloat(cached) : null;
  });

  useEffect(() => {
    const fetchRate = () => {
      supabase.from('exchange_rates').select('rate').eq('from_currency', 'NGN').eq('to_currency', 'XOF').maybeSingle()
        .then(({ data }) => {
          if (data?.rate) {
            setRate(data.rate);
            localStorage.setItem(RATE_KEY, data.rate.toString());
          }
        })
        .catch(() => {
          const cached = localStorage.getItem(RATE_KEY);
          if (cached) setRate(parseFloat(cached));
        });
    };
    fetchRate();
    const interval = setInterval(fetchRate, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
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
    const amount = Number(amountXOF) || 0;
    if (currency === 'NGN' && rate) {
      return `₦${Math.round(amount / rate).toLocaleString()}`;
    }
    return `${amount.toLocaleString()} FCFA`;
  }, [currency, rate]);

  return { currency, setCurrency, rate, formatPrice };
}
