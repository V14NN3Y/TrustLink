import { useState, useEffect } from 'react';

const STORAGE_KEY = 'trustlink_ngn_xof_rate';
const DEFAULT_RATE = 1.832;

function getStoredRate() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v) {
      const parsed = parseFloat(v);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  } catch {}
  return DEFAULT_RATE;
}

export function useExchangeRate() {
  const [rate, setRateState] = useState(() => getStoredRate());

  useEffect(() => {
    const handler = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const parsed = parseFloat(e.newValue);
        if (!isNaN(parsed) && parsed > 0) setRateState(parsed);
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  function setRate(newRate) {
    localStorage.setItem(STORAGE_KEY, String(newRate));
    setRateState(newRate);
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEY,
      newValue: String(newRate),
      storageArea: localStorage,
    }));
  }

  return { rate, setRate, DEFAULT_RATE };
}

export function persistRate(rate) {
  localStorage.setItem(STORAGE_KEY, String(rate));
}
