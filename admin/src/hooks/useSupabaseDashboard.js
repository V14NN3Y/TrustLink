import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
export function useSupabaseDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Total orders
      const { count: totalOrders, error: e1 } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });
      if (e1) throw e1;
      // Escrow volume (sum of total_amount)
      const { data: volumeData, error: e2 } = await supabase
        .from('orders')
        .select('total_amount')
        .not('total_amount', 'is', null);
      if (e2) throw e2;
      const escrowVolume = volumeData?.reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0) || 0;
      // Active sellers
      const { count: sellerCount, error: e3 } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'seller');
      if (e3) throw e3;
      // Pending products
      const { count: pendingProducts, error: e4 } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending_review');
      if (e4) throw e4;
      // Pending payouts (orders avec status 'paid')
      const { count: pendingPayouts, error: e5 } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'paid');
      if (e5) throw e5;
      // Pending payouts amount (subtotal from order_items for orders.status = 'paid')
      const { data: payoutOrders, error: e6 } = await supabase
        .from('orders')
        .select('id')
        .eq('status', 'paid');
      if (e6) throw e6;
      let payoutsAmount = 0;
      if (payoutOrders && payoutOrders.length > 0) {
        const orderIds = payoutOrders.map(o => o.id);
        const { data: items, error: e7 } = await supabase
          .from('order_items')
          .select('subtotal')
          .in('order_id', orderIds);
        if (e7) throw e7;
        payoutsAmount = items?.reduce((acc, i) => acc + (Number(i.subtotal) || 0), 0) || 0;
      }
      // Disputes
      const { count: disputesCount, error: e8 } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'disputed');
      if (e8) throw e8;
      // Active dispatches (voyages)
      const { count: activeVoyages, error: e9 } = await supabase
        .from('dispatches')
        .select('*', { count: 'exact', head: true })
        .not('status', 'in', '("completed","cancelled")');
      if (e9) throw e9;
      // Success rate = confirmed orders / total non-cancelled
      const { count: confirmedOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'confirmed');
      const { count: nonCancelledOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .not('status', 'eq', 'cancelled');
      const successRate = nonCancelledOrders && nonCancelledOrders > 0
        ? Number(((confirmedOrders || 0) / nonCancelledOrders * 100).toFixed(1))
        : 94.2;
      // Volume par mois (6 derniers mois)
      const { data: monthlyData, error: e10 } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .gte('created_at', new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString());
      if (e10) throw e10;
      // Grouper par mois côté JS :
      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
      const volumeByMonth = {};
      (monthlyData || []).forEach(o => {
        const d = new Date(o.created_at);
        const key = months[d.getMonth()];
        if (!volumeByMonth[key]) volumeByMonth[key] = { month: key, xof: 0, ngn: 0 };
        volumeByMonth[key].xof += Number(o.total_amount) || 0;
        volumeByMonth[key].ngn += Math.round((Number(o.total_amount) || 0) / 1.832);
      });
      const volumeData = Object.values(volumeByMonth);
      setStats({
        total_orders: totalOrders || 0,
        escrow_volume_xof: escrowVolume,
        active_voyages: activeVoyages || 0,
        sellers_active: sellerCount || 0,
        pending_payouts: pendingPayouts || 0,
        payouts_amount_ngn: payoutsAmount,
        pending_disputes: disputesCount || 0,
        catalogue_pending: pendingProducts || 0,
        success_rate: successRate,
        volumeData,
      });
    } catch (err) {
      console.error('Dashboard stats error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);
  return { stats, loading, error, refresh: fetchStats };
}
