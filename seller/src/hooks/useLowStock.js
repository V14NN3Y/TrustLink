import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useLowStock(sellerId, threshold = 5) {
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sellerId) { setLoading(false); return; }
    supabase.from('products')
      .select('id, name, price, stock_quantity, status')
      .eq('seller_id', sellerId)
      .lte('stock_quantity', threshold)
      .in('status', ['approved', 'pending_review'])
      .order('stock_quantity', { ascending: true })
      .then(({ data }) => { setLowStock(data || []); setLoading(false); });
  }, [sellerId, threshold]);

  return { lowStock, loading };
}
