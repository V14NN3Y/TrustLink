import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useSupabaseProducts(status = null, exchangeRate = 1.832) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('products')
      .select('*, seller:profiles!seller_id (full_name, business_name), images:product_images (*)');
    if (status) {
      query = query.eq('status', status);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (!error && data) {
      const normalized = data.map((p) => ({
        id: p.id,
        name: p.name,
        category: 'Électronique', // à enrichir quand categories sera peuplé
        seller_name: p.seller?.business_name || p.seller?.full_name || '—',
        seller_id: p.seller_id?.slice(0, 8),
        price_ngn: exchangeRate > 0 ? Math.round(p.price / exchangeRate) : 0,
        price_xof: p.price || 0,
        images: p.images?.map(i => i.url) || ['https://via.placeholder.com/400'],
        description: p.description || '—',
        status: p.status.toUpperCase(),
        submitted_at: p.created_at,
      }));
      setProducts(normalized);
    }
    setLoading(false);
  }, [status, exchangeRate]);
  const updateProduct = useCallback(async (id, newStatus) => {
    const { error } = await supabase
      .from('products')
      .update({ status: newStatus.toLowerCase(), updated_at: new Date().toISOString() })
      .eq('id', id);
    if (!error) {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, status: newStatus.toUpperCase() } : p));
    }
  }, []);
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  return { products, loading, refresh: fetchProducts, updateProduct };
}
