import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
export function useSupabaseFinance() {
  const [payouts, setPayouts] = useState([]);
  const [auditEntries, setAuditEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: ordersData } = await supabase
      .from('orders')
      .select(`
        id, status, total_amount, currency, created_at, updated_at,
        order_items (
          id, seller_id, subtotal,
          seller:profiles!seller_id (full_name, business_name)
        ),
        buyer:profiles!buyer_id (full_name)
      `)
      .eq('status', 'paid');
    const { data: logsData } = await supabase
      .from('admin_logs')
      .select('*')
      .order('created_at', { ascending: false });
    // Normaliser les payouts à partir des orders
    const normalizedPayouts = (ordersData || []).map((order, idx) => {
      const item = order.order_items?.[0];
      const seller = item?.seller;
      return {
        id: `pay-${order.id.slice(-4)}`,
        seller_name: seller?.full_name || seller?.business_name || '—',
        seller_id: item?.seller_id?.slice(0, 8) || '—',
        amount_ngn: item?.subtotal || order.total_amount || 0,
        amount_xof: Math.round((item?.subtotal || order.total_amount || 0) * 1.832),
        status: 'PENDING_REVIEW',
        orders: [order.id],
        requested_at: order.updated_at || order.created_at,
        bank: '—',
        account_number: '—',
      };
    });
    const normalizedLogs = (logsData || []).map((log, idx) => ({
      id: log.id || `aud-${idx}`,
      type: log.action?.toUpperCase()?.includes('RATE') ? 'RATE_CHANGE' :
            log.action?.toUpperCase()?.includes('PAYOUT') ? 'PAYOUT' :
            log.action?.toUpperCase()?.includes('DISPUTE') ? 'DISPUTE' :
            log.action?.toUpperCase()?.includes('MODERATION') ? 'MODERATION' :
            log.action?.toUpperCase()?.includes('SPREAD') ? 'SPREAD' : 'MODERATION',
      description: `${log.action}${log.resource_type ? ` (${log.resource_type})` : ''}`,
      user: log.admin_id?.slice(0, 8) || 'Système',
      timestamp: log.created_at,
    }));
    setPayouts(normalizedPayouts);
    setAuditEntries(normalizedLogs);
    setLoading(false);
  }, []);
  useEffect(() => { fetchData(); }, [fetchData]);
  return { payouts, auditEntries, loading, refresh: fetchData };
}
