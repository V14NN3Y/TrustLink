import { Link } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/utils/format';

const DELIVERY_FEE = 2500;

export default function Cart() {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="pt-24 pb-12 flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="text-7xl mb-5">🛒</div>
        <h1 className="text-2xl font-poppins font-bold mb-3" style={{ color: '#111827' }}>Votre panier est vide</h1>
        <p className="text-sm font-inter mb-8" style={{ color: '#6B7280' }}>Ajoutez des produits pour commencer vos achats.</p>
        <Link to="/" className="px-8 py-3 text-white font-poppins font-semibold rounded-full transition-opacity hover:opacity-90" style={{ backgroundColor: '#FF6A00' }}>
          Continuer mes achats
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <h1 className="text-2xl font-poppins font-bold mb-6" style={{ color: '#111827' }}>
          Mon Panier <span className="text-base font-inter font-normal" style={{ color: '#6B7280' }}>({items.length} articles)</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <article key={item.productId} className="bg-white border border-gray-100 rounded-xl p-4 flex gap-4">
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0" style={{ backgroundColor: '#F8FAFC' }}>
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover object-top" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-inter font-medium mb-1 truncate" style={{ color: '#111827' }}>{item.name}</p>
                  {item.selectedSize && <p className="text-xs font-inter mb-0.5" style={{ color: '#6B7280' }}>Taille: {item.selectedSize}</p>}
                  {item.selectedColor && <p className="text-xs font-inter mb-2" style={{ color: '#6B7280' }}>Couleur: {item.selectedColor}</p>}
                  <p className="text-sm font-poppins font-bold mb-3" style={{ color: '#125C8D' }}>{formatPrice(item.price)}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-sm font-medium">−</button>
                      <span className="w-10 text-center text-sm font-inter">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-sm font-medium">+</button>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-poppins font-bold" style={{ color: '#111827' }}>{formatPrice(item.price * item.quantity)}</span>
                      <button onClick={() => removeItem(item.productId)} className="transition-colors" style={{ color: '#F87171' }} onMouseEnter={(e) => e.currentTarget.style.color='#DC2626'} onMouseLeave={(e) => e.currentTarget.style.color='#F87171'}>
                        <i className="ri-delete-bin-line text-lg"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-100 rounded-xl p-6 sticky top-24">
              <h2 className="text-base font-poppins font-semibold mb-4" style={{ color: '#111827' }}>Récapitulatif</h2>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm font-inter">
                  <span style={{ color: '#6B7280' }}>Sous-total</span>
                  <span style={{ color: '#111827' }}>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm font-inter">
                  <span style={{ color: '#6B7280' }}>Frais de livraison</span>
                  <span style={{ color: '#111827' }}>{formatPrice(DELIVERY_FEE)}</span>
                </div>
                <hr className="border-gray-100" />
                <div className="flex justify-between font-poppins font-bold">
                  <span style={{ color: '#111827' }}>Total</span>
                  <span style={{ color: '#125C8D' }}>{formatPrice(totalPrice + DELIVERY_FEE)}</span>
                </div>
              </div>

              {/* Escrow mini */}
              <div className="rounded-xl p-3 mb-4" style={{ backgroundColor: '#E1F0F9' }}>
                <div className="flex items-center gap-2">
                  <i className="ri-shield-check-line text-sm" style={{ color: '#125C8D' }}></i>
                  <p className="text-xs font-poppins font-semibold" style={{ color: '#125C8D' }}>Paiement Escrow sécurisé</p>
                </div>
                <p className="text-xs font-inter mt-1" style={{ color: '#6B7280' }}>Vos fonds sont protégés jusqu'à la réception de votre commande.</p>
              </div>

              <Link to="/checkout" className="block text-center text-white font-poppins font-bold py-3 rounded-full transition-opacity hover:opacity-90" style={{ backgroundColor: '#FF6A00' }}>
                Passer la commande
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
