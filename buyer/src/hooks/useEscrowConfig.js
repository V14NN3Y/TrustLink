import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { resolvePricing } from '@/lib/pricing';

let cached = null;
let inflight = null;

const load = () => {
  if (cached) return Promise.resolve(cached);
  if (!inflight) {
    inflight = supabase.from('escrow_config').select('*').limit(1).single()
      .then(({ data, error }) => {
        // En cas d'erreur, on retombe sur env + valeurs par défaut (sans mise en cache).
        if (error || !data) return resolvePricing(null);
        cached = resolvePricing(data);
        return cached;
      })
      .catch(() => resolvePricing(null))
      .finally(() => { inflight = null; });
  }
  return inflight;
};

export function useEscrowConfig() {
  const [config, setConfig] = useState(cached || resolvePricing(null));
  useEffect(() => {
    let alive = true;
    load().then((c) => { if (alive) setConfig(c); });
    return () => { alive = false; };
  }, []);
  return config;
}
