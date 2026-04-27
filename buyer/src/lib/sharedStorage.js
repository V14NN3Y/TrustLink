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
  BUYER_ORDERS: 'tl_buyer_orders',
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

export function getSharedOrders() {
  return safeRead(KEYS.ORDERS, []);
}

export function setSharedOrders(orders) {
  safeWrite(KEYS.ORDERS, orders);
  if (USE_SUPABASE) supabase.from('orders').upsert(orders, { onConflict: 'id' }).then();
  emitEvent(KEYS.ORDERS);
}

export function addSharedOrder(order) {
  const orders = getSharedOrders();
  const exists = orders.findIndex(o => o.id === order.id);
  if (exists === -1) {
    orders.push(order);
    safeWrite(KEYS.ORDERS, orders);
    if (USE_SUPABASE) supabase.from('orders').insert(order).then();
    emitEvent(KEYS.ORDERS);
  }
}

export function getOrdersByBuyer(buyerName) {
  return getSharedOrders().filter(o => o.buyer_name?.toLowerCase() === buyerName.toLowerCase());
}

export function getCatalogApproved() {
  return safeRead(KEYS.CATALOG_APPROVED, []);
}

export function getBuyerOrders() {
  return safeRead(KEYS.BUYER_ORDERS, []);
}

export function setBuyerOrders(orders) {
  safeWrite(KEYS.BUYER_ORDERS, orders);
  if (USE_SUPABASE) supabase.from('buyer_orders').upsert(orders, { onConflict: 'id' }).then();
  emitEvent(KEYS.BUYER_ORDERS);
}

export function addBuyerOrder(order) {
  const orders = getBuyerOrders();
  const exists = orders.findIndex(o => o.id === order.id);
  if (exists === -1) {
    orders.push({ ...order, created_at: new Date().toISOString(), status: 'pending' });
    safeWrite(KEYS.BUYER_ORDERS, orders);
    if (USE_SUPABASE) supabase.from('buyer_orders').insert(order).then();
    emitEvent(KEYS.BUYER_ORDERS);
  }
  addSharedOrder(order);
}

export function mapSharedStatusToMarketplace(status) {
  const map = {
    pending_admin: 'pending',
    validated: 'pending',
    dispatched_to_seller: 'processing',
    seller_confirmed: 'processing',
    hub_received: 'processing',
    in_transit: 'shipped',
    customs: 'shipped',
    delivered: 'delivered',
    completed: 'delivered',
    disputed: 'processing',
  };
  return map[status] ?? 'pending';
}

export function initializeMarketplaceMockData() {
  if (getCatalogApproved().length > 0) return;
  
  const seedProducts = [
    { id: 'mp-001', name: 'Chemise Coton Premium', category: 'Mode', price_ngn: 25000, price_fcfa: 10330, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=300&fit=crop', status: 'active', description: 'Chemise 100% coton premium' },
    { id: 'mp-002', name: 'Montre Femme Or Rose', category: 'Mode', price_ngn: 45000, price_fcfa: 18594, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop', status: 'active', description: 'Montre automatique or rose' },
    { id: 'mp-003', name: 'Creme Hydratante Karite', category: 'Beaute', price_ngn: 8500, price_fcfa: 3512, image: 'https://images.unsplash.com/photo-1556228720-195a672e8d03?w=300&h=300&fit=crop', status: 'active', description: 'Creme hydratante naturelle' },
    { id: 'mp-004', name: 'Tablette Samsung Tab A9', category: 'Tech', price_ngn: 285000, price_fcfa: 117762, image: 'https://images.unsplash.com/photo-1561154464-82e9adf32d69?w=300&h=300&fit=crop', status: 'active', description: 'Tablette 10.5 pouces 128GB' },
    { id: 'mp-005', name: 'Kit Auto Essentials', category: 'Auto', price_ngn: 15000, price_fcfa: 6198, image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=300&h=300&fit=crop', status: 'active', description: 'Kit complet accessories auto' },
    { id: 'mp-006', name: 'Ustensiles Cuisine Inox', category: 'Maison', price_ngn: 18000, price_fcfa: 7438, image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop', status: 'active', description: 'Set ustensiles cuisine' },
    { id: 'mp-007', name: 'Ballon Football Pro', category: 'Sport', price_ngn: 12000, price_fcfa: 4958, image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=300&h=300&fit=crop', status: 'active', description: 'Ballon match professionnel' },
  ];
  
  safeWrite(KEYS.CATALOG_APPROVED, seedProducts);
  if (USE_SUPABASE) supabase.from('products').insert(seedProducts).then();
  emitEvent(KEYS.CATALOG_APPROVED);
}