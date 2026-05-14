import { useState, useEffect } from 'react';
import { StorageManager } from '@/lib/storage';
import { supabase } from '@/lib/supabaseClient';

const STORAGE_KEYS = StorageManager.getKeys();
const RATE_CHANGED_EVENT = 'trustlink-exchange-rate-changed';

export function useExchangeRate() {
  const [data, setData] = useState(() => StorageManager.getExchangeRate() || { rate: 1.832, lastUpdated: new Date().toISOString() });

  useEffect(() => {
    supabase
      .from('exchange_rates')
      .select('rate')
      .eq('from_currency', 'NGN')
      .eq('to_currency', 'XOF')
      .single()
      .then(({ data }) => {
        if (data?.rate) {
          setData({ rate: data.rate, lastUpdated: new Date().toISOString() });
          StorageManager.setExchangeRate(data.rate);
        }
      });
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const newRate = e.detail;
      setData({ rate: newRate, lastUpdated: new Date().toISOString() });
      StorageManager.setExchangeRate(newRate);
    };
    window.addEventListener(RATE_CHANGED_EVENT, handler);
    return () => window.removeEventListener(RATE_CHANGED_EVENT, handler);
  }, []);

  async function setRate(newRate) {
    const { error } = await supabase
      .from('exchange_rates')
      .update({ rate: newRate, updated_at: new Date().toISOString() })
      .eq('from_currency', 'NGN')
      .eq('to_currency', 'XOF');
    if (!error) {
      StorageManager.setExchangeRate(newRate);
      setData({ rate: newRate, lastUpdated: new Date().toISOString() });
      window.dispatchEvent(new CustomEvent(RATE_CHANGED_EVENT, { detail: newRate }));
    } else {
      console.error('Erreur mise à jour taux de change:', error);
    }
  }

  return {
    rate: data.rate,
    lastUpdated: data.lastUpdated,
    setRate,
    DEFAULT_RATE: 1.832
  };
}
