const STORAGE_KEYS = {
  EXCHANGE_RATE: 'tl_exchange_rate',
};

export const StorageManager = {
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.EXCHANGE_RATE)) {
      localStorage.setItem(STORAGE_KEYS.EXCHANGE_RATE, JSON.stringify({
        rate: 1.832,
        lastUpdated: new Date().toISOString()
      }));
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
    } catch (e) {
      console.error(`Error saving ${key} to storage`, e);
    }
  },

  getExchangeRate() {
    return this.getItem(STORAGE_KEYS.EXCHANGE_RATE);
  },

  setExchangeRate(rate) {
    this.setItem(STORAGE_KEYS.EXCHANGE_RATE, {
      rate,
      lastUpdated: new Date().toISOString()
    });
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
