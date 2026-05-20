import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { saveGuestCart, loadGuestCart, clearGuestCart } from '@/lib/storage';
import {
  fetchCartItems,
  addCartItem,
  updateCartItemQuantity,
  removeCartItem,
  clearCart as clearCartDB,
} from '@/lib/supabase/cart';

export function useCart() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const cartKey = ['cart', user?.id];
  const [guestItems, setGuestItems] = useState(() => loadGuestCart());
  const mergedRef = useRef(false);

  const { data: dbItems = [], isLoading } = useQuery({
    queryKey: cartKey,
    queryFn: () => fetchCartItems(user.id),
    enabled: !!user?.id,
  });

  const addItemMutation = useMutation({
    mutationFn: (item) => addCartItem(user.id, item.productId, item.quantity || 1),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cartKey }),
  });

  const removeItemMutation = useMutation({
    mutationFn: (itemId) => removeCartItem(itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cartKey }),
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({ itemId, quantity }) => updateCartItemQuantity(itemId, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cartKey }),
  });

  const clearCartMutation = useMutation({
    mutationFn: () => clearCartDB(user.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: cartKey }),
  });

  useEffect(() => {
    if (user?.id && guestItems.length > 0 && !mergedRef.current) {
      mergedRef.current = true;
      (async () => {
        for (const item of guestItems) {
          try {
            await addCartItem(user.id, item.productId, item.quantity);
          } catch {
            // Silently skip failed items during merge
          }
        }
        clearGuestCart();
        setGuestItems([]);
        queryClient.invalidateQueries({ queryKey: cartKey });
      })();
    }
    if (!user?.id) {
      mergedRef.current = false;
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      saveGuestCart(guestItems);
    }
  }, [guestItems, user?.id]);

  const items = user?.id ? dbItems : guestItems;

  const addItem = useCallback((item) => {
    if (!user?.id) {
      setGuestItems(prev => {
        const existing = prev.find(i => i.productId === item.productId);
        if (existing) {
          return prev.map(i => i.productId === item.productId
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i);
        }
        return [...prev, {
          id: `guest-${Date.now()}`,
          productId: item.productId,
          seller_id: item.seller_id || null,
          name: item.name || '',
          price: item.price || 0,
          stock: item.stock || 0,
          image: item.image || '',
          quantity: item.quantity || 1,
        }];
      });
      return;
    }
    addItemMutation.mutate(item);
  }, [user?.id, addItemMutation]);

  const removeItem = useCallback((productIdOrItemId) => {
    if (!user?.id) {
      setGuestItems(prev => prev.filter(i =>
        i.productId !== productIdOrItemId && i.id !== productIdOrItemId
      ));
      return;
    }
    const item = items.find((i) => i.productId === productIdOrItemId || i.id === productIdOrItemId);
    if (!item) return;
    removeItemMutation.mutate(item.id);
  }, [user?.id, items, removeItemMutation]);

  const updateQuantity = useCallback((productIdOrItemId, quantity) => {
    if (!user?.id) {
      setGuestItems(prev => prev.map(i =>
        i.productId === productIdOrItemId || i.id === productIdOrItemId
          ? { ...i, quantity }
          : i
      ));
      return;
    }
    const item = items.find((i) => i.productId === productIdOrItemId || i.id === productIdOrItemId);
    if (!item) return;
    updateQuantityMutation.mutate({ itemId: item.id, quantity });
  }, [user?.id, items, updateQuantityMutation]);

  const clearCart = useCallback(async () => {
    if (!user?.id) {
      setGuestItems([]);
      clearGuestCart();
      return;
    }
    return clearCartMutation.mutateAsync();
  }, [user?.id, clearCartMutation]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return {
    items,
    loading: isLoading,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    reload: () => queryClient.invalidateQueries({ queryKey: cartKey }),
  };
}
