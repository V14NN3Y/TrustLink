import { useState, useEffect } from 'react';

const STORAGE_KEY = 'tl_exchange_rate';
export const DEFAULT_RATE = 0.4132;       // 1 NGN = 0.4132 FCFA
export const DEFAULT_XOF_TO_NGN = 2.42;  // 1 FCFA = 2.42 NGN

export function getStoredRate() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_RATE;
    const parsed = JSON.parse(raw);
    // Supporte 2 formats : legacy number OU objet { rate }
    if (typeof parsed === 'number') return parsed;
    if (typeof parsed?.rate === 'number') return parsed.rate;
    return DEFAULT_RATE;
  } catch {
    return DEFAULT_RATE;
  }
}

export function setRateWithMeta(rate, updatedBy) {
  const data = {
    rate,
    updated_at: new Date().toISOString(),
    updated_by: updatedBy,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  const historyRaw = localStorage.getItem('tl_rate_history');
  const history = historyRaw ? JSON.parse(historyRaw) : [];
  localStorage.setItem(
    'tl_rate_history',
    JSON.stringify([data, ...history].slice(0, 10))
  );
  window.dispatchEvent(
    new CustomEvent('tl_storage_update', { detail: { key: STORAGE_KEY } })
  );
  window.dispatchEvent(
    new StorageEvent('storage', {
      key: STORAGE_KEY,
      newValue: JSON.stringify(data),
    })
  );
}

// ── Fonctions utilitaires ────────────────────────────────────────
export function formatNGN(amount) {
  return `₦${amount.toLocaleString('en-NG')}`;
}

export function formatFCFA(amount) {
  return `FCFA ${Math.round(amount).toLocaleString('fr-FR')}`;
}

export function convertNGNtoFCFA(ngn, rate) {
  const r = rate ?? getStoredRate();
  return Math.round(ngn * r);
}

export function convertFCFAtoNGN(fcfa, rate) {
  const r = rate ?? getStoredRate();
  return r > 0 ? Math.round(fcfa / r) : 0;
}

// ── Hook React ───────────────────────────────────────────────────
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

  const setRate = (newRate) => {
    setRateWithMeta(newRate, 'Seller Hub');
    setRateState(newRate);
  };

  return { rate, setRate };
}
