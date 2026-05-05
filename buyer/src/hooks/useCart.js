import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import {
  fetchCartItems,
  addCartItem,
  updateCartItemQuantity,
  removeCartItem,
  clearCart as clearCartDB,
} from '@/lib/supabase/cart';
export function useCart() {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  // Charge le panier depuis Supabase (connecté ou non, avec user.id temporaire possible)
  const loadCart = useCallback(async () => {
    if (!user?.id) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchCartItems(user.id);
      setItems(data);
    } catch (err) {
      console.error('Erreur chargement panier:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);
  useEffect(() => {
    loadCart();
  }, [loadCart]);
  const addItem = useCallback(async (item) => {
    if (!user?.id) {
      alert('Veuillez vous connecter pour ajouter au panier');
      return;
    }
    try {
      await addCartItem(user.id, item.productId, item.quantity || 1);
      await loadCart();
    } catch (err) {
      console.error('Erreur ajout panier:', err);
    }
  }, [user?.id, loadCart]);
  const removeItem = useCallback(async (productIdOrItemId) => {
    const item = items.find((i) => i.productId === productIdOrItemId || i.id === productIdOrItemId);
    if (!item) return;
    try {
      await removeCartItem(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      console.error('Erreur suppression panier:', err);
    }
  }, [items]);
  const updateQuantity = useCallback(async (productIdOrItemId, quantity) => {
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
  }, [items]);
  const clearCart = useCallback(async () => {
    if (!user?.id) return;
    try {
      await clearCartDB(user.id);
      setItems([]);
    } catch (err) {
      console.error('Erreur vidage panier:', err);
    }
  }, [user?.id]);
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
