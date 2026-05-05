import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Construit la timeline de suivi d'un colis à partir du statut de la commande
function buildStepsFromStatus(status) {
  const allSteps = [
    { key: 'collected',  label: 'Collecté',         status: 'pending' },
    { key: 'departed',   label: 'Départ camion',     status: 'pending' },
    { key: 'border',     label: 'Frontière',         status: 'pending' },
    { key: 'customs',    label: 'Dédouanement',      status: 'pending' },
    { key: 'delivered',  label: 'Livraison finale',  status: 'pending' },
  ];
  const completedMap = {
    processing: 1,
    in_transit: 2,
    delivered:  4,
    confirmed:  4,
    disputed:   4,
  };
  const completedCount = completedMap[status] || 0;
  return allSteps.map((s, i) => ({
    ...s,
    status:
      i < completedCount  ? 'completed' :
      i === completedCount ? 'current'   :
                            'pending',
  }));
}

export function useSupabaseLogistics() {
  const [dispatches, setDispatches] = useState([]);
  const [orders, setOrders] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);

    // 1. Voyages (dispatches)
    const { data: dispatchesData } = await supabase
      .from('dispatches')
      .select('*')
      .order('created_at', { ascending: false });

    // 2. Packages : article par article avec statut parent
    const { data: itemsData } = await supabase
      .from('order_items')
      .select(`
        id, quantity,
        product:products (name),
        seller:profiles!seller_id (full_name),
        order:orders!order_id (id, shipping_city, status, buyer:profiles!buyer_id (full_name))
      `)
      .order('created_at', { ascending: false });

    const normalizedPackages = (itemsData || []).map(item => ({
      id: item.id,
      order_ref: `TL-${item.order?.id?.slice(-4) || '????'}`,
      product: `${item.product?.name || '—'} × ${item.quantity}`,
      buyer: item.order?.buyer?.full_name || '—',
      weight_kg: 0,
      hub: item.order?.shipping_city || 'Lagos',
      steps: buildStepsFromStatus(item.order?.status),
    }));
    setPackages(normalizedPackages);

    // 3. Commandes complètes pour la vue manifeste
    const { data: ordersData } = await supabase
      .from('orders')
      .select(`
        id, ref, status, shipping_city, total_amount, created_at, updated_at,
        order_items (
          id, quantity, subtotal,
          product:products (name),
          seller:profiles!seller_id (full_name)
        ),
        buyer:profiles!buyer_id (full_name)
      `)
      .order('created_at', { ascending: false });

    setDispatches(dispatchesData || []);
    setOrders(ordersData || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { dispatches, orders, packages, loading, refresh: fetchData };
}
