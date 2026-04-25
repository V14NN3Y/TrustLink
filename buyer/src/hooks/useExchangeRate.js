import { useState, useEffect } from 'react';

const STORAGE_KEY = 'tl_exchange_rate';
export const DEFAULT_RATE = 0.4132;
export const DEFAULT_XOF_TO_NGN = 2.42;

export function getStoredRate() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_RATE;
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'number') return parsed;
    if (typeof parsed?.rate === 'number') return parsed.rate;
    return DEFAULT_RATE;
  } catch {
    return DEFAULT_RATE;
  }
}

export function formatNGN(amount) {
  return `₦${amount.toLocaleString('en-NG')}`;
}

export function formatFCFA(amount) {
  return `FCFA ${Math.round(amount).toLocaleString('fr-FR')}`;
}

export function convertXOFtoNGN(xof, rate) {
  const r = rate ?? getStoredRate();
  return r > 0 ? Math.round(xof / r) : 0;
}

export function convertNGNtoXOF(ngn, rate) {
  const r = rate ?? getStoredRate();
  return Math.round(ngn * r);
}

export function useExchangeRate() {
  const [rate, setRateState] = useState(getStoredRate);

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === STORAGE_KEY) setRateState(getStoredRate());
    };
    const handleCustom = (e) => {
      if (e.detail?.key === STORAGE_KEY) setRateState(getStoredRate());
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('tl_storage_update', handleCustom);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('tl_storage_update', handleCustom);
    };
  }, []);

  return { rate };
}
