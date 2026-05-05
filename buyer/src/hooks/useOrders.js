import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { fetchOrders } from '@/lib/supabase/orders';
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
  return { orders, loading, error, reload: loadOrders };
}
