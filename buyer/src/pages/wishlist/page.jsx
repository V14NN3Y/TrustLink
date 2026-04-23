import { Link } from 'react-router-dom';
import { PRODUCTS } from '@/mocks/products';
import { useWishlist } from '@/hooks/useWishlist';
import ProductCard from '@/pages/home/components/ProductCard';

export default function Wishlist() {
  const { items } = useWishlist();
  const products = PRODUCTS.filter((p) => items.includes(p.id));

  return (
    <div className="pt-24 pb-12">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <h1 className="text-2xl font-poppins font-bold mb-8" style={{ color: '#111827' }}>
          Ma liste de souhaits
          <span className="text-base font-inter font-normal ml-2" style={{ color: '#6B7280' }}>({products.length} articles)</span>
        </h1>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="text-7xl mb-5">💝</div>
            <h2 className="text-xl font-poppins font-semibold mb-2" style={{ color: '#111827' }}>Votre liste est vide</h2>
            <p className="text-sm font-inter mb-8" style={{ color: '#6B7280' }}>Ajoutez des produits en cliquant sur le ♡ sur les fiches produits.</p>
            <Link to="/" className="px-8 py-3 text-white font-poppins font-semibold rounded-full transition-opacity hover:opacity-90" style={{ backgroundColor: '#FF6A00' }}>
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
