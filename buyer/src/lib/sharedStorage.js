// ══════════════════════════════════════════════════════════════════
// COUCHE DE DONNÉES PARTAGÉE — TrustLink 3-Tiers
// Utilisée par : Admin ↔ Seller Hub ↔ Marketplace
// Mécanisme : localStorage + CustomEvent 'tl_storage_update'
// ══════════════════════════════════════════════════════════════════

const KEYS = {
  EXCHANGE_RATE:    'tl_exchange_rate',
  ORDERS:           'tl_orders',
  DISPATCHES:       'tl_seller_dispatches',
  CATALOG_PENDING:  'tl_catalog_pending',
  CATALOG_APPROVED: 'tl_catalog_approved',
  RATE_HISTORY:     'tl_rate_history',
  SYSTEM_CONFIG:    'tl_system_config',
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
  // Les commandes sont créées par l'acheteur au checkout.
  // Les produits approuvés viennent de l'Admin via tl_catalog_approved.
  return;
}
