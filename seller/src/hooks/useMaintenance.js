import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useMaintenance() {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    supabase.from('app_settings').select('value').eq('key', 'maintenance_mode').single()
      .then(({ data }) => {
        if (data) {
          const val = data.value;
          setIsMaintenance(val === true || val === 'true' || val === '1');
        }
        setChecked(true);
      })
      .catch(() => setChecked(true));
  }, []);

  return { isMaintenance, checked };
}
