import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import {
  fetchWishlistIds,
  fetchWishlistProducts,
  addToWishlist,
  removeFromWishlist,
} from '@/lib/supabase/wishlist';
// Fallback localStorage pour les guests
const LS_KEY = 'trustlink_wishlist_guest';
const readGuestWL = () => {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
  catch { return []; }
};
export function useWishlist() {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);       // liste d'IDs produits
  const [products, setProducts] = useState([]); // produits complets
  const [loading, setLoading] = useState(false);
  const loadWishlist = useCallback(async () => {
    if (isAuthenticated && user?.id) {
      setLoading(true);
      try {
        const ids = await fetchWishlistIds(user.id);
        setItems(ids);
      } catch (err) {
        console.error('Erreur chargement wishlist:', err);
      } finally {
        setLoading(false);
      }
    } else {
      setItems(readGuestWL());
    }
  }, [isAuthenticated, user?.id]);
  const loadWishlistProducts = useCallback(async () => {
    if (isAuthenticated && user?.id) {
      try {
        const data = await fetchWishlistProducts(user.id);
        setProducts(data);
      } catch (err) {
        console.error('Erreur chargement produits wishlist:', err);
      }
    }
  }, [isAuthenticated, user?.id]);
  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);
  const toggle = useCallback(async (productId) => {
    if (isAuthenticated && user?.id) {
      const isIn = items.includes(productId);
      try {
        if (isIn) {
          await removeFromWishlist(user.id, productId);
          setItems((prev) => prev.filter((id) => id !== productId));
          setProducts((prev) => prev.filter((p) => p.id !== productId));
        } else {
          await addToWishlist(user.id, productId);
          setItems((prev) => [...prev, productId]);
        }
      } catch (err) {
        console.error('Erreur toggle wishlist:', err);
      }
    } else {
      const current = readGuestWL();
      const updated = current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId];
      localStorage.setItem(LS_KEY, JSON.stringify(updated));
      setItems(updated);
    }
  }, [isAuthenticated, user?.id, items]);
  const isWishlisted = useCallback(
    (productId) => items.includes(productId),
    [items]
  );
  return {
    items,
    products,
    loading,
    toggle,
    isWishlisted,
    loadWishlistProducts,
    reload: loadWishlist,
  };
}
