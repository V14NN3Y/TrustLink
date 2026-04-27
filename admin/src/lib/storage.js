import { initializeMockData } from './sharedStorage';

const KEYS = {
  EXCHANGE_RATE:    'tl_exchange_rate',
  ORDERS:           'tl_orders',
  DISPATCHES:       'tl_seller_dispatches',
  CATALOG_PENDING:  'tl_catalog_pending',
  CATALOG_APPROVED: 'tl_catalog_approved',
  RATE_HISTORY:     'tl_rate_history',
  SYSTEM_CONFIG:    'tl_system_config',
  ADMIN_USER:       'tl_admin_user',
  SELLERS:          'tl_sellers',
  PRODUCTS:         'tl_catalog_pending', // Alias for moderation view
};

export const StorageManager = {
  getKeys: () => KEYS,

  init: () => {
    initializeMockData();
    if (!localStorage.getItem(KEYS.SYSTEM_CONFIG)) {
      localStorage.setItem(KEYS.SYSTEM_CONFIG, JSON.stringify({ commission: 2.8, escrow_enabled: true }));
    }
  },

  getAdminUser: () => {
    const user = localStorage.getItem(KEYS.ADMIN_USER);
    return user ? JSON.parse(user) : null;
  },

  setAdminUser: (user) => {
    if (user) localStorage.setItem(KEYS.ADMIN_USER, JSON.stringify(user));
    else localStorage.removeItem(KEYS.ADMIN_USER);
  },

  getEscrowConfig: () => {
    const config = localStorage.getItem(KEYS.SYSTEM_CONFIG);
    return config ? JSON.parse(config) : { commission: 2.8, escrow_enabled: true };
  },

  setEscrowConfig: (config) => {
    localStorage.setItem(KEYS.SYSTEM_CONFIG, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('tl_storage_update', { detail: { key: KEYS.SYSTEM_CONFIG } }));
  },

  getOrders: () => {
    const orders = localStorage.getItem(KEYS.ORDERS);
    return orders ? JSON.parse(orders) : [];
  },

  getSellers: () => {
    const sellers = localStorage.getItem(KEYS.SELLERS);
    return sellers ? JSON.parse(sellers) : [];
  },

  getProducts: () => {
    // Pour la modération, on veut surtout les produits en attente + approuvés
    const pending = JSON.parse(localStorage.getItem(KEYS.CATALOG_PENDING) || '[]');
    const approved = JSON.parse(localStorage.getItem(KEYS.CATALOG_APPROVED) || '[]');
    // Normaliser les statuts pour HeroStats (pending_review)
    return [...pending, ...approved].map(p => ({
      ...p,
      status: p.status === 'pending' ? 'PENDING_REVIEW' : p.status.toUpperCase()
    }));
  },

  updateProduct: (product) => {
    const pending = JSON.parse(localStorage.getItem(KEYS.CATALOG_PENDING) || '[]');
    const idx = pending.findIndex(p => p.id === product.id);
    if (idx !== -1) {
      pending[idx] = product;
      localStorage.setItem(KEYS.CATALOG_PENDING, JSON.stringify(pending));
      window.dispatchEvent(new CustomEvent('tl_storage_update', { detail: { key: KEYS.CATALOG_PENDING } }));
      return;
    }
    
    const approved = JSON.parse(localStorage.getItem(KEYS.CATALOG_APPROVED) || '[]');
    const idx2 = approved.findIndex(p => p.id === product.id);
    if (idx2 !== -1) {
      approved[idx2] = product;
      localStorage.setItem(KEYS.CATALOG_APPROVED, JSON.stringify(approved));
      window.dispatchEvent(new CustomEvent('tl_storage_update', { detail: { key: KEYS.CATALOG_APPROVED } }));
    }
  }
};
