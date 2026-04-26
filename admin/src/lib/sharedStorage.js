const KEYS = {
  EXCHANGE_RATE:    'tl_exchange_rate',
  ORDERS:           'tl_orders',
  DISPATCHES:       'tl_seller_dispatches',
  CATALOG_PENDING:  'tl_catalog_pending',
  CATALOG_APPROVED:  'tl_catalog_approved',
  RATE_HISTORY:     'tl_rate_history',
  SYSTEM_CONFIG:   'tl_system_config',
  SELLERS:          'tl_sellers',
};

function safeRead(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function safeWrite(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent('tl_storage_update', { detail: { key } }));
  } catch { /* silent */ }
}

export const DEFAULT_RATE = 0.4132;
export const DEFAULT_XOF_TO_NGN = 2.42;

export function getSharedRate() {
  return safeRead(KEYS.EXCHANGE_RATE, {
    rate: DEFAULT_RATE,
    updated_at: new Date().toISOString(),
    updated_by: 'Système',
  });
}

export function setSharedRate(rate, updatedBy) {
  const data = { rate, updated_at: new Date().toISOString(), updated_by: updatedBy };
  safeWrite(KEYS.EXCHANGE_RATE, data);
  const history = safeRead(KEYS.RATE_HISTORY, []);
  safeWrite(KEYS.RATE_HISTORY, [data, ...history].slice(0, 10));
}

export function getRateHistory() {
  return safeRead(KEYS.RATE_HISTORY, []);
}

export function getSharedOrders() {
  return safeRead(KEYS.ORDERS, []);
}

export function setSharedOrders(orders) {
  safeWrite(KEYS.ORDERS, orders);
}

export function updateSharedOrder(id, patch) {
  const orders = getSharedOrders();
  const idx = orders.findIndex(o => o.id === id);
  if (idx === -1) return;
  orders[idx] = { ...orders[idx], ...patch, updated_at: new Date().toISOString() };
  setSharedOrders(orders);
}

export function getDispatches() {
  return safeRead(KEYS.DISPATCHES, []);
}

export function dispatchOrderToSeller(orderId, data) {
  const dispatches = getDispatches();
  const newDispatch = { ...data, dispatch_id: `DSP-${Date.now()}` };
  safeWrite(KEYS.DISPATCHES, [...dispatches, newDispatch]);
  updateSharedOrder(orderId, { status: 'dispatched_to_seller' });
}

export function getCatalogPending() {
  return safeRead(KEYS.CATALOG_PENDING, []).filter(p => p.status === 'pending');
}

export function getCatalogApproved() {
  return safeRead(KEYS.CATALOG_APPROVED, []);
}

export function approveCatalogItem(id, adminComment) {
  const pending = safeRead(KEYS.CATALOG_PENDING, []);
  const idx = pending.findIndex(p => p.id === id);
  if (idx === -1) return;
  const approved = { ...pending[idx], status: 'approved', admin_comment: adminComment };
  pending[idx] = approved;
  safeWrite(KEYS.CATALOG_PENDING, pending);
  const approvedList = getCatalogApproved();
  safeWrite(KEYS.CATALOG_APPROVED, [...approvedList, approved]);
}

export function rejectCatalogItem(id, adminComment) {
  const pending = safeRead(KEYS.CATALOG_PENDING, []);
  const idx = pending.findIndex(p => p.id === id);
  if (idx === -1) return;
  pending[idx] = { ...pending[idx], status: 'rejected', admin_comment: adminComment };
  safeWrite(KEYS.CATALOG_PENDING, pending);
}

export function getSellers() {
  return safeRead(KEYS.SELLERS, []);
}

export function addSeller(seller) {
  const sellers = getSellers();
  const idx = sellers.findIndex(s => s.id === seller.id);
  if (idx !== -1) {
    sellers[idx] = { ...sellers[idx], ...seller };
  } else {
    sellers.push({ ...seller, created_at: new Date().toISOString() });
  }
  safeWrite(KEYS.SELLERS, sellers);
}

export function updateSeller(id, patch) {
  const sellers = getSellers();
  const idx = sellers.findIndex(s => s.id === id);
  if (idx === -1) return;
  sellers[idx] = { ...sellers[idx], ...patch };
  safeWrite(KEYS.SELLERS, sellers);
}

export function initializeMockData() {
  if (getSharedOrders().length > 0) return;
  const mockOrders = [
    {
      id: 'TL-2026-0901', buyer_name: 'Kofi Mensah', buyer_city: 'Cotonou',
      seller_id: 'adebayo-fashions', seller_name: 'Adebayo Fashions',
      product_name: 'Agbada Premium Brodé', product_id: 'prod-001',
      amount_ngn: 85000, amount_xof: 35120, hub: 'Lagos Hub',
      status: 'pending_admin', created_at: '2026-04-24T09:15:00Z', updated_at: '2026-04-24T09:15:00Z',
    },
    {
      id: 'TL-2026-0902', buyer_name: 'Aminata Diallo', buyer_city: 'Porto-Novo',
      seller_id: 'tech-nigeria', seller_name: 'TechNigeria Store',
      product_name: 'Casque Bluetooth Pro Bass', product_id: 'prod-002',
      amount_ngn: 32000, amount_xof: 13222, hub: 'Lagos Hub',
      status: 'pending_admin', created_at: '2026-04-24T10:30:00Z', updated_at: '2026-04-24T10:30:00Z',
    },
    {
      id: 'TL-2026-0903', buyer_name: 'Séraphin Hounsou', buyer_city: 'Parakou',
      seller_id: 'beauty-lagos', seller_name: 'Beauty Lagos Pro',
      product_name: 'Coffret Soin Naturel Karité', product_id: 'prod-003',
      amount_ngn: 18500, amount_xof: 7644, hub: 'Abuja Hub',
      status: 'validated', created_at: '2026-04-23T14:20:00Z', updated_at: '2026-04-24T08:00:00Z',
    },
  ];
  setSharedOrders(mockOrders);

  if (getCatalogApproved().length === 0) {
    const seedProducts = [
      { id: 'mp-001', name: 'Chemise Coton Premium', category: 'Mode', price_ngn: 25000, price_fcfa: 10330, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=300&fit=crop', status: 'active', description: 'Chemise 100% coton premium' },
      { id: 'mp-002', name: 'Montre Femme Or Rose', category: 'Mode', price_ngn: 45000, price_fcfa: 18594, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop', status: 'active', description: 'Montre automatique or rose' },
      { id: 'mp-003', name: 'Crème Hydratante Karité', category: 'Beauté', price_ngn: 8500, price_fcfa: 3512, image: 'https://images.unsplash.com/photo-1556228720-195a672e8d03?w=300&h=300&fit=crop', status: 'active', description: 'Crème hydratante naturelle au karité' },
      { id: 'mp-004', name: 'Tablette Samsung Tab A9', category: 'Tech', price_ngn: 285000, price_fcfa: 117762, image: 'https://images.unsplash.com/photo-1561154464-82e9adf32d69?w=300&h=300&fit=crop', status: 'active', description: 'Tablette 10.5 pouces 128GB' },
      { id: 'mp-005', name: 'Kit Auto Essentials', category: 'Auto', price_ngn: 15000, price_fcfa: 6198, image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=300&h=300&fit=crop', status: 'active', description: 'Kit complet accessories auto' },
      { id: 'mp-006', name: 'Ustensiles Cuisine Inox', category: 'Maison', price_ngn: 18000, price_fcfa: 7438, image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop', status: 'active', description: 'Set ustensiles cuisine professionnel' },
      { id: 'mp-007', name: 'Ballon Football Pro', category: 'Sport', price_ngn: 12000, price_fcfa: 4958, image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=300&h=300&fit=crop', status: 'active', description: 'Ballon match professionnel' },
      { id: 'mp-008', name: 'Escarpins Cuir Noir', category: 'Mode', price_ngn: 32000, price_fcfa: 13222, image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=300&h=300&fit=crop', status: 'active', description: 'Escarpins cuir italien' },
      { id: 'mp-009', name: 'Parfum Femme Fleur', category: 'Beauté', price_ngn: 18500, price_fcfa: 7644, image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=300&h=300&fit=crop', status: 'active', description: 'Parfum fleur dorange' },
      { id: 'mp-010', name: 'Enceinte Bluetooth JBL', category: 'Tech', price_ngn: 55000, price_fcfa: 22726, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop', status: 'active', description: 'Enceinte portable waterproof' },
      { id: 'mp-011', name: 'Huilier Auto Premium', category: 'Auto', price_ngn: 8500, price_fcfa: 3512, image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=300&h=300&fit=crop', status: 'active', description: 'Huilier moteur synthétique' },
      { id: 'mp-012', name: 'Linge Lit Cotton 200TC', category: 'Maison', price_ngn: 42000, price_fcfa: 17354, image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14ac?w=300&h=300&fit=crop', status: 'active', description: 'Linge lit cotton percale' },
      { id: 'mp-013', name: 'Raquette Tennis Wilson', category: 'Sport', price_ngn: 28000, price_fcfa: 11570, image: 'https://images.unsplash.com/photo-1617083934551-ac1f1b6a50c3?w=300&h=300&fit=crop', status: 'active', description: 'Raquette competition' },
      { id: 'mp-014', name: 'Savon Naturel Bio', category: 'Beauté', price_ngn: 2500, price_fcfa: 1033, image: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=300&h=300&fit=crop', status: 'active', description: 'Savon artisanal bio' },
    ];
    safeWrite(KEYS.CATALOG_APPROVED, seedProducts);
  }

  if (getSellers().length === 0) {
    const seedSellers = [
      { id: 'adebayo-fashions', name: 'Adebayo Fashions', email: 'adebayo@fashions.ng', status: 'verified', hub: 'Lagos Hub', created_at: '2025-01-15T00:00:00Z' },
      { id: 'tech-nigeria', name: 'TechNigeria Store', email: 'info@technigeria.ng', status: 'verified', hub: 'Lagos Hub', created_at: '2025-02-20T00:00:00Z' },
      { id: 'beauty-lagos', name: 'Beauty Lagos Pro', email: 'contact@beautylagos.ng', status: 'verified', hub: 'Lagos Hub', created_at: '2025-03-10T00:00:00Z' },
    ];
    safeWrite(KEYS.SELLERS, seedSellers);
  }
}
