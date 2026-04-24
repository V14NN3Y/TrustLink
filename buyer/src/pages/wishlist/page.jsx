import { Link } from 'react-router-dom';
import { PRODUCTS } from '@/mocks/products';
import { useWishlist } from '@/hooks/useWishlist';
import ProductCard from '@/pages/home/components/ProductCard';

export default function Wishlist() {
  const { items } = useWishlist();
  const products = PRODUCTS.filter((p) => items.includes(p.id));

  return (
    <div className="pt-24 pb-12 min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-poppins font-bold" style={{ color: '#111827' }}>Ma Liste de Souhaits</h1>
            <p className="text-sm font-inter mt-1" style={{ color: '#9CA3AF' }}>{products.length} produit{products.length !== 1 ? 's' : ''} sauvegardé{products.length !== 1 ? 's' : ''}</p>
          </div>
          <Link to="/" className="text-sm font-inter flex items-center gap-1 hover:underline" style={{ color: '#125C8D' }}>
            <span>+</span> Ajouter des produits
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5" style={{ backgroundColor: '#FFF0F0' }}>
              <i className="ri-heart-line text-3xl" style={{ color: '#FF6A00' }}></i>
            </div>
            <h2 className="text-lg font-poppins font-semibold mb-2" style={{ color: '#111827' }}>Votre liste est vide</h2>
            <p className="text-sm font-inter mb-8 text-center" style={{ color: '#9CA3AF' }}>Ajoutez des produits à vos favoris en cliquant sur le cœur</p>
            <Link to="/" className="flex items-center gap-2 px-6 py-3 text-white font-poppins font-semibold rounded-full transition-opacity hover:opacity-90" style={{ backgroundColor: '#0E3A4F' }}>
              <i className="ri-store-2-line text-sm"></i>
              Découvrir les produits
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
