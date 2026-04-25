import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PRODUCTS } from '@/mocks/products';
import { getCatalogApproved } from '@/lib/sharedStorage';
import { sharedProductToProduct } from '@/utils/productAdapter';
import HeroBanner from './components/HeroBanner';
import CategoryBar from './components/CategoryBar';
import TrustBanner from './components/TrustBanner';
import ProductGrid from './components/ProductGrid';

export default function Home() {
  const [searchParams] = useSearchParams();
  const [sort, setSort] = useState('popular');

  // Produits approuvés par l'Admin (tl_catalog_approved) + écoute live
  const [approvedProducts, setApprovedProducts] = useState(() =>
    getCatalogApproved().map(sharedProductToProduct)
  );

  useEffect(() => {
    const refresh = () => {
      setApprovedProducts(getCatalogApproved().map(sharedProductToProduct));
    };
    window.addEventListener('tl_storage_update', refresh);
    return () => window.removeEventListener('tl_storage_update', refresh);
  }, []);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';

  // Merger : approuvés en premier (nouveaux arrivages), mocks en fallback
  const allProducts = useMemo(() => {
    const approvedIds = new Set(approvedProducts.map((p) => p.id));
    const mockFallback = PRODUCTS.filter((p) => !approvedIds.has(p.id));
    return [...approvedProducts, ...mockFallback];
  }, [approvedProducts]);

  const filtered = useMemo(() => {
    let result = [...allProducts];
    if (category) result = result.filter((p) => p.category === category);
    if (search) result = result.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    if (sort === 'price_asc') result.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') result.sort((a, b) => b.price - a.price);
    else result.sort((a, b) => (b.sales || 0) - (a.sales || 0));
    return result;
  }, [allProducts, category, search, sort]);

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
