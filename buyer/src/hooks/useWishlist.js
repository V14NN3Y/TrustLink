import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { toast } from '@/components/ui/use-toast';
import {
  fetchWishlistIds,
  fetchWishlistProducts,
  addToWishlist,
  removeFromWishlist,
} from '@/lib/supabase/wishlist';

export function useWishlist() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const wishlistKey = ['wishlist', user?.id];

  const { data: items = [] } = useQuery({
    queryKey: wishlistKey,
    queryFn: () => fetchWishlistIds(user.id),
    enabled: !!user?.id,
  });

  const { data: products = [], isLoading } = useQuery({
    queryKey: [...wishlistKey, 'products'],
    queryFn: () => fetchWishlistProducts(user.id),
    enabled: !!user?.id,
  });

  const toggleMutation = useMutation({
    mutationFn: async (productId) => {
      if (items.includes(productId)) {
        await removeFromWishlist(user.id, productId);
      } else {
        await addToWishlist(user.id, productId);
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: wishlistKey }),
  });

  const toggle = useCallback((productId) => {
    if (!isAuthenticated || !user?.id) {
      toast({ title: 'Connexion requise', description: 'Veuillez vous connecter pour gérer votre wishlist', variant: 'destructive' });
      return;
    }
    toggleMutation.mutate(productId);
  }, [isAuthenticated, user?.id, toggleMutation]);

  const isWishlisted = useCallback(
    (productId) => items.includes(productId),
    [items]
  );

  const loadWishlistProducts = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [...wishlistKey, 'products'] });
  }, [queryClient, wishlistKey]);

  return {
    items,
    products,
    loading: isLoading,
    toggle,
    isWishlisted,
    loadWishlistProducts,
    reload: () => queryClient.invalidateQueries({ queryKey: wishlistKey }),
  };
}
