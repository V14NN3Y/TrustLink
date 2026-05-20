import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getRecentlyViewed } from '@/lib/storage';
import ProductCard from './ProductCard';

export default function RecentlyViewed() {
  const [products, setProducts] = useState([]);
  const [ids, setIds] = useState([]);

  useEffect(() => {
    const storedIds = getRecentlyViewed();
    setIds(storedIds);
    if (storedIds.length === 0) return;

    supabase
      .from('products')
      .select(`
        id, name, price, stock_quantity, created_at, delivery_min_days, delivery_max_days,
        product_images (url, is_primary, sort_order),
        profiles!seller_id (full_name, business_name)
      `)
      .eq('status', 'approved')
      .in('id', storedIds.slice(0, 4))
      .then(({ data }) => {
        if (!data) return;
        const normalized = data.map(p => {
          const sortedImages = [...(p.product_images || [])].sort((a, b) => {
            if (a.is_primary && !b.is_primary) return -1;
            if (!a.is_primary && b.is_primary) return 1;
            return (a.sort_order || 0) - (b.sort_order || 0);
          });
          return {
            id: p.id,
            name: p.name,
            price: Number(p.price),
            images: sortedImages.map(i => i.url).length > 0
              ? sortedImages.map(i => i.url)
              : ['https://readdy.ai/api/search-image?query=product+placeholder+clean+white+background+minimal&width=400&height=400&seq=placeholder1&orientation=squarish'],
            seller: p.profiles?.business_name || p.profiles?.full_name || 'Vendeur TrustLink',
            delivery_min_days: p.delivery_min_days,
            delivery_max_days: p.delivery_max_days,
            rating: 0,
            sales: 0,
            seller_rating: 0,
            discount: null,
            isNew: false,
            originalPrice: null,
          };
        });
        setProducts(normalized);
      });
  }, []);

  if (ids.length === 0 || products.length === 0) return null;

  return (
    <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-6">
      <h2 className="text-xl font-poppins font-bold mb-4" style={{ color: '#111827' }}>Consultés récemment</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}
