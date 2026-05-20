import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';

const SORT_OPTIONS = [
  { value: 'popular', label: 'Populaires' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
  { value: 'rating', label: 'Meilleures notes' },
];

const ITEMS_PER_PAGE = 20;

function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden animate-pulse" style={{ border: '1px solid #F0F0F0' }}>
      <div className="h-[200px] bg-gray-100" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-5 bg-gray-100 rounded w-1/3" />
        <div className="h-8 bg-gray-100 rounded-lg" />
      </div>
    </div>
  );
}

export default function ProductGrid({ products, title = 'Tous les produits', sort, onSortChange, isLoading, error }) {
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = [...products];
    if (priceMin) result = result.filter(p => p.price >= Number(priceMin));
    if (priceMax) result = result.filter(p => p.price <= Number(priceMax));
    if (minRating > 0) result = result.filter(p => (p.rating || 0) >= minRating);
    if (sort === 'price_asc') result.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') result.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return result;
  }, [products, priceMin, priceMax, minRating, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  if (error) {
    return (
      <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col items-center justify-center py-24 px-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#FEE2E2' }}>
            <i className="ri-cloud-off-line text-2xl" style={{ color: '#DC2626' }}></i>
          </div>
          <h3 className="text-lg font-poppins font-semibold mb-2" style={{ color: '#111827' }}>Service momentanément indisponible</h3>
          <p className="text-sm font-inter mb-6 text-center max-w-md" style={{ color: '#6B7280' }}>Nos produits sont en cours de chargement. Veuillez réessayer dans quelques instants.</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2.5 text-white text-sm font-poppins font-semibold rounded-full cursor-pointer" style={{ backgroundColor: '#125C8D' }}>
            <i className="ri-refresh-line mr-1.5"></i>Réessayer
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-poppins font-bold" style={{ color: '#111827' }}>{title}</h2>
          {!isLoading && <p className="text-sm font-inter mt-0.5" style={{ color: '#6B7280' }}>{filtered.length} produits trouvés</p>}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-poppins font-medium rounded-full border transition-all cursor-pointer"
            style={{ color: showFilters ? '#fff' : '#111827', borderColor: showFilters ? '#125C8D' : '#E5E7EB', backgroundColor: showFilters ? '#125C8D' : '#fff' }}>
            <i className="ri-equalizer-line text-sm"></i> Filtres
          </button>
          <span className="text-sm font-inter flex-shrink-0" style={{ color: '#6B7280' }}>Trier :</span>
          <div className="flex gap-1.5 flex-wrap">
            {SORT_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => onSortChange(opt.value)}
                className="px-3 py-1.5 text-xs font-poppins font-medium rounded-full border transition-all whitespace-nowrap cursor-pointer"
                style={sort === opt.value ? { backgroundColor: '#125C8D', color: '#fff', borderColor: '#125C8D' } : { color: '#111827', borderColor: '#E5E7EB', backgroundColor: '#fff' }}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-end" style={{ border: '1px solid #E5E7EB' }}>
          <div>
            <label className="text-xs font-inter text-gray-500 block mb-1">Prix min (FCFA)</label>
            <input type="number" value={priceMin} onChange={e => { setPriceMin(e.target.value); setPage(1); }}
              className="w-28 px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#125C8D]" placeholder="0" />
          </div>
          <div>
            <label className="text-xs font-inter text-gray-500 block mb-1">Prix max (FCFA)</label>
            <input type="number" value={priceMax} onChange={e => { setPriceMax(e.target.value); setPage(1); }}
              className="w-28 px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#125C8D]" placeholder="100000" />
          </div>
          <div>
            <label className="text-xs font-inter text-gray-500 block mb-1">Note minimum</label>
            <select value={minRating} onChange={e => { setMinRating(Number(e.target.value)); setPage(1); }}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#125C8D]">
              <option value={0}>Toutes les notes</option>
              <option value={4}>4★ et plus</option>
              <option value={3}>3★ et plus</option>
              <option value={2}>2★ et plus</option>
            </select>
          </div>
          {(priceMin || priceMax || minRating > 0) && (
            <button onClick={() => { setPriceMin(''); setPriceMax(''); setMinRating(0); setPage(1); }}
              className="px-3 py-1.5 text-xs font-poppins font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 cursor-pointer">
              <i className="ri-close-line mr-1"></i>Réinitialiser
            </button>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-poppins font-semibold mb-2" style={{ color: '#111827' }}>Aucun produit trouvé</h3>
          <p className="text-sm font-inter mb-6 text-center" style={{ color: '#6B7280' }}>Essayez de modifier vos filtres ou votre recherche.</p>
          <Link to="/" className="px-6 py-2.5 text-white text-sm font-poppins font-semibold rounded-full" style={{ backgroundColor: '#FF6A00' }}>Voir tous les produits</Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {paginated.map(product => <ProductCard key={product.id} product={product} />)}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-sm hover:bg-gray-50 disabled:opacity-30 cursor-pointer">
                <i className="ri-arrow-left-s-line"></i>
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                const p = i + 1;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-semibold cursor-pointer ${page === p ? 'text-white' : 'border border-gray-200 hover:bg-gray-50'}`}
                    style={page === p ? { backgroundColor: '#125C8D' } : { color: '#111827' }}>
                    {p}
                  </button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-sm hover:bg-gray-50 disabled:opacity-30 cursor-pointer">
                <i className="ri-arrow-right-s-line"></i>
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
