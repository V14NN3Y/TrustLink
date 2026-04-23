import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PRODUCTS } from '@/mocks/products';
import HeroBanner from './components/HeroBanner';
import CategoryBar from './components/CategoryBar';
import TrustBanner from './components/TrustBanner';
import ProductGrid from './components/ProductGrid';

export default function Home() {
  const [searchParams] = useSearchParams();
  const [sort, setSort] = useState('popular');

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';

  const filtered = useMemo(() => {
    let result = [...PRODUCTS];
    if (category) result = result.filter((p) => p.category === category);
    if (search) result = result.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    if (sort === 'price_asc') result.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') result.sort((a, b) => b.price - a.price);
    else result.sort((a, b) => b.sales - a.sales);
    return result;
  }, [category, search, sort]);

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
      <ProductGrid products={filtered} title={gridTitle} sort={sort} onSortChange={setSort} />
    </div>
  );
}
