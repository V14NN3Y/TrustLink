import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/lib/AuthContext';
import ProductCard from '@/pages/home/components/ProductCard';
export default function Wishlist() {
  const { isAuthenticated } = useAuth();
  const { products, loading, loadWishlistProducts, items } = useWishlist();
  useEffect(() => {
    if (isAuthenticated) {
      loadWishlistProducts();
    }
  }, [isAuthenticated, loadWishlistProducts]);
  return (
    <div className="pt-24 pb-12 min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-poppins font-bold" style={{ color: '#111827' }}>
              Ma Liste de Souhaits
            </h1>
            <p className="text-sm font-inter mt-1" style={{ color: '#9CA3AF' }}>
              {items.length} produit{items.length !== 1 ? 's' : ''} sauvegardé{items.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link to="/" className="text-sm font-inter flex items-center gap-1 hover:underline" style={{ color: '#125C8D' }}>
            <span>+</span> Ajouter des produits
          </Link>
        </div>
        {/* Non connecté */}
        {!isAuthenticated && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#EBF4FB' }}>
              <i className="ri-lock-line text-2xl" style={{ color: '#125C8D' }}></i>
            </div>
            <h2 className="text-lg font-poppins font-semibold mb-2" style={{ color: '#111827' }}>
              Connectez-vous pour voir votre wishlist
            </h2>
            <p className="text-sm font-inter mb-6" style={{ color: '#9CA3AF' }}>
              Vos favoris sont sauvegardés sur votre compte.
            </p>
            <Link
              to="/login"
              className="px-6 py-3 text-white font-poppins font-semibold rounded-full transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#FF6A00' }}
            >
              Se connecter
            </Link>
          </div>
        )}
        {/* Chargement */}
        {isAuthenticated && loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse" style={{ border: '1px solid #F0F0F0' }}>
                <div className="h-[200px] bg-gray-100" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-5 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Wishlist vide */}
        {isAuthenticated && !loading && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5" style={{ backgroundColor: '#FFF0F0' }}>
              <i className="ri-heart-line text-3xl" style={{ color: '#FF6A00' }}></i>
            </div>
            <h2 className="text-lg font-poppins font-semibold mb-2" style={{ color: '#111827' }}>
              Votre liste est vide
            </h2>
            <p className="text-sm font-inter mb-8 text-center" style={{ color: '#9CA3AF' }}>
              Ajoutez des produits à vos favoris en cliquant sur le cœur
            </p>
            <Link
              to="/"
              className="flex items-center gap-2 px-6 py-3 text-white font-poppins font-semibold rounded-full transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#0E3A4F' }}
            >
              <i className="ri-store-2-line text-sm"></i>
              Découvrir les produits
            </Link>
          </div>
        )}
        {/* Grille produits */}
        {isAuthenticated && !loading && products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
