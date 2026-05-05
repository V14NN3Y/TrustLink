import { useState, useEffect } from 'react';
import { StorageManager } from '@/lib/storage';
import { supabase } from '@/lib/supabaseClient';

const STORAGE_KEYS = StorageManager.getKeys();

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
          StorageManager.setExchangeRate(data.rate); // sync localStorage
        }
      });
  }, []);

  function setRate(newRate) {
    StorageManager.setExchangeRate(newRate);
    setData({
      rate: newRate,
      lastUpdated: new Date().toISOString()
    });
  }

  return {
    rate: data.rate,
    lastUpdated: data.lastUpdated,
    setRate,
    DEFAULT_RATE: 1.832
  };
}
