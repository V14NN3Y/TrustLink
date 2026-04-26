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
};

// ── Helpers internes ─────────────────────────────────────────────
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

// ── Constantes taux ──────────────────────────────────────────────
export const DEFAULT_RATE = 0.4132;       // 1 NGN = 0.4132 FCFA
export const DEFAULT_XOF_TO_NGN = 2.42;  // 1 FCFA = 2.42 NGN

// ── Fonctions Taux de change ─────────────────────────────────────
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

export function getRateHistory() {
  return safeRead(KEYS.RATE_HISTORY, []);
}

// ── Fonctions Commandes ──────────────────────────────────────────
export function getSharedOrders() {
  return safeRead(KEYS.ORDERS, []);
}

export function setSharedOrders(orders) {
  safeWrite(KEYS.ORDERS, orders);
}

export function updateSharedOrder(id, patch) {
  const orders = getSharedOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return;
  orders[idx] = {
    ...orders[idx],
    ...patch,
    updated_at: new Date().toISOString(),
  };
  setSharedOrders(orders);
}

// ── Fonctions Dispatches ─────────────────────────────────────────
export function getDispatches() {
  return safeRead(KEYS.DISPATCHES, []);
}

export function getDispatchesForSeller(sellerId) {
  return getDispatches().filter((d) => d.seller_id === sellerId);
}

export function confirmDispatch(orderId) {
  updateSharedOrder(orderId, { status: 'seller_confirmed' });
}

// ── Fonctions Catalogue ──────────────────────────────────────────
export function getCatalogPending() {
  return safeRead(KEYS.CATALOG_PENDING, []).filter(
    (p) => p.status === 'pending'
  );
}

export function getCatalogApproved() {
  return safeRead(KEYS.CATALOG_APPROVED, []);
}

export function submitProductToCatalog(product) {
  const pending = safeRead(KEYS.CATALOG_PENDING, []);
  const exists = pending.findIndex((p) => p.id === product.id);
  if (exists !== -1) {
    pending[exists] = product;
  } else {
    pending.push(product);
  }
  safeWrite(KEYS.CATALOG_PENDING, pending);
}

// ── Initialisation mock data Seller Hub ──────────────────────────
export function initializeSellerMockData() {
  // Guard : si dispatches existent déjà → skip
  if (getDispatches().length > 0) return;

  const mockDispatches = [
    {
      dispatch_id: 'DSP-MOCK-001',
      order_id: 'TL-2026-0901',
      seller_id: 'adebayo-fashions',
      seller_name: 'Adebayo Fashions',
      dispatched_at: '2026-04-24T09:30:00Z',
      dispatched_by: 'Kolade Adeyemi',
      instructions: 'Préparer le colis avec soin, client VIP.',
    },
    {
      dispatch_id: 'DSP-MOCK-002',
      order_id: 'TL-2026-0902',
      seller_id: 'adebayo-fashions',
      seller_name: 'Adebayo Fashions',
      dispatched_at: '2026-04-24T10:45:00Z',
      dispatched_by: 'Kolade Adeyemi',
      instructions: '',
    },
  ];

  const existingOrders = getSharedOrders();
  if (existingOrders.length === 0) {
    const mockOrders = [
      {
        id: 'TL-2026-0901',
        buyer_name: 'Kofi Mensah',
        buyer_city: 'Cotonou',
        seller_id: 'adebayo-fashions',
        seller_name: 'Adebayo Fashions',
        product_name: 'Agbada Premium Brodé',
        product_id: 'prod-001',
        amount_ngn: 85000,
        amount_xof: 35122,
        hub: 'Lagos Hub',
        status: 'dispatched_to_seller',
        created_at: '2026-04-24T09:15:00Z',
        updated_at: '2026-04-24T09:30:00Z',
      },
      {
        id: 'TL-2026-0902',
        buyer_name: 'Aminata Diallo',
        buyer_city: 'Porto-Novo',
        seller_id: 'adebayo-fashions',
        seller_name: 'Adebayo Fashions',
        product_name: 'Casque Bluetooth Pro Bass',
        product_id: 'prod-002',
        amount_ngn: 32000,
        amount_xof: 13222,
        hub: 'Lagos Hub',
        status: 'dispatched_to_seller',
        created_at: '2026-04-24T10:30:00Z',
        updated_at: '2026-04-24T10:45:00Z',
      },
    ];
    setSharedOrders(mockOrders);
  }

  safeWrite(KEYS.DISPATCHES, mockDispatches);
}
