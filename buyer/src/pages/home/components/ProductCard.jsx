import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { formatPrice, renderStars } from '@/utils/format';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const [added, setAdded] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    addItem({ productId: product.id, name: product.name, image: product.images[0], price: product.price, quantity: 1 });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const stars = renderStars(product.rating);
  const wishlisted = isWishlisted(product.id);

  return (
    <Link to={`/product/${product.id}`} className="group flex flex-col bg-white rounded-xl overflow-hidden hover:-translate-y-1 transition-all duration-300 cursor-pointer" style={{ border: '1px solid #F0F0F0' }}>
      {/* Image */}
      <div className="relative overflow-hidden" style={{ backgroundColor: '#F8FAFC', height: '200px' }}>
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
        />
        {product.discount && (
          <span className="absolute top-2.5 left-2.5 text-white text-xs font-poppins font-bold rounded-md px-2 py-1" style={{ backgroundColor: '#FF6A00' }}>
            -{product.discount}%
          </span>
        )}
        {!product.discount && product.isNew && (
          <span className="absolute top-2.5 left-2.5 text-white text-xs font-poppins font-bold rounded-md px-2 py-1" style={{ backgroundColor: '#125C8D' }}>
            Nouveau
          </span>
        )}
        <button
          onClick={(e) => { e.preventDefault(); toggle(product.id); }}
          className="absolute top-2.5 right-2.5 w-8 h-8 bg-white rounded-full flex items-center justify-center transition-transform hover:scale-110"
          style={{ border: wishlisted ? 'none' : '1px solid #E5E7EB' }}
        >
          <i className={`text-sm ${wishlisted ? 'ri-heart-fill' : 'ri-heart-line'}`} style={{ color: wishlisted ? '#FF6A00' : '#9CA3AF' }}></i>
        </button>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <p className="text-sm font-inter font-medium mb-2 line-clamp-2 leading-snug" style={{ color: '#111827' }}>{product.name}</p>

        <div className="flex items-center gap-1 mb-2">
          {stars.map((cls, i) => (
            <i key={i} className={`${cls}`} style={{ fontSize: '11px', color: '#F59E0B' }}></i>
          ))}
          <span className="text-xs font-inter ml-0.5" style={{ color: '#9CA3AF' }}>{product.rating} ({product.sales} ventes)</span>
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-base font-poppins font-bold" style={{ color: '#125C8D' }}>{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-xs font-inter line-through" style={{ color: '#9CA3AF' }}>{formatPrice(product.originalPrice)}</span>
          )}
        </div>

        <button
          onClick={handleAdd}
          className="w-full py-2 text-sm font-poppins font-medium rounded-lg transition-all duration-200 mt-auto flex items-center justify-center gap-1.5"
          style={added
            ? { backgroundColor: '#DCFCE7', color: '#15803D' }
            : { backgroundColor: '#EBF4FB', color: '#125C8D' }}
          onMouseEnter={(e) => { if (!added) { e.currentTarget.style.backgroundColor = '#125C8D'; e.currentTarget.style.color = '#fff'; } }}
          onMouseLeave={(e) => { if (!added) { e.currentTarget.style.backgroundColor = '#EBF4FB'; e.currentTarget.style.color = '#125C8D'; } }}
        >
          {added ? (
            <>✓ Ajouté !</>
          ) : (
            <><i className="ri-shopping-cart-line text-sm"></i> Ajouter au panier</>
          )}
        </button>
      </div>
    </Link>
  );
}
