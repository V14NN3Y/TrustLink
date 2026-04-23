import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PRODUCTS } from '@/mocks/products';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { formatPrice, renderStars } from '@/utils/format';
import ProductCard from '@/pages/home/components/ProductCard';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();

  const product = PRODUCTS.find((p) => p.id === id);

  useEffect(() => {
    if (!product) navigate('/');
  }, [product, navigate]);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const similar = PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const stars = renderStars(product.rating);

  const handleAdd = () => {
    addItem({ productId: product.id, name: product.name, image: product.images[0], price: product.price, quantity: qty, selectedSize, selectedColor });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    addItem({ productId: product.id, name: product.name, image: product.images[0], price: product.price, quantity: qty, selectedSize, selectedColor });
    navigate('/cart');
  };

  const categoryLabels = { mode: 'Mode', beaute: 'Beauté', hightech: 'High-Tech', auto: 'Auto', maison: 'Maison', sport: 'Sport' };

  return (
    <div className="pt-24 pb-12">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-inter mb-6" style={{ color: '#6B7280' }}>
          <Link to="/" className="hover:underline">Accueil</Link>
          <span>/</span>
          <Link to={`/?category=${product.category}`} className="hover:underline">{categoryLabels[product.category]}</Link>
          <span>/</span>
          <span style={{ color: '#111827' }}>{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Gallery */}
          <div>
            <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#F8FAFC', height: '384px' }}>
              <img src={product.images[selectedImage] || product.images[0]} alt={product.name} className="w-full h-full object-cover object-top" />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2 mt-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className="w-20 h-20 rounded-lg overflow-hidden"
                    style={{ ring: idx === selectedImage ? '2px solid #125C8D' : 'none', outline: idx === selectedImage ? '2px solid #125C8D' : '2px solid transparent' }}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover object-top" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <i className="ri-store-2-line text-sm" style={{ color: '#6B7280' }}></i>
              <span className="text-sm font-inter" style={{ color: '#6B7280' }}>{product.seller}</span>
              <span className="text-xs font-poppins font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#DCFCE7', color: '#15803D' }}>✓ Vérifié</span>
            </div>

            <h1 className="text-2xl font-poppins font-bold mb-3" style={{ color: '#111827' }}>{product.name}</h1>

            <div className="flex items-center gap-2 mb-3">
              <div className="flex gap-0.5">
                {stars.map((cls, i) => <i key={i} className={`${cls} text-amber-400`} style={{ fontSize: '13px' }}></i>)}
              </div>
              <span className="text-xs font-inter" style={{ color: '#6B7280' }}>{product.rating} • {product.sales} ventes</span>
            </div>

            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-2xl font-poppins font-bold" style={{ color: '#125C8D' }}>{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="text-sm font-inter line-through" style={{ color: '#6B7280' }}>{formatPrice(product.originalPrice)}</span>
              )}
              {product.discount && (
                <span className="text-xs font-poppins font-bold rounded-full px-2 py-0.5 text-white" style={{ backgroundColor: '#FF6A00' }}>-{product.discount}%</span>
              )}
            </div>

            <hr className="border-gray-100 my-4" />

            {/* Sizes */}
            {product.variants.sizes.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-poppins font-medium mb-2" style={{ color: '#111827' }}>Taille :</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className="px-3 py-1.5 text-sm font-inter border rounded-full transition-all"
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
            {product.variants.colors.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-poppins font-medium mb-2" style={{ color: '#111827' }}>
                  Couleur : {selectedColor && <span className="font-normal">{selectedColor}</span>}
                </p>
                <div className="flex gap-2">
                  {product.variants.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      title={c.name}
                      className="w-7 h-7 rounded-full border-2 transition-all"
                      style={{
                        backgroundColor: c.hex,
                        borderColor: c.hex === '#FFFFFF' ? '#E5E7EB' : c.hex,
                        outline: selectedColor === c.name ? `2px solid #125C8D` : '2px solid transparent',
                        outlineOffset: '2px',
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Qty */}
            <div className="flex items-center gap-3 mb-5">
              <p className="text-sm font-poppins font-medium" style={{ color: '#111827' }}>Quantité :</p>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 text-lg font-medium" style={{ color: '#111827' }}>−</button>
                <span className="w-12 text-center text-sm font-inter font-medium" style={{ color: '#111827' }}>{qty}</span>
                <button onClick={() => setQty(Math.min(99, qty + 1))} className="w-9 h-9 flex items-center justify-center hover:bg-gray-50 text-lg font-medium" style={{ color: '#111827' }}>+</button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mb-5">
              <button
                onClick={handleAdd}
                className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-poppins font-semibold rounded-full transition-all"
                style={added
                  ? { backgroundColor: '#DCFCE7', color: '#15803D' }
                  : { backgroundColor: '#E1F0F9', color: '#125C8D' }}
                onMouseEnter={(e) => { if (!added) { e.currentTarget.style.backgroundColor = '#125C8D'; e.currentTarget.style.color = '#fff'; } }}
                onMouseLeave={(e) => { if (!added) { e.currentTarget.style.backgroundColor = '#E1F0F9'; e.currentTarget.style.color = '#125C8D'; } }}
              >
                <i className="ri-shopping-cart-add-line"></i>
                {added ? '✓ Ajouté !' : 'Ajouter au panier'}
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 py-3 text-sm font-poppins font-semibold rounded-full text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#FF6A00' }}
              >
                Acheter maintenant
              </button>
            </div>

            {/* Escrow block */}
            <div className="rounded-xl p-4" style={{ backgroundColor: '#E1F0F9' }}>
              <div className="flex items-center gap-2 mb-3">
                <i className="ri-shield-check-line" style={{ color: '#125C8D' }}></i>
                <span className="text-sm font-poppins font-semibold" style={{ color: '#125C8D' }}>Paiement Escrow TrustLink</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-inter" style={{ color: '#6B7280' }}>
                {['Vous payez', 'Vendeur notifié', 'Hub TrustLink', 'Vous recevez'].map((step, i, arr) => (
                  <>
                    <span key={step} className="font-medium" style={{ color: '#125C8D' }}>{i + 1}. {step}</span>
                    {i < arr.length - 1 && <i className="ri-arrow-right-s-line"></i>}
                  </>
                ))}
              </div>
            </div>

            <p className="text-sm font-inter mt-4 leading-relaxed" style={{ color: '#6B7280' }}>{product.description}</p>
          </div>
        </div>

        {/* Similar products */}
        {similar.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-poppins font-semibold mb-6" style={{ color: '#111827' }}>Vous aimerez aussi</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {similar.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
