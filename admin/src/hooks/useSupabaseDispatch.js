import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useSupabaseDispatch() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPending = useCallback(async () => {
    setLoading(true);

    const { data, error: err } = await supabase
      .from('order_items')
      .select(`
        id,
        order_id,
        seller_id,
        product_id,
        product_name,
        product_price,
        quantity,
        subtotal,
        status,
        created_at,
        order:orders!inner (
          id,
          buyer_id,
          group_id,
          status,
          total_amount,
          shipping_city,
          created_at,
          buyer:profiles!buyer_id (
            id,
            full_name,
            email
          )
        ),
        product:products!product_id (
          id,
          name,
          price,
          product_images (url, is_primary, sort_order)
        )
      `)
      .eq('order.status', 'paid')
      .is('dispatched_at', null)
      .order('created_at', { ascending: false });

    if (err) {
      setError(err.message);
      setItems([]);
      setLoading(false);
      return;
    }

    setItems(data || []);
    setLoading(false);
  }, []);

  const dispatchItems = useCallback(async (itemIds, adminId) => {
    const now = new Date().toISOString();

    try {
      const { data: itemsToDispatch, error: fetchErr } = await supabase
        .from('order_items')
        .select('order_id')
        .in('id', itemIds);

      if (fetchErr) throw fetchErr;

      const { error: updateErr } = await supabase
        .from('order_items')
        .update({ dispatched_at: now, status: 'processing' })
        .in('id', itemIds);

      if (updateErr) throw updateErr;

      const orderIds = [...new Set((itemsToDispatch || []).map(i => i.order_id))];
      if (orderIds.length > 0) {
        const { error: orderErr } = await supabase
          .from('orders')
          .update({ status: 'processing', updated_at: now })
          .in('id', orderIds);
        if (orderErr) console.error('Order status update error:', orderErr);
      }

      const { error: logErr } = await supabase
        .from('admin_logs')
        .insert({
          admin_id: adminId,
          action: 'mark_processing',
          resource_type: 'order_item',
          new_value: { item_ids: itemIds, count: itemIds.length },
        });

      if (logErr) {
        console.error('Log error:', logErr);
      }

      return { success: true };
    } catch (err) {
      console.error('Error dispatching items:', err);
      return { success: false, error: err.message };
    }
  }, []);

  useEffect(() => {
    fetchPending();
    const channel = supabase
      .channel('dispatch-changes')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'order_items' },
        () => fetchPending()
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'order_items' },
        () => fetchPending()
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.new?.status === 'paid') fetchPending();
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchPending]);

  const refresh = useCallback(() => {
    fetchPending();
  }, [fetchPending]);

  return { items, loading, error, dispatchItems, refresh };
}
