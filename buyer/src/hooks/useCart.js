import { useState, useEffect } from 'react';

const CART_KEY = 'trustlink_cart';

const readCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
};

const writeCart = (items) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('trustlink-cart-update'));
};

export function useCart() {
  const [items, setItems] = useState(readCart);

  useEffect(() => {
    const sync = () => setItems(readCart());
    window.addEventListener('trustlink-cart-update', sync);
    return () => window.removeEventListener('trustlink-cart-update', sync);
  }, []);

  const addItem = (item) => {
    const current = readCart();
    const existing = current.find(
      (i) => i.productId === item.productId && i.selectedSize === item.selectedSize && i.selectedColor === item.selectedColor
    );
    let updated;
    if (existing) {
      updated = current.map((i) =>
        i === existing ? { ...i, quantity: i.quantity + (item.quantity || 1) } : i
      );
    } else {
      updated = [...current, { ...item, quantity: item.quantity || 1 }];
    }
    writeCart(updated);
    setItems(updated);
  };

  const removeItem = (productId) => {
    const updated = readCart().filter((i) => i.productId !== productId);
    writeCart(updated);
    setItems(updated);
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) { removeItem(productId); return; }
    const updated = readCart().map((i) =>
      i.productId === productId ? { ...i, quantity } : i
    );
    writeCart(updated);
    setItems(updated);
  };

  const clearCart = () => {
    writeCart([]);
    setItems([]);
  };

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return { items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice };
}
