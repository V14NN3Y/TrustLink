import { supabase } from './supabase';

const USE_SUPABASE = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('your-project');

const KEYS = {
  EXCHANGE_RATE: 'tl_exchange_rate',
  ORDERS: 'tl_orders',
  DISPATCHES: 'tl_seller_dispatches',
  CATALOG_PENDING: 'tl_catalog_pending',
  CATALOG_APPROVED: 'tl_catalog_approved',
  RATE_HISTORY: 'tl_rate_history',
  SYSTEM_CONFIG: 'tl_system_config',
  SELLER_PRODUCTS: 'tl_seller_products',
  SELLER_ORDERS: 'tl_seller_orders',
  SELLER_WALLET: 'tl_seller_wallet',
  SELLER_STATS: 'tl_seller_stats',
  SELLERS: 'tl_sellers',
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

function emitEvent(key) {
  window.dispatchEvent(new CustomEvent('tl_storage_update', { detail: { key } }));
}

export const DEFAULT_RATE = 0.4132;
export const DEFAULT_XOF_TO_NGN = 2.42;

export function getSharedRate() {
  return safeRead(KEYS.EXCHANGE_RATE, { rate: DEFAULT_RATE, updated_at: new Date().toISOString(), updated_by: 'Systeme' });
}

export function setSharedRate(rate, updatedBy) {
  const data = { rate, updated_at: new Date().toISOString(), updated_by: updatedBy };
  safeWrite(KEYS.EXCHANGE_RATE, data);
  const history = safeRead(KEYS.RATE_HISTORY, []);
  safeWrite(KEYS.RATE_HISTORY, [data, ...history].slice(0, 10));
  if (USE_SUPABASE) supabase.from('exchange_rates').insert(data).then();
  emitEvent(KEYS.EXCHANGE_RATE);
}

export function getRateHistory() {
  return safeRead(KEYS.RATE_HISTORY, []);
}

export function getSharedOrders() {
  return safeRead(KEYS.ORDERS, []);
}

export function setSharedOrders(orders) {
  safeWrite(KEYS.ORDERS, orders);
  if (USE_SUPABASE) supabase.from('orders').upsert(orders, { onConflict: 'id' }).then();
  emitEvent(KEYS.ORDERS);
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

export function getDispatchesForSeller(sellerId) {
  return getDispatches().filter(d => d.seller_id === sellerId);
}

export function confirmDispatch(orderId) {
  updateSharedOrder(orderId, { status: 'seller_confirmed' });
}

export function getSellerProducts() {
  return safeRead(KEYS.SELLER_PRODUCTS, []);
}

export function setSellerProducts(products) {
  safeWrite(KEYS.SELLER_PRODUCTS, products);
  if (USE_SUPABASE) supabase.from('seller_products').upsert(products, { onConflict: 'id' }).then();
  emitEvent(KEYS.SELLER_PRODUCTS);
}

export function addSellerProduct(product) {
  const products = getSellerProducts();
  const idx = products.findIndex(p => p.id === product.id);
  if (idx !== -1) {
    products[idx] = { ...product, updated_at: new Date().toISOString() };
  } else {
    products.push({ ...product, created_at: new Date().toISOString() });
  }
  setSellerProducts(products);
}

export function updateSellerProduct(id, patch) {
  const products = getSellerProducts();
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return;
  products[idx] = { ...products[idx], ...patch, updated_at: new Date().toISOString() };
  setSellerProducts(products);
}

export function deleteSellerProduct(id) {
  const products = getSellerProducts().filter(p => p.id !== id);
  setSellerProducts(products);
}

export function getSellerOrders() {
  return safeRead(KEYS.SELLER_ORDERS, []);
}

export function setSellerOrders(orders) {
  safeWrite(KEYS.SELLER_ORDERS, orders);
  if (USE_SUPABASE) supabase.from('seller_orders').upsert(orders, { onConflict: 'id' }).then();
  emitEvent(KEYS.SELLER_ORDERS);
}

export function getSellerWallet() {
  return safeRead(KEYS.SELLER_WALLET, { balance_ngn: 0, pending_escrow: 0, total_released: 0, total_withdrawn: 0, bank_accounts: [] });
}

export function setSellerWallet(wallet) {
  safeWrite(KEYS.SELLER_WALLET, wallet);
  if (USE_SUPABASE) supabase.from('seller_wallet').upsert(wallet, { onConflict: 'seller_id' }).then();
  emitEvent(KEYS.SELLER_WALLET);
}

export function getSellerStats() {
  return safeRead(KEYS.SELLER_STATS, { total_orders: 0, total_revenue: 0, pending_orders: 0, completed_orders: 0, products_count: 0, low_stock_alerts: 0 });
}

export function setSellerStats(stats) {
  safeWrite(KEYS.SELLER_STATS, stats);
  if (USE_SUPABASE) supabase.from('seller_stats').upsert(stats, { onConflict: 'seller_id' }).then();
  emitEvent(KEYS.SELLER_STATS);
}

export function getCatalogPending() {
  return safeRead(KEYS.CATALOG_PENDING, []).filter(p => p.status === 'pending');
}

export function getCatalogApproved() {
  return safeRead(KEYS.CATALOG_APPROVED, []);
}

export function submitProductToCatalog(product) {
  const pending = safeRead(KEYS.CATALOG_PENDING, []);
  const exists = pending.findIndex(p => p.id === product.id);
  if (exists !== -1) {
    pending[exists] = product;
  } else {
    pending.push(product);
  }
  safeWrite(KEYS.CATALOG_PENDING, pending);
  if (USE_SUPABASE) supabase.from('catalog_pending').insert(product).then();
  emitEvent(KEYS.CATALOG_PENDING);
}

export function getSellers() {
  return safeRead(KEYS.SELLERS, []);
}

export function updateSeller(id, patch) {
  const sellers = getSellers();
  const idx = sellers.findIndex(s => s.id === id);
  if (idx !== -1) {
    sellers[idx] = { ...sellers[idx], ...patch };
  }
  safeWrite(KEYS.SELLERS, sellers);
  if (USE_SUPABASE) supabase.from('sellers').update(patch).eq('seller_id', id).then();
  emitEvent(KEYS.SELLERS);
}

export function initializeSellerMockData() {
  if (getDispatches().length > 0) return;
  
  const mockDispatches = [
    { dispatch_id: 'DSP-MOCK-001', order_id: 'TL-2026-0901', seller_id: 'adebayo-fashions', seller_name: 'Adebayo Fashions', dispatched_at: '2026-04-24T09:30:00Z', dispatched_by: 'Kolade Adeyemi', instructions: 'Préparer le colis avec soin, client VIP.' },
    { dispatch_id: 'DSP-MOCK-002', order_id: 'TL-2026-0902', seller_id: 'adebayo-fashions', seller_name: 'Adebayo Fashions', dispatched_at: '2026-04-24T10:45:00Z', dispatched_by: 'Kolade Adeyemi', instructions: '' },
  ];

  if (getSellerProducts().length === 0) {
    setSellerProducts([
      { id: 'prod-001', name: 'iPhone 15 Pro Max 256GB', category: 'Smartphones', price_ngn: 1850000, price_fcfa: 962320, commission_rate: 0.08, image: 'https://readdy.ai/api/search-image?query=iPhone 15 Pro Max 256GB', status: 'active', stock_total: 8, sales_count: 47, description: 'iPhone 15 Pro Max 256GB', created_at: '2024-06-01', variants: [] },
      { id: 'prod-002', name: 'Samsung Galaxy A54 128GB', category: 'Smartphones', price_ngn: 395000, price_fcfa: 205876, commission_rate: 0.08, image: 'https://readdy.ai/api/search-image?query=Samsung Galaxy A54', status: 'active', stock_total: 24, sales_count: 98, description: 'Samsung Galaxy A54', created_at: '2024-06-15', variants: [] },
      { id: 'prod-003', name: 'JBL Tune 520BT', category: 'Audio', price_ngn: 42500, price_fcfa: 22154, commission_rate: 0.08, image: 'https://readdy.ai/api/search-image?query=JBL Tune 520BT', status: 'active', stock_total: 45, sales_count: 142, description: 'JBL Tune 520BT', created_at: '2024-07-01', variants: [] },
    ]);
  }

  if (getSellerOrders().length === 0) {
    setSellerOrders([
      { id: 'TL-2026-0891', product: 'Agbada Premium Brodé', product_image: '', buyer: 'Kofi Mensah', buyer_city: 'Cotonou', quantity: 1, amount_ngn: 85000, amount_fcfa: 35120, status: 'new', created_at: '2026-04-20', hub: 'Lagos Hub', qr_code: 'TL-2026-0891-QR', seller_id: 'adebayo-fashions' },
      { id: 'TL-2026-0890', product: 'Tissu Ankara 6 yards', product_image: '', buyer: 'Aminata Diallo', buyer_city: 'Porto-Novo', quantity: 2, amount_ngn: 79000, amount_fcfa: 32655, status: 'ready', created_at: '2026-04-19', hub: 'Lagos Hub', qr_code: 'TL-2026-0890-QR', seller_id: 'adebayo-fashions' },
    ]);
  }

  if (getSellerWallet().balance_ngn === 0) {
    setSellerWallet({
      balance_ngn: 4785000,
      pending_escrow: 1202000,
      total_released: 12415000,
      total_withdrawn: 9920000,
      transactions: [
        { id: 'txn-001', type: 'release', amount_ngn: 1890000, status: 'completed', order_id: 'TL-004756', description: 'Fonds débloqués — iPhone 15 Pro Max', date: '2026-04-18' },
        { id: 'txn-002', type: 'escrow', amount_ngn: 395000, status: 'pending', order_id: 'TL-004901', description: 'Fonds mis en Escrow', date: '2026-04-20' },
        { id: 'txn-003', type: 'withdrawal', amount_ngn: 2500000, status: 'completed', order_id: null, description: 'Retrait vers GTBank ****4821', date: '2026-04-15' },
      ],
      bank_accounts: [
        { id: 'bank-001', bank: 'GTBank', last4: '4821', account_name: 'ADEBAYO CHUKWUEMEKA', primary: true },
        { id: 'bank-002', bank: 'UBA', last4: '7203', account_name: 'ADEBAYO CHUKWUEMEKA', primary: false },
      ],
    });
  }

  if (getSellerStats().total_orders === 0) {
    setSellerStats({
      total_orders: 156,
      total_revenue: 4785000,
      pending_orders: 12,
      completed_orders: 144,
      products_count: 6,
      low_stock_alerts: 1,
    });
  }

  const existingOrders = getSharedOrders();
  if (existingOrders.length === 0) {
    setSharedOrders([
      { id: 'TL-2026-0901', buyer_name: 'Kofi Mensah', buyer_city: 'Cotonou', seller_id: 'adebayo-fashions', seller_name: 'Adebayo Fashions', product_name: 'Agbada Premium Brodé', product_id: 'prod-001', amount_ngn: 85000, amount_xof: 35122, hub: 'Lagos Hub', status: 'dispatched_to_seller', created_at: '2026-04-24T09:15:00Z', updated_at: '2026-04-24T09:30:00Z' },
      { id: 'TL-2026-0902', buyer_name: 'Aminata Diallo', buyer_city: 'Porto-Novo', seller_id: 'adebayo-fashions', seller_name: 'Adebayo Fashions', product_name: 'Casque Bluetooth Pro Bass', product_id: 'prod-002', amount_ngn: 32000, amount_xof: 13222, hub: 'Lagos Hub', status: 'dispatched_to_seller', created_at: '2026-04-24T10:30:00Z', updated_at: '2026-04-24T10:45:00Z' },
    ]);
  }

  safeWrite(KEYS.DISPATCHES, mockDispatches);
  emitEvent(KEYS.DISPATCHES);
}