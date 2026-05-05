import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { JOURNEY_STEPS } from '@/constants/orderStatuses';

export function useSupabaseOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchOrders = useCallback(async () => {
    setLoading(true);

    const { data, error: err } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          seller:profiles!seller_id (full_name, business_name),
          product:products (name)
        ),
        buyer:profiles!buyer_id (full_name, email)
      `)
      .order('created_at', { ascending: false });
    if (err) {
      console.error('Erreur Supabase orders:', err);
      setError(err.message);
      setOrders([]);
      setLoading(false);
      return;
    }
    const normalized = (data || []).map((order) => ({
      id: order.id,
      ref: `TL-${new Date(order.created_at).getFullYear()}-${order.id.slice(-4)}`,
      status: (order.status || 'pending').toUpperCase(),
      journey_step: mapStatusToStep(order.status),
      hub_origin: order.shipping_city || 'Lagos',
      seller_name: order.order_items?.[0]?.seller?.full_name || '—',
      seller_id: order.order_items?.[0]?.seller_id?.slice(0, 8) || '—',
      buyer_name: order.buyer?.full_name || '—',
      product: order.order_items?.map((i) => `${i.product?.name || '—'} × ${i.quantity}`).join(', ') || '—',
      amount_xof: order.total_amount || 0,
      amount_ngn: order.order_items?.reduce((acc, i) => acc + (i.subtotal || 0), 0) || 0,
      created_at: order.created_at,
      voyage_id: null,
      dispute_reason: null,
    }));
    setOrders(normalized);
    setLoading(false);
  }, []);
  const updateOrder = useCallback(async (updatedOrder) => {

    const { error: err } = await supabase
      .from('orders')
      .update({
        status: updatedOrder.status.toLowerCase(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', updatedOrder.id);
    if (err) {
      console.error('Erreur mise à jour order:', err);
      return;
    }
    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o));
  }, []);
  useEffect(() => {
    fetchOrders();
    const channel = supabase
      .channel('orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchOrders]);
  return { orders, loading, error, refresh: fetchOrders, updateOrder };
}
function mapStatusToStep(status) {
  const map = {
    pending: 'awaiting_payment',
    paid: 'payment_confirmed',
    processing: 'ready_to_ship',
    in_transit: 'in_transit',
    delivered: 'delivered',
    confirmed: 'delivered',
    disputed: 'dispute_opened',
    cancelled: 'awaiting_payment',
    refunded: 'awaiting_payment',
  };
  return map[status] || 'awaiting_payment';
}
