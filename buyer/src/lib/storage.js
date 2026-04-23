/**
 * TrustLink — Shared localStorage Service
 * 
 * Architecture temporaire avant Supabase.
 * Toutes les clés sont partagées entre Admin, Seller Hub et Marketplace (Buyer).
 * 
 * Taux de change : 1 XOF = 2.46 NGN  →  1 NGN = 0.4065 XOF
 * Commission TrustLink : 2.8%
 * Format ID commandes : TL-[ANNÉE]-[5CHIFFRES]
 */

// ─── Constants ─────────────────────────────────────────────
export const TRUSTLINK_COMMISSION = 0.028; // 2.8%
export const DEFAULT_EXCHANGE_RATE = 0.4065; // 1 NGN → XOF
export const DEFAULT_EXCHANGE_DISPLAY = "1 XOF = 2.46 NGN";

// ─── Storage Keys ──────────────────────────────────────────
const KEYS = {
  EXCHANGE_RATE: "tl_exchange_rate",
  EXCHANGE_DISPLAY: "tl_exchange_rate_display",
  EXCHANGE_UPDATED: "tl_exchange_updated_at",
  PRODUCTS: "tl_products",
  ORDERS: "tl_orders",
  AUTH_ROLE: "tl_auth_role",
  AUTH_USER_ID: "tl_auth_user_id",
  AUTH: "tl_auth",
};

// ─── Exchange Rate ─────────────────────────────────────────

/** Read the NGN → XOF exchange rate (written by Admin) */
export function getExchangeRate() {
  try {
    const stored = localStorage.getItem(KEYS.EXCHANGE_RATE);
    if (stored) {
      const val = parseFloat(stored);
      return isNaN(val) ? DEFAULT_EXCHANGE_RATE : val;
    }
  } catch (e) {
    console.warn("[TL Storage] Unable to read exchange rate:", e);
  }
  return DEFAULT_EXCHANGE_RATE;
}

/** Read the display string for the exchange rate */
export function getExchangeDisplay() {
  try {
    return localStorage.getItem(KEYS.EXCHANGE_DISPLAY) || DEFAULT_EXCHANGE_DISPLAY;
  } catch {
    return DEFAULT_EXCHANGE_DISPLAY;
  }
}

/** Convert NGN amount to XOF */
export function ngnToXof(amountNgn) {
  return Math.round(amountNgn * getExchangeRate());
}

/** Convert XOF amount to NGN */
export function xofToNgn(amountXof) {
  const rate = getExchangeRate();
  return rate > 0 ? Math.round(amountXof / rate) : 0;
}

// ─── Products ──────────────────────────────────────────────

/** Read products from shared localStorage (written by Seller Hub) */
export function getSharedProducts() {
  try {
    const stored = localStorage.getItem(KEYS.PRODUCTS);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("[TL Storage] Unable to read products:", e);
  }
  return null; // caller uses fallback mock data
}

/** Get only active products from shared storage */
export function getActiveSharedProducts() {
  const products = getSharedProducts();
  if (!products) return null;
  return products.filter((p) => p.status === "active");
}

// ─── Orders ────────────────────────────────────────────────

/** Read orders from shared localStorage */
export function getSharedOrders() {
  try {
    const stored = localStorage.getItem(KEYS.ORDERS);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn("[TL Storage] Unable to read orders:", e);
  }
  return [];
}

/** Write orders to shared localStorage */
export function setSharedOrders(orders) {
  try {
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
    // Dispatch event so other components / tabs can react
    window.dispatchEvent(new Event("tl-orders-update"));
  } catch (e) {
    console.error("[TL Storage] Unable to write orders:", e);
  }
}

/** 
 * Generate a new order ID in the unified format: TL-[YEAR]-[5DIGITS]
 * Reads existing orders to find the next sequential number.
 */
export function generateOrderId() {
  const year = new Date().getFullYear();
  const existing = getSharedOrders();

  // Find the highest existing number for this year
  let maxNum = 0;
  const prefix = `TL-${year}-`;
  for (const order of existing) {
    if (order.id && order.id.startsWith(prefix)) {
      const numStr = order.id.slice(prefix.length);
      const num = parseInt(numStr, 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }
  }

  const nextNum = String(maxNum + 1).padStart(5, "0");
  return `${prefix}${nextNum}`;
}

/** Add a new order and persist to shared storage */
export function addOrder(order) {
  const existing = getSharedOrders();
  existing.push(order);
  setSharedOrders(existing);
}

// ─── Auth (mock) ───────────────────────────────────────────

export function getAuthRole() {
  return localStorage.getItem(KEYS.AUTH_ROLE) || "buyer";
}

export function getAuthUserId() {
  return localStorage.getItem(KEYS.AUTH_USER_ID) || "buyer-001";
}

export function isAuthenticated() {
  return localStorage.getItem(KEYS.AUTH) === "true";
}

// ─── Init: seed defaults if nothing exists ─────────────────

export function initDefaults() {
  // Seed exchange rate if not set by Admin
  if (!localStorage.getItem(KEYS.EXCHANGE_RATE)) {
    localStorage.setItem(KEYS.EXCHANGE_RATE, String(DEFAULT_EXCHANGE_RATE));
  }
  if (!localStorage.getItem(KEYS.EXCHANGE_DISPLAY)) {
    localStorage.setItem(KEYS.EXCHANGE_DISPLAY, DEFAULT_EXCHANGE_DISPLAY);
  }
  if (!localStorage.getItem(KEYS.EXCHANGE_UPDATED)) {
    localStorage.setItem(KEYS.EXCHANGE_UPDATED, new Date().toISOString().split("T")[0]);
  }
  // Seed buyer auth
  if (!localStorage.getItem(KEYS.AUTH_ROLE)) {
    localStorage.setItem(KEYS.AUTH_ROLE, "buyer");
  }
  if (!localStorage.getItem(KEYS.AUTH_USER_ID)) {
    localStorage.setItem(KEYS.AUTH_USER_ID, "buyer-001");
  }
  if (!localStorage.getItem(KEYS.AUTH)) {
    localStorage.setItem(KEYS.AUTH, "true");
  }
}
