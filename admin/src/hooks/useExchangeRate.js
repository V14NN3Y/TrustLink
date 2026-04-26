import { useState, useEffect } from 'react';

const STORAGE_KEY = 'tl_exchange_rate';
export const DEFAULT_RATE = 0.4132;

export function getStoredRate() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_RATE;
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'number') return parsed;
    if (typeof parsed?.rate === 'number') return parsed.rate;
    return DEFAULT_RATE;
  } catch { return DEFAULT_RATE; }
}

export function setRateWithMeta(rate, updatedBy) {
  const data = { rate, updated_at: new Date().toISOString(), updated_by: updatedBy };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  const historyRaw = localStorage.getItem('tl_rate_history');
  const history = historyRaw ? JSON.parse(historyRaw) : [];
  localStorage.setItem('tl_rate_history', JSON.stringify([data, ...history].slice(0, 10)));
  window.dispatchEvent(new CustomEvent('tl_storage_update', { detail: { key: STORAGE_KEY } }));
  window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: JSON.stringify(data) }));
}

export function useExchangeRate() {
  const [rate, setRateState] = useState(() => getStoredRate());

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

  function setRate(newRate) {
    const data = { rate: newRate, updated_at: new Date().toISOString(), updated_by: 'Kolade Adeyemi' };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setRateState(newRate);
    window.dispatchEvent(new CustomEvent('tl_storage_update', { detail: { key: STORAGE_KEY } }));
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: JSON.stringify(data) }));
  }

  return { rate, setRate, DEFAULT_RATE };
}

export function persistRate(rate) {
  setRateWithMeta(rate, 'Kolade Adeyemi');
}
