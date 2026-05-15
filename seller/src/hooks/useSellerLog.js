import { useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';

export function useSellerLog() {
  const { user } = useAuth();

  const logAction = useCallback(async (action, details = {}) => {
    if (!user?.id) return;
    try {
      await supabase.from('seller_logs').insert({
        seller_id: user.id,
        action,
        details: JSON.stringify(details),
        created_at: new Date().toISOString(),
      });
    } catch {
    }
  }, [user?.id]);

  return { logAction };
}
