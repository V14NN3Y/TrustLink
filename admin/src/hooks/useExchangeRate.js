import { useState, useEffect } from 'react';
import { StorageManager } from '@/lib/storage';

const STORAGE_KEYS = StorageManager.getKeys();

export function useExchangeRate() {
  const [data, setData] = useState(() => StorageManager.getExchangeRate() || { rate: 1.832, lastUpdated: new Date().toISOString() });

  useEffect(() => {
    const handler = (e) => {
      if (e.key === STORAGE_KEYS.EXCHANGE_RATE && e.newValue) {
        setData(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
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
