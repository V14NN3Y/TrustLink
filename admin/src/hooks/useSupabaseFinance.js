import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Mapping payout_status enum -> UI labels
const STATUS_MAP = {
  pending_review: 'PENDING_REVIEW',
  approved: 'APPROVED',
  rejected: 'REJECTED',
  paid: 'PAID',
};

export function useSupabaseFinance() {
  const [payouts, setPayouts] = useState([]);
  const [auditEntries, setAuditEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);

    // 1. Récupérer les payouts depuis la table dédiée
    const { data: payoutsData, error: payoutsError } = await supabase
      .from('payouts')
      .select(`
        id,
        seller_id,
        amount_xof,
        status,
        created_at,
        resolved_at,
        resolved_by,
        seller:profiles!seller_id (full_name, business_name)
      `)
      .order('created_at', { ascending: false });

    if (payoutsError) {
      console.error('Erreur chargement payouts:', payoutsError);
      setPayouts([]);
    } else {
      const normalizedPayouts = (payoutsData || []).map((p) => ({
        id: p.id,
        seller_name: p.seller?.full_name || p.seller?.business_name || '—',
        seller_id: p.seller_id?.slice(0, 8) || '—',
        amount_ngn: Math.round(p.amount_xof / 1.832),
        amount_xof: p.amount_xof,
        status: STATUS_MAP[p.status] || 'PENDING_REVIEW',
        orders: [], // À remplir plus tard si besoin via order_items
        requested_at: p.created_at,
      }));
      setPayouts(normalizedPayouts);
    }

    // 2. Journal d'audit depuis admin_logs
    const { data: logsData } = await supabase
      .from('admin_logs')
      .select('*')
      .order('created_at', { ascending: false });

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
    setAuditEntries(normalizedLogs);

    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { payouts, auditEntries, loading, refresh: fetchData };
}
