const KEYS = {
  EXCHANGE_RATE:    'tl_exchange_rate',
  ORDERS:           'tl_orders',
  DISPATCHES:       'tl_seller_dispatches',
  CATALOG_PENDING:  'tl_catalog_pending',
  CATALOG_APPROVED: 'tl_catalog_approved',
  RATE_HISTORY:     'tl_rate_history',
  SYSTEM_CONFIG:    'tl_system_config',
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
}
