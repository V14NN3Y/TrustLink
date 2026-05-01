import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import {
  fetchCartItems,
  addCartItem,
  updateCartItemQuantity,
  removeCartItem,
  clearCart as clearCartDB,
} from '@/lib/supabase/cart';
// Fallback localStorage pour les utilisateurs non connectés
const LS_KEY = 'trustlink_cart_guest';
const readGuestCart = () => {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
  catch { return []; }
};
const writeGuestCart = (items) => {
  localStorage.setItem(LS_KEY, JSON.stringify(items));
};
export function useCart() {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  // Charge le panier (Supabase si connecté, localStorage sinon)
  const loadCart = useCallback(async () => {
    if (isAuthenticated && user?.id) {
      setLoading(true);
      try {
        const data = await fetchCartItems(user.id);
        setItems(data);
      } catch (err) {
        console.error('Erreur chargement panier:', err);
      } finally {
        setLoading(false);
      }
    } else {
      setItems(readGuestCart());
    }
  }, [isAuthenticated, user?.id]);
  useEffect(() => {
    loadCart();
  }, [loadCart]);
  const addItem = useCallback(async (item) => {
    if (isAuthenticated && user?.id) {
      try {
        await addCartItem(user.id, item.productId, item.quantity || 1);
        await loadCart();
      } catch (err) {
        console.error('Erreur ajout panier:', err);
      }
    } else {
      // Guest mode
      const current = readGuestCart();
      const existing = current.find((i) => i.productId === item.productId);
      let updated;
      if (existing) {
        updated = current.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
      } else {
        updated = [...current, { ...item, quantity: item.quantity || 1 }];
      }
      writeGuestCart(updated);
      setItems(updated);
    }
  }, [isAuthenticated, user?.id, loadCart]);
  const removeItem = useCallback(async (productIdOrItemId) => {
    if (isAuthenticated && user?.id) {
      // Trouve l'item par productId pour récupérer son id Supabase
      const item = items.find((i) => i.productId === productIdOrItemId || i.id === productIdOrItemId);
      if (!item) return;
      try {
        await removeCartItem(item.id);
        setItems((prev) => prev.filter((i) => i.id !== item.id));
      } catch (err) {
        console.error('Erreur suppression panier:', err);
      }
    } else {
      const updated = readGuestCart().filter((i) => i.productId !== productIdOrItemId);
      writeGuestCart(updated);
      setItems(updated);
    }
  }, [isAuthenticated, user?.id, items]);
  const updateQuantity = useCallback(async (productIdOrItemId, quantity) => {
    if (isAuthenticated && user?.id) {
      const item = items.find((i) => i.productId === productIdOrItemId || i.id === productIdOrItemId);
      if (!item) return;
      try {
        await updateCartItemQuantity(item.id, quantity);
        if (quantity < 1) {
          setItems((prev) => prev.filter((i) => i.id !== item.id));
        } else {
          setItems((prev) =>
            prev.map((i) => i.id === item.id ? { ...i, quantity } : i)
          );
        }
      } catch (err) {
        console.error('Erreur mise à jour quantité:', err);
      }
    } else {
      if (quantity < 1) { removeItem(productIdOrItemId); return; }
      const updated = readGuestCart().map((i) =>
        i.productId === productIdOrItemId ? { ...i, quantity } : i
      );
      writeGuestCart(updated);
      setItems(updated);
    }
  }, [isAuthenticated, user?.id, items, removeItem]);
  const clearCart = useCallback(async () => {
    if (isAuthenticated && user?.id) {
      try {
        await clearCartDB(user.id);
        setItems([]);
      } catch (err) {
        console.error('Erreur vidage panier:', err);
      }
    } else {
      writeGuestCart([]);
      setItems([]);
    }
  }, [isAuthenticated, user?.id]);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  return {
    items,
    loading,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    reload: loadCart,
  };
}
