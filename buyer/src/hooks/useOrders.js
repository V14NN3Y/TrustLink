import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { fetchOrders } from '@/lib/supabase/orders';
import { supabase } from '@/lib/supabaseClient';
export function useOrders() {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const loadOrders = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOrders(user.id);
      setOrders(data);
    } catch (err) {
      console.error('Erreur chargement commandes:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id]);
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);
  const confirmDelivery = useCallback(async (orderData) => {
    try {
      // Si c'est un groupe (plusieurs commandes), mettre à jour toutes les commandes du groupe
      const orderIds = orderData.orderIds || [orderData.id];
      const { error } = await supabase
        .from('orders')
        .update({ status: 'confirmed', updated_at: new Date().toISOString() })
        .in('id', orderIds);
      if (error) throw error;
      // Mettre à jour l'état local
      setOrders((prev) => prev.map((o) => 
        orderIds.includes(o.id) || (o.groupId && o.groupId === orderData.groupId)
          ? { ...o, status: 'confirmed' }
          : o
      ));
      return true;
    } catch (err) {
      console.error('Erreur confirmation:', err);
      throw err;
    }
  }, []);
  return { orders, loading, error, confirmDelivery, reload: loadOrders };
}
