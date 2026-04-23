import { PRODUCTS } from '@/mocks/moderation';
import { ORDERS } from '@/mocks/orders';
import { ESCROW_CONFIG } from '@/mocks/finance';

const STORAGE_KEYS = {
  EXCHANGE_RATE: 'tl_exchange_rate',
  PRODUCTS: 'tl_products',
  ORDERS: 'tl_orders',
  SELLERS: 'tl_sellers',
  ADMIN_USER: 'tl_admin_user',
  ESCROW_CONFIG: 'tl_escrow_config',
};

// Extract unique sellers from mocks
const INITIAL_SELLERS = [
  { id: 'SLR-0042', name: 'Chukwuemeka Obi', email: 'obi@example.com', hub: 'Lagos', status: 'ACTIVE' },
  { id: 'SLR-0017', name: 'Adaeze Nwosu', email: 'adaeze@example.com', hub: 'Lagos', status: 'ACTIVE' },
  { id: 'SLR-0058', name: 'Emeka Tech Store', email: 'emeka@example.com', hub: 'Abuja', status: 'ACTIVE' },
  { id: 'SLR-0029', name: 'Lagos Fabric House', email: 'lagosfabric@example.com', hub: 'Lagos', status: 'ACTIVE' },
  { id: 'SLR-0091', name: 'Power Solutions NG', email: 'powers@example.com', hub: 'Lagos', status: 'ACTIVE' },
  { id: 'SLR-0037', name: 'Cool Tech Lagos', email: 'cool@example.com', hub: 'Lagos', status: 'ACTIVE' },
  { id: 'SLR-0064', name: 'Apple Reseller ABJ', email: 'apple@example.com', hub: 'Abuja', status: 'ACTIVE' },
  { id: 'SLR-0033', name: 'Chioma Igwe', email: 'chioma@example.com', hub: 'Lagos', status: 'ACTIVE' },
  { id: 'SLR-0071', name: 'Kelechi Amadi', email: 'kelechi@example.com', hub: 'Abuja', status: 'ACTIVE' },
  { id: 'SLR-0088', name: 'Babatunde Alabi', email: 'baba@example.com', hub: 'Abuja', status: 'ACTIVE' },
];

export const StorageManager = {
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.EXCHANGE_RATE)) {
      localStorage.setItem(STORAGE_KEYS.EXCHANGE_RATE, JSON.stringify({
        rate: 1.832,
        lastUpdated: new Date().toISOString()
      }));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(PRODUCTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(ORDERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SELLERS)) {
      localStorage.setItem(STORAGE_KEYS.SELLERS, JSON.stringify(INITIAL_SELLERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ESCROW_CONFIG)) {
      localStorage.setItem(STORAGE_KEYS.ESCROW_CONFIG, JSON.stringify(ESCROW_CONFIG));
    }
  },

  getItem(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error(`Error reading ${key} from storage`, e);
      return null;
    }
  },

  setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      // Dispatch event for cross-tab sync or within same tab listeners
      window.dispatchEvent(new StorageEvent('storage', {
        key: key,
        newValue: JSON.stringify(value),
        storageArea: localStorage,
      }));
    } catch (e) {
      console.error(`Error saving ${key} to storage`, e);
    }
  },

  // Specific helpers
  getExchangeRate() {
    return this.getItem(STORAGE_KEYS.EXCHANGE_RATE);
  },

  setExchangeRate(rate) {
    this.setItem(STORAGE_KEYS.EXCHANGE_RATE, {
      rate,
      lastUpdated: new Date().toISOString()
    });
  },

  getProducts() {
    return this.getItem(STORAGE_KEYS.PRODUCTS) || [];
  },

  updateProduct(updatedProduct) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === updatedProduct.id);
    if (index !== -1) {
      products[index] = updatedProduct;
      this.setItem(STORAGE_KEYS.PRODUCTS, products);
    }
  },

  getOrders() {
    return this.getItem(STORAGE_KEYS.ORDERS) || [];
  },

  updateOrder(updatedOrder) {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === updatedOrder.id);
    if (index !== -1) {
      orders[index] = updatedOrder;
      this.setItem(STORAGE_KEYS.ORDERS, orders);
    }
  },

  getSellers() {
    return this.getItem(STORAGE_KEYS.SELLERS) || [];
  },

  getAdminUser() {
    return this.getItem(STORAGE_KEYS.ADMIN_USER);
  },

  setAdminUser(user) {
    this.setItem(STORAGE_KEYS.ADMIN_USER, user);
  },

  getEscrowConfig() {
    return this.getItem(STORAGE_KEYS.ESCROW_CONFIG);
  },

  setEscrowConfig(config) {
    this.setItem(STORAGE_KEYS.ESCROW_CONFIG, config);
  },

  reset() {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    this.init();
    window.location.reload();
  },

  getKeys() {
    return STORAGE_KEYS;
  }
};
