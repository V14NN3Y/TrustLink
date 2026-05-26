import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { StorageManager } from '@/lib/storage';

export function useSupabaseDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Get live exchange rate from storage (set by useExchangeRate)
      const rateData = StorageManager.getExchangeRate();
      const liveRate = (rateData?.rate) || 1.832;

      // Run all independent queries in parallel
      const [
        { count: totalOrders, error: e1 },
        { data: escrowData, error: e2 },
        { count: sellerCount, error: e3 },
        { count: pendingProducts, error: e4 },
        { count: pendingPayouts, error: e5 },
        { data: payoutOrders, error: e6 },
        { count: disputesCount, error: e8 },
        { count: activeVoyages, error: e9 },
        { count: confirmedOrders, error: e10 },
        { count: nonCancelledOrders, error: e11 },
        { data: monthlyData, error: e12 },
      ] = await Promise.all([
        // 1. Total orders
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        // 2. Escrow volume (active orders only)
        supabase.from('orders').select('total_amount').in('status', ['paid', 'processing', 'in_transit', 'delivered', 'confirmed']),
        // 3. Active sellers
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'seller'),
        // 4. Pending catalogue products
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'pending_review'),
        // 5. Pending payouts count
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'paid'),
        // 6. Payout order IDs (for amount calculation)
        supabase.from('orders').select('id').eq('status', 'paid'),
        // 7. (index 6 = e8) Open disputes
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'disputed'),
        // 8. Active voyages
        supabase.from('dispatches').select('*', { count: 'exact', head: true }).not('status', 'in', '("delivered","cancelled")'),
        // 9. Confirmed orders
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
        // 10. Non-cancelled orders
        supabase.from('orders').select('*', { count: 'exact', head: true }).not('status', 'eq', 'cancelled'),
        // 11. Monthly volume (last 6 months)
        supabase.from('orders').select('total_amount, created_at').gte('created_at', new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString()),
      ]);

      // Check critical errors
      if (e1) throw e1;
      if (e2) throw e2;

      const escrowVolume = (escrowData || []).reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0);

      // Payout amount (depends on payoutOrders from step 6)
      let payoutsAmount = 0;
      if (!e6 && payoutOrders && payoutOrders.length > 0) {
        const orderIds = payoutOrders.map(o => o.id);
        const { data: items } = await supabase.from('order_items').select('subtotal').in('order_id', orderIds);
        payoutsAmount = (items || []).reduce((acc, i) => acc + (Number(i.subtotal) || 0), 0);
      }

      const successRate = nonCancelledOrders && nonCancelledOrders > 0
        ? Number(((confirmedOrders || 0) / nonCancelledOrders * 100).toFixed(1))
        : 0;

      // Group volume by month (use live exchange rate for NGN)
      const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
      const volumeByMonth = {};
      (monthlyData || []).forEach(o => {
        const d = new Date(o.created_at);
        const key = months[d.getMonth()];
        if (!volumeByMonth[key]) volumeByMonth[key] = { month: key, xof: 0, ngn: 0 };
        volumeByMonth[key].xof += Number(o.total_amount) || 0;
        volumeByMonth[key].ngn += Math.round((Number(o.total_amount) || 0) / liveRate);
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
      const msg = err?.message || err?.error_description || err?.details || 'Erreur inconnue';
      console.error('Dashboard stats error:', msg, err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refresh: fetchStats };
}
