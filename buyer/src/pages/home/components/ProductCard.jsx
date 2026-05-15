import { useNavigate } from 'react-router-dom';
import { useWishlist } from '@/hooks/useWishlist';
import { formatPrice, renderStars } from '@/utils/format';
import LazyImage from '@/components/base/LazyImage';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { toggle, isWishlisted } = useWishlist();
  const stars = renderStars(product.rating);
  const wishlisted = isWishlisted(product.id);

  const sellerStars = renderStars(product.seller_rating || 0);

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="group flex flex-col bg-white rounded-xl overflow-hidden hover:-translate-y-1 transition-all duration-300 cursor-pointer"
      style={{ border: '1px solid #F0F0F0' }}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ backgroundColor: '#F8FAFC', height: '200px' }}>
        <LazyImage
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full"
          style={{ objectFit: 'cover', objectPosition: 'top' }}
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

        {/* Seller with rating badge */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <i className="ri-store-2-line text-[10px]" style={{ color: '#9CA3AF' }}></i>
          <span className="text-[11px] font-inter" style={{ color: '#6B7280' }}>{product.seller}</span>
          {product.seller_rating > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
              <i className="ri-star-fill" style={{ fontSize: '8px' }}></i>
              {product.seller_rating}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 mb-2">
          {stars.map((cls, i) => (
            <i key={i} className={`${cls}`} style={{ fontSize: '11px', color: '#F59E0B' }}></i>
          ))}
          <span className="text-xs font-inter ml-0.5" style={{ color: '#9CA3AF' }}>{product.rating} ({product.sales} ventes)</span>
        </div>

        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-base font-poppins font-bold" style={{ color: '#125C8D' }}>{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-xs font-inter line-through" style={{ color: '#9CA3AF' }}>{formatPrice(product.originalPrice)}</span>
          )}
        </div>

        {/* Delivery estimate */}
        {product.delivery_min_days && product.delivery_max_days && (
          <p className="text-[10px] font-inter mb-3" style={{ color: '#6B7280' }}>
            <i className="ri-truck-line mr-0.5"></i>
            Livré en {product.delivery_min_days}-{product.delivery_max_days} jours
          </p>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.id}`); }}
          className="w-full py-2 text-sm font-poppins font-medium rounded-lg transition-all duration-200 mt-auto flex items-center justify-center gap-1.5 cursor-pointer"
          style={{ backgroundColor: '#EBF4FB', color: '#125C8D' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#125C8D'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#EBF4FB'; e.currentTarget.style.color = '#125C8D'; }}
        >
          <i className="ri-eye-line text-sm"></i> Voir le produit
        </button>
      </div>
    </div>
  );
}
