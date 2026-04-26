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
  SELLER_PRODUCTS: 'tl_seller_products',
  SELLER_ORDERS: 'tl_seller_orders',
  SELLER_WALLET: 'tl_seller_wallet',
  SELLER_STATS: 'tl_seller_stats',
  SELLERS: 'tl_sellers',
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

export function getSellers() {
  return safeRead(KEYS.SELLERS, []);
}

export function updateSeller(id, patch) {
  const sellers = getSellers();
  const idx = sellers.findIndex(s => s.id === id);
  if (idx === -1) return;
  sellers[idx] = { ...sellers[idx], ...patch };
  safeWrite(KEYS.SELLERS, sellers);
}

export function getSellerProducts() {
  return safeRead(KEYS.SELLER_PRODUCTS, []);
}

export function setSellerProducts(products) {
  safeWrite(KEYS.SELLER_PRODUCTS, products);
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
}

export function addSellerOrder(order) {
  const orders = getSellerOrders();
  const exists = orders.findIndex(o => o.id === order.id);
  if (exists === -1) {
    orders.push({ ...order, created_at: new Date().toISOString() });
    setSellerOrders(orders);
  }
}

export function getSellerWallet() {
  return safeRead(KEYS.SELLER_WALLET, {
    balance_ngn: 0,
    pending_escrow: 0,
    total_released: 0,
    total_withdrawn: 0,
    bank_accounts: [],
  });
}

export function setSellerWallet(wallet) {
  safeWrite(KEYS.SELLER_WALLET, wallet);
}

export function addSellerTransaction(transaction) {
  const wallet = getSellerWallet();
  const transactions = wallet.transactions || [];
  transactions.unshift({ ...transaction, id: `txn-${Date.now()}`, date: new Date().toISOString() });
  wallet.transactions = transactions;
  
  if (transaction.type === 'release') {
    wallet.balance_ngn += transaction.amount_ngn;
    wallet.total_released += transaction.amount_ngn;
  } else if (transaction.type === 'escrow') {
    wallet.pending_escrow += transaction.amount_ngn;
  } else if (transaction.type === 'withdrawal') {
    wallet.balance_ngn -= transaction.amount_ngn;
    wallet.total_withdrawn += transaction.amount_ngn;
  }
  
  setSellerWallet(wallet);
}

export function getSellerStats() {
  return safeRead(KEYS.SELLER_STATS, {
    total_orders: 0,
    total_revenue: 0,
    pending_orders: 0,
    completed_orders: 0,
    products_count: 0,
    low_stock_alerts: 0,
  });
}

export function setSellerStats(stats) {
  safeWrite(KEYS.SELLER_STATS, stats);
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

  if (getSellerProducts().length === 0) {
    const mockProducts = [
      {
        id: 'prod-001',
        name: 'iPhone 15 Pro Max 256GB',
        category: 'Smartphones',
        price_ngn: 1850000,
        price_fcfa: 962320,
        commission_rate: 0.08,
        image: 'https://readdy.ai/api/search-image?query=iPhone 15 Pro Max 256GB titanium finish premium smartphone clean white background professional studio lighting minimalist product photography front and back view&width=300&height=300&seq=product-iphone-prod1&orientation=squarish',
        status: 'active',
        stock_total: 8,
        sales_count: 47,
        description: 'iPhone 15 Pro Max 256GB en finition Titane. Puce A17 Pro, appareil photo 48MP, ecran Super Retina XDR 6.7 pouces.',
        created_at: '2024-06-01',
        variants: [
          { size: '256GB', color: 'Titane Naturel', color_hex: '#8E8E8E', stock: 3 },
          { size: '256GB', color: 'Titane Noir', color_hex: '#2C2C2C', stock: 2 },
          { size: '512GB', color: 'Titane Naturel', color_hex: '#8E8E8E', stock: 2 },
          { size: '512GB', color: 'Titane Noir', color_hex: '#2C2C2C', stock: 1 },
        ],
      },
      {
        id: 'prod-002',
        name: 'Samsung Galaxy A54 128GB',
        category: 'Smartphones',
        price_ngn: 395000,
        price_fcfa: 205876,
        commission_rate: 0.08,
        image: 'https://readdy.ai/api/search-image?query=Samsung Galaxy A54 128GB android smartphone clean white background professional studio lighting minimalist product photography sleek design modern&width=300&height=300&seq=product-samsung-prod2&orientation=squarish',
        status: 'active',
        stock_total: 24,
        sales_count: 98,
        description: 'Samsung Galaxy A54 128GB, ecran AMOLED 6.4 pouces, camera 50MP, batterie 5000mAh.',
        created_at: '2024-06-15',
        variants: [
          { size: '128GB', color: 'Noir', color_hex: '#1A1A1A', stock: 8 },
          { size: '128GB', color: 'Blanc', color_hex: '#F5F5F5', stock: 7 },
          { size: '256GB', color: 'Noir', color_hex: '#1A1A1A', stock: 5 },
          { size: '256GB', color: 'Lavande', color_hex: '#B57BEB', stock: 4 },
        ],
      },
      {
        id: 'prod-003',
        name: 'JBL Tune 520BT',
        category: 'Audio',
        price_ngn: 42500,
        price_fcfa: 22154,
        commission_rate: 0.08,
        image: 'https://readdy.ai/api/search-image?query=JBL Tune 520BT wireless over-ear headphones clean white background professional studio lighting minimalist product photography audio bluetooth headset&width=300&height=300&seq=product-jbl-prod3&orientation=squarish',
        status: 'active',
        stock_total: 45,
        sales_count: 142,
        description: 'JBL Tune 520BT casque audio Bluetooth sans fil. Autonomie 57h, pliable, commandes sur arceau.',
        created_at: '2024-07-01',
        variants: [
          { size: 'Standard', color: 'Noir', color_hex: '#1A1A1A', stock: 15 },
          { size: 'Standard', color: 'Blanc', color_hex: '#F0F0F0', stock: 12 },
          { size: 'Standard', color: 'Bleu', color_hex: '#1E90FF', stock: 10 },
          { size: 'Standard', color: 'Rose', color_hex: '#FF69B4', stock: 8 },
        ],
      },
      {
        id: 'prod-004',
        name: 'Anker Power Bank 20000mAh',
        category: 'Accessoires',
        price_ngn: 28000,
        price_fcfa: 14598,
        commission_rate: 0.08,
        image: 'https://readdy.ai/api/search-image?query=Anker PowerCore 20000mAh portable charger power bank clean white background professional studio lighting minimalist product photography compact battery&width=300&height=300&seq=product-anker-prod4&orientation=squarish',
        status: 'active',
        stock_total: 62,
        sales_count: 203,
        description: 'Anker PowerCore 20000mAh batterie externe ultra-haute capacite. 2 ports USB-A + 1 USB-C.',
        created_at: '2024-07-15',
        variants: [
          { size: '20000mAh', color: 'Noir', color_hex: '#1A1A1A', stock: 35 },
          { size: '20000mAh', color: 'Blanc', color_hex: '#F0F0F0', stock: 27 },
        ],
      },
      {
        id: 'prod-005',
        name: 'Xiaomi Mi Band 8',
        category: 'Wearables',
        price_ngn: 35000,
        price_fcfa: 18242,
        commission_rate: 0.08,
        image: 'https://readdy.ai/api/search-image?query=Xiaomi Mi Band 8 smart fitness tracker wristband wearable device clean white background professional studio lighting minimalist product photography activity band&width=300&height=300&seq=product-xiaomi-prod5&orientation=squarish',
        status: 'active',
        stock_total: 33,
        sales_count: 87,
        description: 'Xiaomi Mi Band 8 bracelet connecte. Ecran AMOLED 1.62 pouces, 16 jours autonomie.',
        created_at: '2024-08-01',
        variants: [
          { size: 'Standard', color: 'Noir', color_hex: '#1A1A1A', stock: 15 },
          { size: 'Standard', color: 'Olive', color_hex: '#6B7C3A', stock: 10 },
          { size: 'Standard', color: 'Corail', color_hex: '#FF6B6B', stock: 8 },
        ],
      },
      {
        id: 'prod-006',
        name: 'Disque SSD Samsung T7',
        category: 'Stockage',
        price_ngn: 95000,
        price_fcfa: 49526,
        commission_rate: 0.08,
        image: 'https://readdy.ai/api/search-image?query=Samsung T7 portable SSD external solid state drive clean white background professional studio lighting minimalist product photography compact storage device&width=300&height=300&seq=product-ssd-prod6&orientation=squarish',
        status: 'pending',
        stock_total: 18,
        sales_count: 34,
        description: 'Samsung T7 SSD portable. Transferts jusqu a 1050 Mo/s. Boitier aluminium resistant.',
        created_at: '2024-09-01',
        variants: [
          { size: '500GB', color: 'Gris', color_hex: '#8E8E8E', stock: 7 },
          { size: '1TB', color: 'Gris', color_hex: '#8E8E8E', stock: 6 },
          { size: '1TB', color: 'Bleu', color_hex: '#1E4FC7', stock: 5 },
        ],
      },
    ];
    setSellerProducts(mockProducts);
  }

  if (getSellerOrders().length === 0) {
    const mockSellerOrders = [
      {
        id: 'TL-2026-0891',
        product: 'Agbada Premium Brodé',
        product_image: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4267?w=56&h=56&fit=crop',
        buyer: 'Kofi Mensah',
        buyer_city: 'Cotonou',
        quantity: 1,
        amount_ngn: 85000,
        amount_fcfa: 35120,
        status: 'new',
        created_at: '2026-04-20',
        hub: 'Lagos Hub',
        qr_code: 'TL-2026-0891-QR',
        items: [{ product: 'Agbada Premium Brodé', variant: 'XL / Blanc', qty: 1, unit_price: 85000, total: 85000 }],
        buyer_phone: '+229 97 12 34 56',
        deadline: '22 Avr 2026',
        seller_id: 'adebayo-fashions',
      },
      {
        id: 'TL-2026-0890',
        product: 'Tissu Ankara 6 yards',
        product_image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=56&h=56&fit=crop',
        buyer: 'Aminata Diallo',
        buyer_city: 'Porto-Novo',
        quantity: 2,
        amount_ngn: 79000,
        amount_fcfa: 32655,
        status: 'ready',
        created_at: '2026-04-19',
        hub: 'Lagos Hub',
        qr_code: 'TL-2026-0890-QR',
        items: [
          { product: 'Tissu Ankara 6 yards', variant: 'Motif Floral', qty: 2, unit_price: 32000, total: 64000 },
          { product: 'Fil à broder doré', variant: 'Standard', qty: 3, unit_price: 5000, total: 15000 },
        ],
        buyer_phone: '+229 96 45 67 89',
        deadline: '21 Avr 2026',
        seller_id: 'adebayo-fashions',
      },
      {
        id: 'TL-2026-0889',
        product: 'Sneakers Nike Air Max',
        product_image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=56&h=56&fit=crop',
        buyer: 'Séraphin Hounsou',
        buyer_city: 'Parakou',
        quantity: 1,
        amount_ngn: 120000,
        amount_fcfa: 49584,
        status: 'hub_received',
        created_at: '2026-04-18',
        hub: 'Lagos Hub',
        qr_code: 'TL-2026-0889-QR',
        items: [{ product: 'Sneakers Nike Air Max', variant: '43 / Blanc-Rouge', qty: 1, unit_price: 120000, total: 120000 }],
        buyer_phone: '+229 95 78 90 12',
        deadline: '20 Avr 2026',
        seller_id: 'adebayo-fashions',
      },
    ];
    setSellerOrders(mockSellerOrders);
  }

  if (getSellerWallet().balance_ngn === 0) {
    setSellerWallet({
      balance_ngn: 4785000,
      pending_escrow: 1202000,
      total_released: 12415000,
      total_withdrawn: 9920000,
      transactions: [
        { id: 'txn-001', type: 'release', amount_ngn: 1890000, status: 'completed', order_id: 'TL-004756', description: 'Fonds debloques — iPhone 15 Pro Max', date: '2026-04-18' },
        { id: 'txn-002', type: 'escrow', amount_ngn: 395000, status: 'pending', order_id: 'TL-004901', description: 'Fonds mis en Escrow', date: '2026-04-20' },
        { id: 'txn-003', type: 'withdrawal', amount_ngn: 2500000, status: 'completed', order_id: null, description: 'Retrait vers GTBank ****4821', date: '2026-04-15' },
        { id: 'txn-004', type: 'release', amount_ngn: 615000, status: 'completed', order_id: 'TL-004780', description: 'Fonds debloques — Nespresso', date: '2026-04-12' },
        { id: 'txn-005', type: 'escrow', amount_ngn: 807000, status: 'pending', order_id: 'TL-004899', description: 'Fonds mis en Escrow', date: '2026-04-19' },
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
}
