import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { formatPrice, generateTracking, convertToNGN } from '@/utils/format';
import { generateOrderId, addOrder, getAuthUserId } from '@/lib/storage';

const CITIES = ['Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi', 'Bohicon'];
const PAYMENT_METHODS = [
  { id: 'mtn', label: 'Mobile Money MTN', icon: 'ri-smartphone-line', color: '#FCD34D' },
  { id: 'moov', label: 'Mobile Money Moov', icon: 'ri-smartphone-line', color: '#3B82F6' },
  { id: 'wave', label: 'Wave', icon: 'ri-bank-card-line', color: '#06B6D4' },
];

const STEPS = ['Adresse', 'Paiement', 'Confirmation'];

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState({ firstName: '', lastName: '', city: '', district: '', phone: '' });
  const [payMethod, setPayMethod] = useState('mtn');
  const [orderData, setOrderData] = useState(null);

  const DELIVERY = 2500;

  const handleStep1 = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleConfirm = () => {
    // Generate unified order ID: TL-2026-XXXXX
    const orderId = generateOrderId();
    const trackingNumber = generateTracking();
    const now = new Date().toISOString();
    const totalXof = totalPrice + DELIVERY;
    const totalNgn = convertToNGN(totalXof);
    const buyerName = `${address.firstName} ${address.lastName}`.trim();

    // Build shared-format order for Seller Hub + Admin
    const sharedOrder = {
      id: orderId,
      product_id: items.length === 1 ? items[0].productId : items.map((i) => i.productId).join(','),
      product_name: items.length === 1 ? items[0].name : `${items.length} articles`,
      seller_id: items[0]?._seller_id || 'seller-001',
      buyer_id: getAuthUserId(),
      buyer_name: buyerName || 'Acheteur TrustLink',
      buyer_city: address.city,
      quantity: items.reduce((sum, i) => sum + i.quantity, 0),
      amount_xof: totalXof,
      amount_ngn: totalNgn,
      status: 'new',
      hub: 'Lagos Hub',
      payment_method: payMethod,
      created_at: now,
      updated_at: now,
      // Keep buyer-specific details
      items: items.map((i) => ({
        productId: i.productId,
        name: i.name,
        image: i.image,
        price: i.price,
        quantity: i.quantity,
      })),
      total: totalXof,
      address: {
        name: buyerName,
        city: address.city,
        district: address.district,
        phone: address.phone,
      },
      trackingNumber,
      createdAt: now,
    };

    // Write to shared localStorage (tl_orders)
    addOrder(sharedOrder);

    clearCart();
    setOrderData({ orderId, trackingNumber });
    setStep(3);
  };

  return (
    <div className="pt-24 pb-12">
      <div className="max-w-[768px] mx-auto px-4 md:px-6">
        <h1 className="text-2xl font-poppins font-bold mb-6 text-center" style={{ color: '#111827' }}>Finaliser ma commande</h1>

        {/* Stepper */}
        <div className="flex items-center justify-center mb-10 gap-0">
          {STEPS.map((s, idx) => {
            const num = idx + 1;
            const done = step > num;
            const active = step === num;
            return (
              <div key={s} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-poppins font-bold"
                    style={{ backgroundColor: done ? '#16A34A' : active ? '#125C8D' : '#E5E7EB', color: done || active ? '#fff' : '#6B7280' }}>
                    {done ? <i className="ri-check-line"></i> : num}
                  </div>
                  <span className="text-xs font-poppins" style={{ color: active ? '#125C8D' : '#6B7280' }}>{s}</span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className="w-16 md:w-24 h-0.5 mb-5 mx-2" style={{ backgroundColor: done ? '#16A34A' : '#E5E7EB' }}></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <form onSubmit={handleStep1} className="bg-white border border-gray-100 rounded-xl p-6">
            <h2 className="text-base font-poppins font-semibold mb-5" style={{ color: '#111827' }}>Adresse de livraison</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-poppins font-medium mb-1.5" style={{ color: '#111827' }}>Prénom</label>
                <input required value={address.firstName} onChange={(e) => setAddress({ ...address, firstName: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-inter outline-none focus:border-[#125C8D]" placeholder="Kouassi" />
              </div>
              <div>
                <label className="block text-xs font-poppins font-medium mb-1.5" style={{ color: '#111827' }}>Nom</label>
                <input required value={address.lastName} onChange={(e) => setAddress({ ...address, lastName: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-inter outline-none focus:border-[#125C8D]" placeholder="Mensah" />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-poppins font-medium mb-1.5" style={{ color: '#111827' }}>Ville</label>
              <select required value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-inter outline-none focus:border-[#125C8D]">
                <option value="">Sélectionner une ville</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-poppins font-medium mb-1.5" style={{ color: '#111827' }}>Quartier</label>
              <input required value={address.district} onChange={(e) => setAddress({ ...address, district: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-inter outline-none focus:border-[#125C8D]" placeholder="Cadjehoun" />
            </div>
            <div className="mb-6">
              <label className="block text-xs font-poppins font-medium mb-1.5" style={{ color: '#111827' }}>Téléphone</label>
              <input required value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-inter outline-none focus:border-[#125C8D]" placeholder="+229 97 12 34 56" />
            </div>
            <button type="submit" className="w-full py-3 text-white font-poppins font-bold rounded-full transition-opacity hover:opacity-90" style={{ backgroundColor: '#FF6A00' }}>
              Continuer vers le paiement →
            </button>
          </form>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h2 className="text-base font-poppins font-semibold mb-4" style={{ color: '#111827' }}>Récapitulatif de commande</h2>
            <div className="space-y-2 mb-4">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm font-inter">
                  <span style={{ color: '#6B7280' }}>{item.name} × {item.quantity}</span>
                  <span style={{ color: '#111827' }}>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-inter">
                <span style={{ color: '#6B7280' }}>Livraison</span>
                <span style={{ color: '#111827' }}>{formatPrice(DELIVERY)}</span>
              </div>
              <hr className="border-gray-100" />
              <div className="flex justify-between font-poppins font-bold">
                <span style={{ color: '#111827' }}>Total</span>
                <span style={{ color: '#125C8D' }}>{formatPrice(totalPrice + DELIVERY)}</span>
              </div>
            </div>

            {/* Escrow steps */}
            <div className="rounded-xl p-4 mb-5" style={{ backgroundColor: '#E1F0F9' }}>
              <p className="text-xs font-poppins font-semibold mb-3" style={{ color: '#125C8D' }}>
                <i className="ri-shield-check-line mr-1"></i>Comment fonctionne l'Escrow
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['1. Vous payez', '2. TrustLink sécurise', '3. Vendeur livre au Hub', '4. Vous recevez & validez'].map((s) => (
                  <div key={s} className="text-center">
                    <p className="text-xs font-poppins font-medium" style={{ color: '#125C8D' }}>{s}</p>
                  </div>
                ))}
              </div>
            </div>

            <h3 className="text-sm font-poppins font-semibold mb-3" style={{ color: '#111827' }}>Méthode de paiement</h3>
            <div className="space-y-3 mb-6">
              {PAYMENT_METHODS.map((m) => (
                <label key={m.id} className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all"
                  style={{ borderColor: payMethod === m.id ? '#125C8D' : '#E5E7EB', backgroundColor: payMethod === m.id ? '#E1F0F9' : '#fff' }}>
                  <input type="radio" name="pay" value={m.id} checked={payMethod === m.id} onChange={() => setPayMethod(m.id)} className="sr-only" />
                  <i className={`${m.icon} text-lg`} style={{ color: m.color }}></i>
                  <span className="text-sm font-poppins font-medium" style={{ color: '#111827' }}>{m.label}</span>
                  {payMethod === m.id && <i className="ri-check-line ml-auto" style={{ color: '#125C8D' }}></i>}
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-3 text-sm font-poppins font-semibold rounded-full border border-gray-200 transition-colors hover:bg-gray-50" style={{ color: '#111827' }}>
                ← Retour
              </button>
              <button onClick={handleConfirm} className="flex-1 py-3 text-white font-poppins font-bold rounded-full transition-opacity hover:opacity-90" style={{ backgroundColor: '#FF6A00' }}>
                Confirmer et payer
              </button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && orderData && (
          <div className="bg-white border border-gray-100 rounded-xl p-8 text-center">
            <i className="ri-checkbox-circle-fill text-6xl mb-4 block" style={{ color: '#16A34A' }}></i>
            <h2 className="text-2xl font-poppins font-bold mb-2" style={{ color: '#111827' }}>Commande confirmée !</h2>
            <p className="text-sm font-inter mb-6" style={{ color: '#6B7280' }}>Merci pour votre achat. Vos fonds sont sécurisés par Escrow.</p>
            <div className="rounded-xl p-4 mb-6 text-left space-y-2" style={{ backgroundColor: '#E1F0F9' }}>
              <p className="text-sm font-poppins"><span className="font-medium" style={{ color: '#6B7280' }}>N° commande : </span><span className="font-bold" style={{ color: '#125C8D' }}>{orderData.orderId}</span></p>
              <p className="text-sm font-poppins"><span className="font-medium" style={{ color: '#6B7280' }}>N° suivi : </span><span className="font-bold" style={{ color: '#125C8D' }}>{orderData.trackingNumber}</span></p>
              <p className="text-sm font-inter" style={{ color: '#6B7280' }}>Délai estimé : <span className="font-medium" style={{ color: '#111827' }}>2 à 7 jours ouvrables</span></p>
            </div>
            <div className="flex gap-3">
              <Link to="/account" className="flex-1 py-3 text-center text-sm font-poppins font-semibold rounded-full border border-gray-200 transition-colors hover:bg-gray-50" style={{ color: '#111827' }}>
                Voir mes commandes
              </Link>
              <Link to="/" className="flex-1 py-3 text-center text-white font-poppins font-bold rounded-full transition-opacity hover:opacity-90" style={{ backgroundColor: '#FF6A00' }}>
                Continuer mes achats
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
