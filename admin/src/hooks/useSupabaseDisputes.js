import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
export function useSupabaseDisputes() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('disputes')
      .select(`
        *,
        buyer:profiles!buyer_id (full_name),
        order:orders!order_id (id, total_amount),
        video:delivery_videos!video_id (video_url, created_at)
      `)
      .order('created_at', { ascending: false });
    if (error) console.error('[disputes] fetch failed', error);
    const orderIds = (data || []).map(d => d.order_id).filter(Boolean);
    const { data: orderItems } = orderIds.length > 0 ? await supabase
      .from('order_items')
      .select('seller:profiles!seller_id (full_name, business_name), order_id')
      .in('order_id', orderIds) : { data: [] };
    const sellerMap = (orderItems || []).reduce((acc, item) => {
      if (!acc[item.order_id]) acc[item.order_id] = item.seller?.business_name || item.seller?.full_name || '—';
      return acc;
    }, {});

    // Lagos inspection photo: one row per order (latest wins). Stored as an
    // object path in the private 'inspection-photos' bucket.
    const { data: inspections, error: inspError } = orderIds.length > 0 ? await supabase
      .from('order_inspections')
      .select('order_id, photo_path, agent_name, notes, created_at')
      .in('order_id', orderIds)
      .order('created_at', { ascending: false }) : { data: [] };
    if (inspError) console.error('[disputes] inspections fetch failed', inspError);
    const inspectionMap = (inspections || []).reduce((acc, i) => {
      if (!acc[i.order_id]) acc[i.order_id] = i;
      return acc;
    }, {});

    const normalized = (data || []).map(d => ({
      id: d.id,
      order_id: d.order_id,
      order_ref: `TL-${d.order_id?.slice(-4)}`,
      buyer_id: d.buyer_id,
      buyer_name: d.buyer?.full_name || '—',
      seller_name: sellerMap[d.order_id] || '—',
      reason: d.reason,
      status: d.status,
      amount_xof: d.order?.total_amount || 0,
      created_at: d.created_at,
      // Raw value (path or legacy public URL). <SignedMedia> turns it into a signed URL.
      video_url: d.video?.video_url || null,
      video_created_at: d.video?.created_at || null,
      inspection: inspectionMap[d.order_id] || null,
      messages: [],
    }));
    setDisputes(normalized);
    setLoading(false);
  }, []);
  useEffect(() => { fetchData(); }, [fetchData]);
  return { disputes, loading, refresh: fetchData };
}
