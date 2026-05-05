import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import {
  fetchWishlistIds,
  fetchWishlistProducts,
  addToWishlist,
  removeFromWishlist,
} from '@/lib/supabase/wishlist';
export function useWishlist() {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);       // liste d'IDs produits
  const [products, setProducts] = useState([]); // produits complets
  const [loading, setLoading] = useState(false);
  const loadWishlist = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const ids = await fetchWishlistIds(user.id);
      setItems(ids);
    } catch (err) {
      console.error('Erreur chargement wishlist:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?.id]);
  const loadWishlistProducts = useCallback(async () => {
    if (!isAuthenticated || !user?.id) return;
    try {
      const data = await fetchWishlistProducts(user.id);
      setProducts(data);
    } catch (err) {
      console.error('Erreur chargement produits wishlist:', err);
    }
  }, [isAuthenticated, user?.id]);
  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);
  const toggle = useCallback(async (productId) => {
    if (!isAuthenticated || !user?.id) {
      alert('Veuillez vous connecter pour gérer votre wishlist');
      return;
    }
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
