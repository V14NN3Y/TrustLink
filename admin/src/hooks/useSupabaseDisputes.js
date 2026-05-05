import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
export function useSupabaseDisputes() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('disputes')
      .select(`
        *,
        buyer:profiles!buyer_id (full_name),
        order:orders!order_id (id, total_amount),
        video:delivery_videos!video_id (video_url)
      `)
      .order('created_at', { ascending: false });
    const normalized = (data || []).map(d => ({
      id: d.id,
      order_ref: `TL-${d.order_id?.slice(-4)}`,
      buyer_name: d.buyer?.full_name || '—',
      seller_name: '—', // à enrichir via order_items
      reason: d.reason,
      status: d.status === 'open' ? 'OPEN' : d.status === 'resolved_refund' ? 'RESOLVED' : 'RESOLVED',
      amount_xof: d.order?.total_amount || 0,
      created_at: d.created_at,
      video_url: d.video?.video_url || null,
      messages: [], // les messages viennent de la table messages
    }));
    setDisputes(normalized);
    setLoading(false);
  }, []);
  useEffect(() => { fetchData(); }, [fetchData]);
  return { disputes, loading, refresh: fetchData };
}
