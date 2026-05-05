import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useSupabaseActivity() {
  const [activity, setActivity] = useState([]);
  const [hubStats, setHubStats] = useState({ Lagos: { orders: 0, volume_xof: 0, on_time_pct: 95 }, Abuja: { orders: 0, volume_xof: 0, on_time_pct: 95 } });
  useEffect(() => {
    async function fetch() {
      // Activité récente depuis admin_logs
      const { data: logs } = await supabase
        .from('admin_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      const normalized = (logs || []).map(log => ({
        id: log.id,
        type: log.resource_type === 'order' ? 'ORDER' :
              log.resource_type === 'dispute' ? 'DISPUTE' :
              log.action?.includes('payout') ? 'PAYOUT' : 'VOYAGE',
        title: log.action,
        sub: `${log.resource_type || ''} ${log.resource_id?.slice(0,8) || ''}`,
        time: log.created_at,
      }));
      setActivity(normalized);
      // Hub stats depuis orders
      const { data: orders } = await supabase
        .from('orders')
        .select('shipping_city, total_amount');
      const stats = { Lagos: { orders: 0, volume_xof: 0, on_time_pct: 92 }, Abuja: { orders: 0, volume_xof: 0, on_time_pct: 96 } };
      (orders || []).forEach(o => {
        const city = o.shipping_city?.includes('Lagos') ? 'Lagos' : o.shipping_city?.includes('Abuja') ? 'Abuja' : null;
        if (city) {
          stats[city].orders++;
          stats[city].volume_xof += Number(o.total_amount) || 0;
        }
      });
      setHubStats(stats);
    }
    fetch();
  }, []);
  return { activity, hubStats };
}
