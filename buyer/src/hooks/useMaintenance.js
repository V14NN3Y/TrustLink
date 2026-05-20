import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const MAINTENANCE_KEY = 'trustlink_maintenance';

export function useMaintenance() {
  const [isMaintenance, setIsMaintenance] = useState(() => {
    const cached = localStorage.getItem(MAINTENANCE_KEY);
    if (cached !== null) return cached === 'true';
    return false;
  });
  const [checked, setChecked] = useState(() => {
    return localStorage.getItem(MAINTENANCE_KEY) !== null;
  });

  useEffect(() => {
    supabase.from('app_settings').select('value').eq('key', 'maintenance_mode').single()
      .then(({ data }) => {
        if (data) {
          const val = data.value;
          const isOn = val === true || val === 'true' || val === '1';
          setIsMaintenance(isOn);
          localStorage.setItem(MAINTENANCE_KEY, isOn.toString());
        } else {
          localStorage.setItem(MAINTENANCE_KEY, 'false');
        }
        setChecked(true);
      })
      .catch(() => {
        localStorage.setItem(MAINTENANCE_KEY, 'false');
        setChecked(true);
      });
  }, []);

  return { isMaintenance, checked };
}
