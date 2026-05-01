import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import HeroBanner from './components/HeroBanner';
import CategoryBar from './components/CategoryBar';
import TrustBanner from './components/TrustBanner';
import ProductGrid from './components/ProductGrid';
export default function Home() {
  const [searchParams] = useSearchParams();
  const [sort, setSort] = useState('popular');
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const { data: products = [], isLoading, error } = useProducts({ category, search });
  const sorted = useMemo(() => {
    const result = [...products];
    if (sort === 'price_asc') result.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') result.sort((a, b) => b.price - a.price);
    // 'popular' → ordre par défaut (created_at desc depuis Supabase)
    return result;
  }, [products, sort]);
  const showHero = !search && !category;
  const gridTitle = search
    ? `Résultats pour "${search}"`
    : category
    ? `Catégorie : ${category.charAt(0).toUpperCase() + category.slice(1)}`
    : 'Tous les produits';
  return (
    <div className="pt-20 md:pt-20">
      {showHero && <HeroBanner />}
      {showHero && <TrustBanner />}
      <CategoryBar />
      <ProductGrid
        products={sorted}
        title={gridTitle}
        sort={sort}
        onSortChange={setSort}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}
