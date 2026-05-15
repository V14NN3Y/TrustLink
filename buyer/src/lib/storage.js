const RECENTLY_VIEWED_KEY = 'trustlink_recently_viewed';
const MAX_RECENT = 12;

export function addRecentlyViewed(productId) {
  try {
    const stored = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]');
    const filtered = stored.filter(id => id !== productId);
    filtered.unshift(productId);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(filtered.slice(0, MAX_RECENT)));
  } catch {}
}

export function getRecentlyViewed() {
  try {
    return JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || '[]');
  } catch { return []; }
}

const GUEST_CART_KEY = 'trustlink_guest_cart';

export function saveGuestCart(items) {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  } catch {}
}

export function loadGuestCart() {
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]');
  } catch { return []; }
}

export function clearGuestCart() {
  localStorage.removeItem(GUEST_CART_KEY);
}
