import { useState, useEffect } from 'react';
import { fetchExchangeRate } from '@/lib/supabase/exchangeRate';
export function useExchangeRate() {
  const [rate, setRate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchExchangeRate();
        if (data) setRate(data);
      } catch (err) {
        console.error('Erreur taux de change:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);
  return { rate, loading, error };
}
