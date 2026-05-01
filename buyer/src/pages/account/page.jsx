import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useWishlist } from '@/hooks/useWishlist';
import { useOrders } from '@/hooks/useOrders';
import { useProfile } from '@/hooks/useProfile';
import SettingsTab from './components/SettingsTab';
import { useDisputes } from '@/hooks/useDisputes';
import DisputeModal from './components/DisputeModal';
import { Link } from 'react-router-dom';
import { formatPrice } from '@/utils/format';


const STATUS_CONFIG = {
  all:        { label: 'Toutes',        color: '#111827', bg: '#F8FAFC' },
  pending:    { label: 'En attente',    color: '#B45309', bg: '#FEF3C7' },
  paid:       { label: 'Payée',         color: '#2563EB', bg: '#EFF6FF' },
  processing: { label: 'En cours de traitement', color: '#125C8D', bg: '#E1F0F9' },
  in_transit: { label: 'En cours de livraison',  color: '#7C3AED', bg: '#F5F3FF' },
  delivered:  { label: 'Livrée',        color: '#15803D', bg: '#DCFCE7' },
  confirmed:  { label: 'Confirmée',     color: '#15803D', bg: '#DCFCE7' },
  disputed:   { label: 'Litige',        color: '#DC2626', bg: '#FEE2E2' },
  cancelled:  { label: 'Annulée',       color: '#6B7280', bg: '#F1F5F9' },
  refunded:   { label: 'Remboursée',    color: '#0891B2', bg: '#ECFEFF' },
};

const ORDER_FILTERS = [
  { id: 'all', label: 'Toutes' },
  { id: 'pending', label: 'En attente' },
  { id: 'paid', label: 'Payée' },
  { id: 'processing', label: 'En cours de traitement' },
  { id: 'in_transit', label: 'En cours de livraison' },
  { id: 'delivered', label: 'Livrée' },
  { id: 'confirmed', label: 'Confirmée' },
  { id: 'disputed', label: 'Litige' },
  { id: 'cancelled', label: 'Annulée' },
  { id: 'refunded', label: 'Remboursée' },
];

const NAV = [
  { id: 'orders', label: 'Mes commandes', icon: 'ri-shopping-bag-line' },
  { id: 'wishlist', label: 'Ma wishlist', icon: 'ri-heart-line' },
  { id: 'disputes', label: 'Mes litiges', icon: 'ri-shield-star-line' },
  { id: 'settings', label: 'Paramètres', icon: 'ri-settings-3-line' },
];

export default function Account() {
  const [tab, setTab] = useState('orders');
  const [orderFilter, setOrderFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const { user, logout } = useAuth();
  const { profile: userProfile } = useProfile();
  const { items: wishlistIds, products: wishlistProducts, loadWishlistProducts } = useWishlist();
  useEffect(() => {
    loadWishlistProducts();
  }, [loadWishlistProducts]);

  const { orders, loading: ordersLoading, confirmDelivery, reload: reloadOrders } = useOrders();
  const { disputes, loading: disputesLoading } = useDisputes();
  const [disputeOrder, setDisputeOrder] = useState(null);
  const filteredOrders = orderFilter === 'all' ? orders : orders.filter((o) => o.status === orderFilter);

  const handleConfirmDelivery = async (orderId) => {
    try {
      await confirmDelivery(orderId);
    } catch {
      alert('Erreur lors de la confirmation. Réessayez.');
    }
  };
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
                <button onClick={() => setTab('settings')} className="absolute top-2 right-2 flex items-center gap-1.5 text-xs font-poppins text-white/80 bg-white/10 rounded-lg px-2.5 py-1 hover:bg-white/20 transition-colors">
                  <i className="ri-edit-line text-xs"></i> Modifier le profil
                </button>
              </div>
              <div className="px-5 pb-5">
                <div className="w-16 h-16 rounded-full bg-amber-200 flex items-center justify-center -mt-8 mb-3 border-3 border-white overflow-hidden" style={{ border: '3px solid white' }}>
                  <span className="text-xl font-poppins font-bold text-amber-800">
                    {userProfile?.full_name
                      ? userProfile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                      : user?.email?.[0]?.toUpperCase() || '?'}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-base font-poppins font-bold" style={{ color: '#111827' }}>
                    {userProfile?.full_name || user?.email?.split('@')[0] || 'Mon Compte'}
                  </h2>
                  <i className="ri-verified-badge-fill text-sm" style={{ color: '#125C8D' }}></i>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-inter mb-1" style={{ color: '#6B7280' }}>
                  <i className="ri-mail-line text-xs"></i>
                  <span>{userProfile?.email || user?.email || '—'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-inter mb-1" style={{ color: '#6B7280' }}>
                  <i className="ri-phone-line text-xs"></i>
                  <span>{userProfile?.phone || 'Non renseigné'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-inter mb-4" style={{ color: '#6B7280' }}>
                  <i className="ri-map-pin-line text-xs"></i>
                  <span>{userProfile?.default_city ? `${userProfile.default_city}, Bénin` : 'Non renseigné'}</span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 py-3 border-t border-gray-100">
                  {[
                    { icon: 'ri-shopping-bag-line', value: orders.length, label: 'Commandes' },
                    { icon: 'ri-money-cny-circle-line', value: new Intl.NumberFormat('fr-FR').format(orders.reduce((sum, o) => sum + o.total, 0)), label: 'FCFA Dépensés' },
                    { icon: 'ri-shield-check-line', value: orders.length, label: 'Protégées Escrow' },
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
                      {item.id === 'disputes' && disputes.filter((d) => d.status === 'open').length > 0 && (
                        <span className="text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
                        {disputes.filter((d) => d.status === 'open').length}
                        </span>
                      )}
                      </div>
                      <i className="ri-arrow-right-s-line text-base text-gray-400"></i>
                    </button>
                    ))}
                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-poppins text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
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
                    const count = f.id === 'all' ? orders.length : orders.filter((o) => o.status === f.id).length;
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
                {tab === 'orders' && ordersLoading && (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="bg-white rounded-xl h-24 animate-pulse" style={{ border: '1px solid #E5E7EB' }} />
                    ))}
                  </div>
                )}

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
                              {formatPrice(order.total)}
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
                            <div className="flex gap-2 flex-wrap">
                              {(order.status === 'in_transit' || order.status === 'delivered') && (
                                <>
                                  <button
                                    onClick={() => handleConfirmDelivery(order.id)}
                                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-poppins font-semibold text-white rounded-lg cursor-pointer whitespace-nowrap"
                                    style={{ backgroundColor: '#16A34A' }}
                                  >
                                    <i className="ri-checkbox-circle-line"></i> Confirmer la réception
                                  </button>
                                  <button
                                    onClick={() => setDisputeOrder(order)}
                                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-poppins font-semibold rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap"
                                  >
                                    <i className="ri-error-warning-line"></i> Produit défectueux ?
                                  </button>
                                </>
                              )}
                              <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-poppins font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer" style={{ color: '#374151' }}>
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
            {/* Disputes */}
            {tab === 'disputes' && (
              <div>
                <h1 className="text-xl font-poppins font-bold mb-5" style={{ color: '#111827' }}>Mes litiges</h1>
                {disputesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white rounded-xl h-24 animate-pulse" style={{ border: '1px solid #E5E7EB' }} />
                    ))}
                  </div>
                ) : disputes.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">🛡️</div>
                    <p className="text-sm font-inter mb-2" style={{ color: '#6B7280' }}>Aucun litige ouvert</p>
                    <p className="text-xs font-inter" style={{ color: '#9CA3AF' }}>Un problème avec une commande livrée ? Ouvrez un litige depuis vos commandes.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {disputes.map((d) => (
                      <div key={d.id} className="bg-white rounded-xl p-4" style={{ border: '1px solid #E5E7EB' }}>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-sm font-poppins font-bold" style={{ color: '#111827' }}>
                              Litige #{d.id.slice(0, 8).toUpperCase()}
                            </p>
                            <p className="text-xs font-inter" style={{ color: '#9CA3AF' }}>
                              Commande #{d.order?.id?.slice(0, 8)} · {formatPrice(d.order?.total_amount || 0)}
                            </p>
                          </div>
                          <span className="text-xs font-poppins font-bold px-2 py-1 rounded-full"
                            style={{
                              backgroundColor: d.status === 'open' ? '#FEF3C7' : d.status === 'resolved_refund' ? '#DCFCE7' : '#FEE2E2',
                              color: d.status === 'open' ? '#B45309' : d.status === 'resolved_refund' ? '#15803D' : '#DC2626',
                            }}>
                            {d.status === 'open' ? 'En cours d\'examen' : d.status === 'resolved_refund' ? 'Remboursé' : 'Non remboursé'}
                          </span>
                        </div>
                        <p className="text-sm font-inter mb-2" style={{ color: '#374151' }}>{d.reason}</p>
                        {d.video?.video_url && (
                          <a href={d.video.video_url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-poppins font-medium mb-2 cursor-pointer hover:underline"
                            style={{ color: '#125C8D' }}>
                            <i className="ri-video-line"></i> Voir la vidéo de déballage
                          </a>
                        )}
                        {d.resolution_notes && (
                          <div className="rounded-lg p-3 mt-2" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E5E7EB' }}>
                            <p className="text-xs font-inter" style={{ color: '#6B7280' }}>
                              <strong>Décision admin :</strong> {d.resolution_notes}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* Settings */}
            {tab === 'settings' && (
              <SettingsTab />
            )}
          </div>
        </div>
      </div>
      {disputeOrder && (
        <DisputeModal
          order={disputeOrder}
          onClose={() => setDisputeOrder(null)}
          onSuccess={() => {
            reloadOrders();
            setTab('disputes');
          }}
        />
      )}
    </div>
  );
}
