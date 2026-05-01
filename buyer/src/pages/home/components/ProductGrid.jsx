import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
const SORT_OPTIONS = [
  { value: 'popular', label: 'Populaires' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
];
// Skeleton card
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
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-lg font-poppins font-semibold mb-2" style={{ color: '#111827' }}>Erreur de chargement</h3>
        <p className="text-sm font-inter mb-6 text-center" style={{ color: '#6B7280' }}>
          Impossible de charger les produits. Vérifiez votre connexion.
        </p>
      </div>
    );
  }
  return (
    <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl md:text-2xl font-poppins font-bold" style={{ color: '#111827' }}>{title}</h2>
          {!isLoading && (
            <p className="text-sm font-inter mt-0.5" style={{ color: '#6B7280' }}>{products.length} produits trouvés</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-inter flex-shrink-0" style={{ color: '#6B7280' }}>Trier par :</span>
          <div className="flex gap-1.5">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onSortChange(opt.value)}
                className="px-3 py-1.5 text-xs font-poppins font-medium rounded-full border transition-all whitespace-nowrap cursor-pointer"
                style={sort === opt.value
                  ? { backgroundColor: '#125C8D', color: '#fff', borderColor: '#125C8D' }
                  : { color: '#111827', borderColor: '#E5E7EB', backgroundColor: '#fff' }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-poppins font-semibold mb-2" style={{ color: '#111827' }}>Aucun produit trouvé</h3>
          <p className="text-sm font-inter mb-6 text-center" style={{ color: '#6B7280' }}>
            Essayez une autre recherche ou explorez toutes nos catégories.
          </p>
          <Link
            to="/"
            className="px-6 py-2.5 text-white text-sm font-poppins font-semibold rounded-full whitespace-nowrap"
            style={{ backgroundColor: '#FF6A00' }}
          >
            Voir tous les produits
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
