import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ORDERS } from '@/mocks/orders';
import { PRODUCTS } from '@/mocks/products';
import { useWishlist } from '@/hooks/useWishlist';
import { getSharedOrders, mapSharedStatusToMarketplace } from '@/lib/sharedStorage';
import { formatPrice } from '@/utils/format';

const STATUS_CONFIG = {
  processing: { label: 'En traitement', color: '#FF6A00', bg: '#FFF3EC' },
  shipped: { label: 'Expédiée', color: '#2563EB', bg: '#EFF6FF' },
  delivered: { label: 'Livrée', color: '#16A34A', bg: '#DCFCE7' },
  pending: { label: 'À payer', color: '#D97706', bg: '#FEF3C7' },
};

const ORDER_FILTERS = [
  { id: 'all', label: 'Toutes' },
  { id: 'pending', label: 'À payer' },
  { id: 'processing', label: 'En traitement' },
  { id: 'shipped', label: 'Expédiées' },
  { id: 'delivered', label: 'Livrées' },
];

const NAV = [
  { id: 'orders', label: 'Mes commandes', icon: 'ri-shopping-bag-line' },
  { id: 'wishlist', label: 'Ma wishlist', icon: 'ri-heart-line' },
  { id: 'settings', label: 'Paramètres', icon: 'ri-settings-3-line' },
];

export default function Account() {
  const [tab, setTab] = useState('orders');
  const [orderFilter, setOrderFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const { items: wishlistIds } = useWishlist();
  const wishlistProducts = PRODUCTS.filter((p) => wishlistIds.includes(p.id));

  const [profile, setProfile] = useState({ firstName: 'Adjoua', lastName: 'Mensah', email: 'adjoua.mensah@gmail.com', phone: '+229 97 45 23 11', city: 'Cotonou', country: 'Bénin' });
  const [address, setAddress] = useState('Quartier Cadjehoun, Rue 12.315, Cotonou');
  const [notifs, setNotifs] = useState({ orders: true, escrow: true, promo: false, newsletter: false, sms: true });

  const filteredOrders = orderFilter === 'all' ? ORDERS : ORDERS.filter((o) => o.status === orderFilter);

  return (
    <div className="pt-20 min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-inter mb-6" style={{ color: '#6B7280' }}>
          <Link to="/" className="hover:underline">Boutique</Link>
          <span>/</span>
          <span style={{ color: '#111827' }}>Mon Compte</span>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="md:w-[280px] flex-shrink-0">
            {/* Profile card */}
            <div className="bg-white rounded-xl overflow-hidden mb-4" style={{ border: '1px solid #E5E7EB' }}>
              <div className="h-20 relative" style={{ background: 'linear-gradient(135deg, #125C8D 0%, #0E3A4F 100%)' }}>
                <button className="absolute top-2 right-2 flex items-center gap-1.5 text-xs font-poppins text-white/80 bg-white/10 rounded-lg px-2.5 py-1 hover:bg-white/20 transition-colors">
                  <i className="ri-edit-line text-xs"></i> Modifier le profil
                </button>
              </div>
              <div className="px-5 pb-5">
                <div className="w-16 h-16 rounded-full bg-amber-200 flex items-center justify-center -mt-8 mb-3 border-3 border-white overflow-hidden" style={{ border: '3px solid white' }}>
                  <span className="text-xl font-poppins font-bold text-amber-800">AM</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-base font-poppins font-bold" style={{ color: '#111827' }}>Adjoua Mensah</h2>
                  <i className="ri-verified-badge-fill text-sm" style={{ color: '#125C8D' }}></i>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-inter mb-1" style={{ color: '#6B7280' }}>
                  <i className="ri-mail-line text-xs"></i>
                  <span>adjoua.mensah@gmail.com</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-inter mb-1" style={{ color: '#6B7280' }}>
                  <i className="ri-phone-line text-xs"></i>
                  <span>+229 97 45 23 11</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-inter mb-4" style={{ color: '#6B7280' }}>
                  <i className="ri-map-pin-line text-xs"></i>
                  <span>Cotonou, Bénin</span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 py-3 border-t border-gray-100">
                  {[
                    { icon: 'ri-shopping-bag-line', value: '14', label: 'Commandes' },
                    { icon: 'ri-money-cny-circle-line', value: '487 500', label: 'FCFA Dépensés' },
                    { icon: 'ri-shield-check-line', value: '14', label: 'Protégées Escrow' },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <i className={`${s.icon} text-base mb-1 block`} style={{ color: '#125C8D' }}></i>
                      <p className="text-xs font-poppins font-bold" style={{ color: '#111827' }}>{s.value}</p>
                      <p className="text-xs font-inter leading-tight" style={{ color: '#9CA3AF' }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Nav */}
            <div className="bg-white rounded-xl overflow-hidden mb-4" style={{ border: '1px solid #E5E7EB' }}>
              {NAV.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-poppins transition-colors border-b border-gray-50 last:border-0"
                  style={tab === item.id
                    ? { backgroundColor: '#EBF4FB', color: '#125C8D', fontWeight: '600' }
                    : { color: '#374151' }}
                >
                  <div className="flex items-center gap-3">
                    <i className={`${item.icon} text-base`}></i>
                    {item.label}
                    {item.id === 'wishlist' && wishlistProducts.length > 0 && (
                      <span className="text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center" style={{ backgroundColor: '#E5E7EB', color: '#374151' }}>
                        {wishlistProducts.length}
                      </span>
                    )}
                  </div>
                  <i className="ri-arrow-right-s-line text-base text-gray-400"></i>
                </button>
              ))}
              <button className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-poppins text-red-500 hover:bg-red-50 transition-colors">
                <i className="ri-logout-box-r-line text-base"></i>
                Se déconnecter
              </button>
            </div>

            {/* Escrow promo */}
            <div className="rounded-xl p-4" style={{ backgroundColor: '#FFF3EC', border: '1px solid #FFD0B0' }}>
              <div className="flex items-center gap-2 mb-2">
                <i className="ri-shield-star-line" style={{ color: '#FF6A00' }}></i>
                <p className="text-sm font-poppins font-semibold" style={{ color: '#FF6A00' }}>Protection Escrow</p>
              </div>
              <p className="text-xs font-inter leading-relaxed mb-3" style={{ color: '#6B7280' }}>
                Toutes vos commandes sont protégées. Le paiement n'est libéré qu'après votre accord.
              </p>
              <Link to="/legal?tab=escrow" className="text-xs font-poppins font-semibold" style={{ color: '#FF6A00' }}>
                En savoir plus →
              </Link>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Orders */}
            {tab === 'orders' && (
              <div>
                <h1 className="text-xl font-poppins font-bold mb-5" style={{ color: '#111827' }}>Mes commandes</h1>
                <div className="flex flex-wrap gap-2 mb-5">
                  {ORDER_FILTERS.map((f) => {
                    const count = f.id === 'all' ? ORDERS.length : ORDERS.filter((o) => o.status === f.id).length;
                    return (
                      <button key={f.id} onClick={() => setOrderFilter(f.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-poppins font-medium rounded-full border transition-all"
                        style={orderFilter === f.id
                          ? { backgroundColor: '#125C8D', color: '#fff', borderColor: '#125C8D' }
                          : { color: '#374151', borderColor: '#E5E7EB', backgroundColor: '#fff' }}>
                        {f.label}
                        <span className="w-4 h-4 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: orderFilter === f.id ? 'rgba(255,255,255,0.25)' : '#E5E7EB' }}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="space-y-3">
                  {filteredOrders.map((order) => {
                    const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.processing;
                    const isExpanded = expandedOrder === order.id;
                    return (
                      <div key={order.id} className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #E5E7EB' }}>
                        <button
                          onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-sm font-poppins font-bold" style={{ color: '#111827' }}>#{order.id}</span>
                                <span className="text-xs font-poppins font-semibold rounded-full px-2 py-0.5" style={{ backgroundColor: cfg.bg, color: cfg.color }}>{cfg.label}</span>
                              </div>
                              <p className="text-xs font-inter" style={{ color: '#9CA3AF' }}>
                                Commandé le {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-poppins font-bold" style={{ color: '#111827' }}>
                              {formatPrice(order.items.reduce((sum, i) => sum + i.price * i.quantity, 0))}
                            </span>
                            <i className={`ri-arrow-${isExpanded ? 'up' : 'down'}-s-line text-lg text-gray-400`}></i>
                          </div>
                        </button>

                        <div className="flex gap-2 px-5 pb-3">
                          {order.items.slice(0, 3).map((item, i) => (
                            <div key={i} className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0" style={{ backgroundColor: '#F8FAFC' }}>
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xs font-inter" style={{ backgroundColor: '#F1F5F9', color: '#6B7280' }}>
                              +{order.items.length - 3}
                            </div>
                          )}
                          <span className="text-xs font-inter self-center ml-1" style={{ color: '#9CA3AF' }}>
                            {order.items.length} article{order.items.length > 1 ? 's' : ''}
                          </span>
                        </div>

                        {isExpanded && (
                          <div className="px-5 pb-4 border-t border-gray-100 pt-4">
                            <div className="space-y-2 mb-4">
                              {order.items.map((item, i) => (
                                <div key={i} className="flex justify-between text-sm font-inter">
                                  <span style={{ color: '#374151' }}>{item.name} × {item.quantity}</span>
                                  <span style={{ color: '#111827', fontWeight: '600' }}>{formatPrice(item.price * item.quantity)}</span>
                                </div>
                              ))}
                            </div>
                            <p className="text-xs font-inter mb-4" style={{ color: '#6B7280' }}>
                              N° suivi : <span className="font-medium" style={{ color: '#125C8D' }}>{order.trackingNumber}</span>
                            </p>
                            <div className="flex gap-2">
                              {order.status === 'shipped' && (
                                <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-poppins font-semibold text-white rounded-lg" style={{ backgroundColor: '#16A34A' }}>
                                  <i className="ri-checkbox-circle-line"></i> Confirmer la réception
                                </button>
                              )}
                              <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-poppins font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors" style={{ color: '#374151' }}>
                                <i className="ri-eye-line"></i> Détails
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Wishlist */}
            {tab === 'wishlist' && (
              <div>
                <h1 className="text-xl font-poppins font-bold mb-5" style={{ color: '#111827' }}>
                  Ma wishlist <span className="text-sm font-normal" style={{ color: '#9CA3AF' }}>({wishlistProducts.length} articles)</span>
                </h1>
                {wishlistProducts.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">💝</div>
                    <p className="text-sm font-inter mb-4" style={{ color: '#6B7280' }}>Votre wishlist est vide</p>
                    <Link to="/" className="px-6 py-2.5 text-white text-sm font-poppins font-semibold rounded-full" style={{ backgroundColor: '#FF6A00' }}>Découvrir les produits</Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {wishlistProducts.map((p) => (
                      <Link key={p.id} to={`/product/${p.id}`} className="bg-white rounded-xl overflow-hidden hover:-translate-y-1 transition-all" style={{ border: '1px solid #E5E7EB' }}>
                        <div className="h-40 overflow-hidden" style={{ backgroundColor: '#F8FAFC' }}>
                          <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-3">
                          <p className="text-xs font-inter font-medium line-clamp-2 mb-1" style={{ color: '#111827' }}>{p.name}</p>
                          <p className="text-sm font-poppins font-bold" style={{ color: '#125C8D' }}>{formatPrice(p.price)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Settings */}
            {tab === 'settings' && (
              <div>
                <h1 className="text-xl font-poppins font-bold mb-5" style={{ color: '#111827' }}>Paramètres du compte</h1>
                <div className="space-y-5">
                  {/* Address */}
                  <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #E5E7EB' }}>
                    <div className="flex items-center gap-2 mb-4">
                      <i className="ri-map-pin-line" style={{ color: '#125C8D' }}></i>
                      <h3 className="text-sm font-poppins font-semibold" style={{ color: '#111827' }}>Adresse de livraison principale</h3>
                    </div>
                    <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-inter outline-none focus:border-blue-400 mb-3" />
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <label className="text-xs font-poppins text-gray-500 mb-1 block">Ville</label>
                        <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-inter outline-none">
                          <option>Cotonou</option><option>Porto-Novo</option><option>Parakou</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-poppins text-gray-500 mb-1 block">Téléphone</label>
                        <input defaultValue="+229 97 45 23 11" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-inter outline-none" />
                      </div>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 text-white text-xs font-poppins font-semibold rounded-lg" style={{ backgroundColor: '#125C8D' }}>
                      <i className="ri-save-line"></i> Enregistrer
                    </button>
                  </div>

                  {/* Notifications */}
                  <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #E5E7EB' }}>
                    <div className="flex items-center gap-2 mb-4">
                      <i className="ri-notification-3-line" style={{ color: '#125C8D' }}></i>
                      <h3 className="text-sm font-poppins font-semibold" style={{ color: '#111827' }}>Préférences de notifications</h3>
                    </div>
                    {[
                      { key: 'orders', label: 'Mise à jour de commandes', desc: 'Statut, confirmation, livrée' },
                      { key: 'escrow', label: 'Alertes Escrow', desc: 'Paiements, confirmations, litige' },
                      { key: 'promo', label: 'Promotions & offres', desc: 'Réductions, ventes flash' },
                      { key: 'newsletter', label: 'Newsletter TrustLink', desc: 'Actualités et nouveautés' },
                      { key: 'sms', label: 'Notifications SMS', desc: 'Envoyées sur votre mobile' },
                    ].map(({ key, label, desc }) => (
                      <div key={key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                        <div className="flex items-start gap-2.5">
                          <i className={`ri-${key === 'orders' ? 'shopping-bag' : key === 'escrow' ? 'shield-check' : key === 'promo' ? 'percent' : key === 'newsletter' ? 'newspaper' : 'smartphone'}-line text-sm mt-0.5`} style={{ color: '#9CA3AF' }}></i>
                          <div>
                            <p className="text-sm font-poppins font-medium" style={{ color: '#111827' }}>{label}</p>
                            <p className="text-xs font-inter" style={{ color: '#9CA3AF' }}>{desc}</p>
                          </div>
                        </div>
                        <button onClick={() => setNotifs({ ...notifs, [key]: !notifs[key] })}
                          className="w-11 h-6 rounded-full transition-colors flex-shrink-0 relative"
                          style={{ backgroundColor: notifs[key] ? '#125C8D' : '#E5E7EB' }}>
                          <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all" style={{ left: notifs[key] ? '22px' : '2px' }}></span>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Security */}
                  <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #E5E7EB' }}>
                    <div className="flex items-center gap-2 mb-4">
                      <i className="ri-lock-line" style={{ color: '#125C8D' }}></i>
                      <h3 className="text-sm font-poppins font-semibold" style={{ color: '#111827' }}>Sécurité du compte</h3>
                    </div>
                    {[['Mot de passe actuel', '••••••••'], ['Nouveau mot de passe', ''], ['Confirmer le nouveau mot de passe', '']].map(([label, val]) => (
                      <div key={label} className="mb-3">
                        <label className="text-xs font-poppins text-gray-500 mb-1 block">{label}</label>
                        <input type="password" defaultValue={val} placeholder={val || '••••••••'} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-inter outline-none" />
                      </div>
                    ))}
                    <button className="flex items-center gap-2 px-4 py-2 text-white text-xs font-poppins font-semibold rounded-lg mt-1" style={{ backgroundColor: '#125C8D' }}>
                      <i className="ri-lock-password-line"></i> Mettre à jour
                    </button>
                  </div>

                  {/* Danger zone */}
                  <div className="rounded-xl p-5" style={{ border: '1px solid #FECDD3', backgroundColor: '#FFF1F2' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <i className="ri-error-warning-line text-red-500"></i>
                      <h3 className="text-sm font-poppins font-semibold text-red-700">Zone de danger</h3>
                    </div>
                    <p className="text-xs font-inter text-red-500 mb-3">La suppression de votre compte est irréversible. Toutes vos données, commandes et historique seront définitivement effacés.</p>
                    <button className="flex items-center gap-2 text-sm font-poppins font-medium px-4 py-2 border border-red-200 rounded-lg text-red-600 hover:bg-red-50">
                      <i className="ri-delete-bin-line"></i> Supprimer mon compte
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
