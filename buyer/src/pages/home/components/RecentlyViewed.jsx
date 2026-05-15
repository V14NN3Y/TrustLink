import { useState, useEffect } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { getRecentlyViewed } from '@/lib/storage';
import ProductCard from './ProductCard';

export default function RecentlyViewed() {
  const [ids, setIds] = useState([]);
  const { data: allProducts = [] } = useProducts({});

  useEffect(() => {
    setIds(getRecentlyViewed());
  }, []);

  if (ids.length === 0) return null;

  const products = allProducts.filter(p => ids.includes(p.id)).slice(0, 4);
  if (products.length === 0) return null;

  return (
    <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-6">
      <h2 className="text-xl font-poppins font-bold mb-4" style={{ color: '#111827' }}>Consultés récemment</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}
