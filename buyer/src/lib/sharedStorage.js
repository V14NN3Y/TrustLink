// ══════════════════════════════════════════════════════════════════
// COUCHE DE DONNÉES PARTAGÉE — TrustLink 3-Tiers
// Utilisée par : Admin ↔ Seller Hub ↔ Marketplace
// Mécanisme : localStorage + CustomEvent 'tl_storage_update'
// ══════════════════════════════════════════════════════════════════

const KEYS = {
  EXCHANGE_RATE: 'tl_exchange_rate',
  ORDERS: 'tl_orders',
  DISPATCHES: 'tl_seller_dispatches',
  CATALOG_PENDING: 'tl_catalog_pending',
  CATALOG_APPROVED: 'tl_catalog_approved',
  RATE_HISTORY: 'tl_rate_history',
  SYSTEM_CONFIG: 'tl_system_config',
  BUYER_ORDERS: 'tl_buyer_orders',
};

// ── Helpers internes ──────────────────────────────────────────────
function safeRead(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(
      new CustomEvent('tl_storage_update', { detail: { key } })
    );
  } catch {
    // silent fail
  }
}

// ── Constantes taux ───────────────────────────────────────────────
export const DEFAULT_RATE = 0.4132;       // 1 NGN = 0.4132 FCFA
export const DEFAULT_XOF_TO_NGN = 2.42;  // 1 FCFA = 2.42 NGN

// ── Fonctions Taux de change ──────────────────────────────────────
export function getSharedRate() {
  return safeRead(KEYS.EXCHANGE_RATE, {
    rate: DEFAULT_RATE,
    updated_at: new Date().toISOString(),
    updated_by: 'Système',
  });
}

export function setSharedRate(rate, updatedBy) {
  const data = {
    rate,
    updated_at: new Date().toISOString(),
    updated_by: updatedBy,
  };
  safeWrite(KEYS.EXCHANGE_RATE, data);
  const history = safeRead(KEYS.RATE_HISTORY, []);
  safeWrite(KEYS.RATE_HISTORY, [data, ...history].slice(0, 10));
}

// ── Fonctions Commandes ───────────────────────────────────────────
export function getSharedOrders() {
  return safeRead(KEYS.ORDERS, []);
}

export function setSharedOrders(orders) {
  safeWrite(KEYS.ORDERS, orders);
}

export function addSharedOrder(order) {
  const orders = getSharedOrders();
  const exists = orders.findIndex((o) => o.id === order.id);
  if (exists !== -1) return; // déjà présente, ne pas dupliquer
  safeWrite(KEYS.ORDERS, [...orders, order]);
}

export function getOrdersByBuyer(buyerName) {
  return getSharedOrders().filter(
    (o) => o.buyer_name.toLowerCase() === buyerName.toLowerCase()
  );
}

export function getBuyerOrders() {
  return safeRead(KEYS.BUYER_ORDERS, []);
}

export function setBuyerOrders(orders) {
  safeWrite(KEYS.BUYER_ORDERS, orders);
}

export function addBuyerOrder(order) {
  const orders = getBuyerOrders();
  const exists = orders.findIndex((o) => o.id === order.id);
  if (exists === -1) {
    orders.push({ ...order, created_at: new Date().toISOString(), status: 'pending' });
    setBuyerOrders(orders);
  }
  addSharedOrder(order);
}

export function getMarketplaceProducts() {
  const approved = getCatalogApproved();
  if (approved.length > 0) return approved;
  
  return [
    { id: 'mp-001', name: 'Chemise Coton Extra', category: 'Mode', price_ngn: 25000, price_fcfa: 10330, image: '', status: 'active' },
    { id: 'mp-002', name: 'Montre Femme Or', category: 'Mode', price_ngn: 45000, price_fcfa: 18594, image: '', status: 'active' },
    { id: 'mp-003', name: 'Crème Hydratante Karité', category: 'Beauté', price_ngn: 8500, price_fcfa: 3512, image: '', status: 'active' },
    { id: 'mp-004', name: 'Tablette Samsung 10"', category: 'Tech', price_ngn: 285000, price_fcfa: 117762, image: '', status: 'active' },
    { id: 'mp-005', name: 'Kit Auto Complet', category: 'Auto', price_ngn: 15000, price_fcfa: 6198, image: '', status: 'active' },
    { id: 'mp-006', name: 'Ustensiles Cuisine', category: 'Maison', price_ngn: 18000, price_fcfa: 7438, image: '', status: 'active' },
    { id: 'mp-007', name: 'Ballon Football Pro', category: 'Sport', price_ngn: 12000, price_fcfa: 4958, image: '', status: 'active' },
  ];
}

// ── Fonctions Catalogue ───────────────────────────────────────────
export function getCatalogApproved() {
  return safeRead(KEYS.CATALOG_APPROVED, []);
}

// ── Mapping statut SharedOrder → statut Marketplace ──────────────
export function mapSharedStatusToMarketplace(status) {
  const map = {
    pending_admin:        'pending',
    validated:            'pending',
    dispatched_to_seller: 'processing',
    seller_confirmed:     'processing',
    hub_received:         'processing',
    in_transit:           'shipped',
    customs:              'shipped',
    delivered:            'delivered',
    completed:            'delivered',
    disputed:             'processing',
  };
  return map[status] ?? 'pending';
}

// ── Initialisation mock data Marketplace ─────────────────────────
export function initializeMarketplaceMockData() {
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
      { id: 'mp-009', name: 'Parfum Femme Fleur’, category: 'Beauté', price_ngn: 18500, price_fcfa: 7644, image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=300&h=300&fit=crop', status: 'active', description: 'Parfum fleur dorange' },
      { id: 'mp-010', name: 'Enceinte Bluetooth JBL', category: 'Tech', price_ngn: 55000, price_fcfa: 22726, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop', status: 'active', description: 'Enceinte portable waterproof' },
      { id: 'mp-011', name: 'Huilier Auto Premium', category: 'Auto', price_ngn: 8500, price_fcfa: 3512, image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=300&h=300&fit=crop', status: 'active', description: 'Huilier moteur synthétique' },
      { id: 'mp-012', name: 'Linge Lit Cotton 200TC', category: 'Maison', price_ngn: 42000, price_fcfa: 17354, image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14ac?w=300&h=300&fit=crop', status: 'active', description: 'Linge lit cotton percale' },
      { id: 'mp-013', name: 'Raquette Tennis Wilson', category: 'Sport', price_ngn: 28000, price_fcfa: 11570, image: 'https://images.unsplash.com/photo-1617083934551-ac1f1b6a50c3?w=300&h=300&fit=crop', status: 'active', description: 'Raquette competition' },
      { id: 'mp-014', name: 'Savon Naturel Bio', category: 'Beauté', price_ngn: 2500, price_fcfa: 1033, image: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=300&h=300&fit=crop', status: 'active', description: 'Savon artisanal bio' },
    ];
    safeWrite(KEYS.CATALOG_APPROVED, seedProducts);
  }
}
