import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useProductPerformance(sellerId) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!sellerId) { setLoading(false); return; }
    setLoading(true);
    const { data: prodData } = await supabase.from('products')
      .select('id, name, price, stock_quantity, status, created_at')
      .eq('seller_id', sellerId);
    if (!prodData) { setLoading(false); return; }
    const ids = prodData.map(p => p.id);

    const { data: viewData } = await supabase.from('product_views')
      .select('product_id', { count: 'exact' })
      .in('product_id', ids);
    const viewCounts = {};
    (viewData || []).forEach(v => { viewCounts[v.product_id] = (viewCounts[v.product_id] || 0) + 1; });

    const { data: salesData } = await supabase.from('order_items')
      .select('product_id, quantity')
      .in('product_id', ids)
      .not('status', 'in', '("cancelled","refunded","disputed")');
    const salesMap = {};
    (salesData || []).forEach(s => { salesMap[s.product_id] = (salesMap[s.product_id] || 0) + (s.quantity || 1); });

    const formatted = prodData.map(p => ({
      id: p.id, name: p.name, price: Number(p.price), stock: p.stock_quantity,
      status: p.status, views: viewCounts[p.id] || 0, sales: salesMap[p.id] || 0,
      conversion: viewCounts[p.id] > 0 ? Math.round(((salesMap[p.id] || 0) / viewCounts[p.id]) * 100) : 0,
      created_at: p.created_at,
    }));
    setProducts(formatted);
    setLoading(false);
  }, [sellerId]);

  useEffect(() => { fetchData(); }, [fetchData]);
  return { products, loading, refetch: fetchData };
}
