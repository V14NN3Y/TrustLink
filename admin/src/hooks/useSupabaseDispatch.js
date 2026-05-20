import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useSupabaseDispatch() {
  const [sellers, setSellers] = useState([]);
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
        ),
        seller:profiles!seller_id (
          id,
          full_name,
          business_name,
          business_logo_url,
          email
        )
      `)
      .eq('order.status', 'paid')
      .is('dispatched_at', null)
      .order('created_at', { ascending: false });

    if (err) {
      setError(err.message);
      setSellers([]);
      setLoading(false);
      return;
    }

    const groups = {};
    (data || []).forEach(item => {
      const sid = item.seller_id;
      if (!groups[sid]) {
        groups[sid] = {
          seller: item.seller,
          items: [],
          totalAmount: 0,
          itemCount: 0,
          buyerCount: 0,
          buyerIds: new Set(),
        };
      }
      groups[sid].items.push(item);
      groups[sid].totalAmount += Number(item.subtotal || item.product_price * item.quantity);
      groups[sid].itemCount += item.quantity;
      if (item.order?.buyer_id) groups[sid].buyerIds.add(item.order.buyer_id);
    });

    const result = Object.values(groups).map(g => ({
      ...g,
      buyerCount: g.buyerIds.size,
      buyerIds: undefined,
    }));

    setSellers(result);
    setLoading(false);
  }, []);

  const dispatchItems = useCallback(async (itemIds, sellerId, adminId) => {
    const now = new Date().toISOString();

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

    const { error: notifErr } = await supabase
      .from('notifications')
      .insert({
        user_id: sellerId,
        type: 'new_order',
        title: 'Nouvelles commandes assignées',
        body: `${itemIds.length} article(s) à traiter vous ont été assignés par l'administration.`,
        resource_type: 'order_item',
        resource_id: null,
      });

    const { error: logErr } = await supabase
      .from('admin_logs')
      .insert({
        admin_id: adminId,
        action: 'dispatch_to_seller',
        resource_type: 'order_item',
        new_value: { seller_id: sellerId, item_ids: itemIds, count: itemIds.length },
      });

    if (notifErr || logErr) {
      console.error('Notification or log error:', notifErr || logErr);
    }

    return { success: true };
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

  return { sellers, loading, error, dispatchItems, refresh };
}
