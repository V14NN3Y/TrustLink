import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProduct } from '@/hooks/useProduct';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useReviews } from '@/hooks/useReviews';
import { formatPrice, renderStars } from '@/utils/format';
import ProductCard from '@/pages/home/components/ProductCard';
import ReviewsSection from './components/ReviewsSection';
import { useProducts } from '@/hooks/useProducts';
export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const { data: product, isLoading, error } = useProduct(id);
  const { data: allProducts = [] } = useProducts({});
  const { stats } = useReviews(id);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  if (isLoading) {
    return (
      <div className="pt-24 pb-12">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-8 animate-pulse">
            <div className="rounded-xl bg-gray-100 h-96" />
            <div className="space-y-4">
              <div className="h-6 bg-gray-100 rounded w-3/4" />
              <div className="h-8 bg-gray-100 rounded w-1/2" />
              <div className="h-4 bg-gray-100 rounded w-full" />
              <div className="h-4 bg-gray-100 rounded w-5/6" />
              <div className="h-4 bg-gray-100 rounded w-4/6" />
              <div className="h-12 bg-gray-100 rounded-full w-full mt-4" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (error || !product) {
    return (
      <div className="pt-24 pb-12 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-xl font-poppins font-bold mb-3" style={{ color: '#111827' }}>Produit introuvable</h1>
        <p className="text-sm font-inter mb-6" style={{ color: '#6B7280' }}>
          Ce produit n&apos;existe pas ou n&apos;est plus disponible.
        </p>
        <Link
          to="/"
          className="px-6 py-2.5 text-white font-poppins font-semibold rounded-full whitespace-nowrap"
          style={{ backgroundColor: '#FF6A00' }}
        >
          Retour à la boutique
        </Link>
      </div>
    );
  }
  const similar = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);
  const stars = renderStars(stats.average || 0);
  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      image: product.images[0],
      price: product.price,
      quantity: qty,
      selectedSize,
      selectedColor,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };
  const handleBuyNow = () => {
    addItem({
      productId: product.id,
      name: product.name,
      image: product.images[0],
      price: product.price,
      quantity: qty,
      selectedSize,
      selectedColor,
    });
    navigate('/cart');
  };
  const categoryLabels = {
    mode: 'Mode',
    beaute: 'Beauté',
    hightech: 'High-Tech',
    auto: 'Auto',
    maison: 'Maison',
    sport: 'Sport',
  };
  return (
    <div className="pt-24 pb-12">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-inter mb-6" style={{ color: '#6B7280' }}>
          <Link to="/" className="hover:underline cursor-pointer">Accueil</Link>
          <span>/</span>
          <Link to={`/?category=${product.category}`} className="hover:underline cursor-pointer">
            {categoryLabels[product.category] || product.categoryName}
          </Link>
          <span>/</span>
          <span style={{ color: '#111827' }}>{product.name}</span>
        </nav>
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery */}
          <div>
            <div
              className="rounded-xl overflow-hidden w-full"
              style={{ backgroundColor: '#F8FAFC', height: '420px' }}
            >
              <img
                src={product.images[selectedImage] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover object-top"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className="w-20 h-20 rounded-lg overflow-hidden cursor-pointer flex-shrink-0"
                    style={{
                      outline: idx === selectedImage ? '2px solid #125C8D' : '2px solid transparent',
                      outlineOffset: '2px',
                    }}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover object-top" />
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Info */}
          <div>
            {/* Seller */}
            <div className="flex items-center gap-2 mb-2">
              <i className="ri-store-2-line text-sm" style={{ color: '#6B7280' }}></i>
              <span className="text-sm font-inter" style={{ color: '#6B7280' }}>{product.seller}</span>
              <span
                className="text-xs font-poppins font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: '#DCFCE7', color: '#15803D' }}
              >
                ✓ Vérifié
              </span>
            </div>
            {/* Title */}
            <h1 className="text-2xl font-poppins font-bold mb-3" style={{ color: '#111827' }}>
              {product.name}
            </h1>
            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex gap-0.5">
                {stars.map((cls, i) => (
                  <i key={i} className={`${cls} text-amber-400`} style={{ fontSize: '13px' }}></i>
                ))}
              </div>
              <span className="text-xs font-inter" style={{ color: '#6B7280' }}>
                {stats.count > 0
                  ? `${stats.average}/5 · ${stats.count} avis`
                  : 'Nouveau produit'}
              </span>
            </div>
            {/* Price */}
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-2xl font-poppins font-bold" style={{ color: '#125C8D' }}>
                {formatPrice ? formatPrice(product.price) : `${product.price} €`}
              </span>
              {product.originalPrice && (
                <span className="text-sm font-inter line-through" style={{ color: '#6B7280' }}>
                  {formatPrice ? formatPrice(product.originalPrice) : `${product.originalPrice} €`}
                </span>
              )}
              {product.discount && (
                <span
                  className="text-xs font-poppins font-bold rounded-full px-2 py-0.5 text-white"
                  style={{ backgroundColor: '#FF6A00' }}
                >
                  -{product.discount}%
                </span>
              )}
            </div>
            {/* Stock warning */}
            {product.stock <= 5 && product.stock > 0 && (
              <p className="text-xs font-inter mb-2" style={{ color: '#D97706' }}>
                <i className="ri-alarm-warning-line mr-1"></i>
                Plus que {product.stock} en stock !
              </p>
            )}
            {product.stock === 0 && (
              <p className="text-xs font-inter mb-2 font-semibold" style={{ color: '#DC2626' }}>
                Rupture de stock
              </p>
            )}
            <hr className="border-gray-100 my-4" />
            {/* Sizes */}
            {product.variants?.sizes?.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-poppins font-medium mb-2" style={{ color: '#111827' }}>Taille :</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className="px-3 py-1.5 text-sm font-inter border rounded-full transition-all cursor-pointer"
                      style={selectedSize === s
                        ? { borderColor: '#125C8D', backgroundColor: '#E1F0F9', color: '#125C8D' }
                        : { borderColor: '#E5E7EB', color: '#111827' }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Colors */}
            {product.variants?.colors?.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-poppins font-medium mb-2" style={{ color: '#111827' }}>
                  Couleur :{selectedColor && <span className="font-normal ml-1">{selectedColor}</span>}
                </p>
                <div className="flex gap-2">
                  {product.variants.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      title={c.name}
                      className="w-7 h-7 rounded-full border-2 transition-all cursor-pointer"
                      style={{
                        backgroundColor: c.hex,
                        borderColor: c.hex === '#FFFFFF' ? '#E5E7EB' : c.hex,
                        outline: selectedColor === c.name ? '2px solid #125C8D' : '2px solid transparent',
                        outlineOffset: '2px',
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            {/* Quantity */}
            <div className="flex items-center gap-3 mb-5">
              <p className="text-sm font-poppins font-medium" style={{ color: '#111827' }}>Quantité :</p>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 text-lg font-medium cursor-pointer"
                >
                  −
                </button>
                <span className="w-12 text-center text-sm font-inter font-medium">{qty}</span>
                <button
                  onClick={() => setQty(Math.min(product.stock || 99, qty + 1))}
                  className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 text-lg font-medium cursor-pointer"
                  disabled={product.stock === 0}
                >
                  +
                </button>
              </div>
            </div>
            {/* CTA Buttons */}
            <div className="flex gap-3 mb-5">
              <button
                onClick={handleAdd}
                disabled={product.stock === 0}
                className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-poppins font-semibold rounded-full transition-all disabled:opacity-50 cursor-pointer whitespace-nowrap"
                style={added
                  ? { backgroundColor: '#DCFCE7', color: '#15803D' }
                  : { backgroundColor: '#E1F0F9', color: '#125C8D' }}
                onMouseEnter={(e) => {
                  if (!added && product.stock > 0) {
                    e.currentTarget.style.backgroundColor = '#125C8D';
                    e.currentTarget.style.color = '#fff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!added) {
                    e.currentTarget.style.backgroundColor = '#E1F0F9';
                    e.currentTarget.style.color = '#125C8D';
                  }
                }}
              >
                <i className="ri-shopping-cart-add-line"></i>
                {added ? '✓ Ajouté !' : 'Ajouter au panier'}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex-1 py-3 text-sm font-poppins font-semibold rounded-full text-white transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer whitespace-nowrap"
                style={{ backgroundColor: '#FF6A00' }}
              >
                Acheter maintenant
              </button>
            </div>
            {/* Wishlist */}
            <button
              onClick={() => toggle(product.id)}
              className="flex items-center gap-2 text-sm font-inter mb-5 cursor-pointer"
              style={{ color: isWishlisted && isWishlisted(product.id) ? '#DC2626' : '#6B7280' }}
            >
              <i className={isWishlisted && isWishlisted(product.id) ? 'ri-heart-fill' : 'ri-heart-line'}></i>
              {isWishlisted && isWishlisted(product.id) ? 'Retiré des favoris' : 'Ajouter aux favoris'}
            </button>
            {/* Escrow block */}
            <div className="rounded-xl p-4" style={{ backgroundColor: '#E1F0F9' }}>
              <div className="flex items-center gap-2 mb-3">
                <i className="ri-shield-check-line" style={{ color: '#125C8D' }}></i>
                <span className="text-sm font-poppins font-semibold" style={{ color: '#125C8D' }}>
                  Paiement Escrow TrustLink
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-inter flex-wrap" style={{ color: '#6B7280' }}>
                {['Vous payez', 'Vendeur notifié', 'Hub TrustLink', 'Vous recevez'].map((step, i, arr) => (
                  <span key={step} className="flex items-center gap-1">
                    <span className="font-medium" style={{ color: '#125C8D' }}>{i + 1}. {step}</span>
                    {i < arr.length - 1 && <i className="ri-arrow-right-s-line"></i>}
                  </span>
                ))}
              </div>
            </div>
            {/* Description */}
            {product.description && (
              <p className="text-sm font-inter mt-4 leading-relaxed" style={{ color: '#6B7280' }}>
                {product.description}
              </p>
            )}
          </div>
        </div>
        {/* Similar products */}
        {similar.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-poppins font-semibold mb-6" style={{ color: '#111827' }}>
              Vous aimerez aussi
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {similar.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
        <ReviewsSection productId={product.id} />  {/* Est-ce bien placer? */}
      </div>
    </div>
  );
}
