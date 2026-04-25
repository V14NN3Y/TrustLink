import { useState, useEffect, useCallback } from 'react';

export function useTLStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const handleCustom = useCallback(
    (e) => {
      if (e.detail?.key === key) {
        try {
          const raw = localStorage.getItem(key);
          setValue(raw ? JSON.parse(raw) : defaultValue);
        } catch { /* ignore */ }
      }
    },
    [key, defaultValue]
  );

  const handleStorage = useCallback(
    (e) => {
      if (e.key === key) {
        try {
          setValue(e.newValue ? JSON.parse(e.newValue) : defaultValue);
        } catch { /* ignore */ }
      }
    },
    [key, defaultValue]
  );

  useEffect(() => {
    window.addEventListener('tl_storage_update', handleCustom);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('tl_storage_update', handleCustom);
      window.removeEventListener('storage', handleStorage);
    };
  }, [handleCustom, handleStorage]);

  return value;
}
