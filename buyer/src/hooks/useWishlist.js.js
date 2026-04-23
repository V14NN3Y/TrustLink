import { useState, useEffect } from 'react';

const WL_KEY = 'trustlink_wishlist';

const readWL = () => {
  try {
    return JSON.parse(localStorage.getItem(WL_KEY)) || [];
  } catch {
    return [];
  }
};

export function useWishlist() {
  const [items, setItems] = useState(readWL);

  useEffect(() => {
    const sync = () => setItems(readWL());
    window.addEventListener('trustlink-wl-update', sync);
    return () => window.removeEventListener('trustlink-wl-update', sync);
  }, []);

  const toggle = (id) => {
    const current = readWL();
    const updated = current.includes(id)
      ? current.filter((i) => i !== id)
      : [...current, id];
    localStorage.setItem(WL_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('trustlink-wl-update'));
    setItems(updated);
  };

  const isWishlisted = (id) => items.includes(id);

  return { items, toggle, isWishlisted };
}
