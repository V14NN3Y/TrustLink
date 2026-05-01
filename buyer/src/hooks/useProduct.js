import { useQuery } from '@tanstack/react-query';
import { fetchProductById } from '@/lib/supabase/products';
/**
 * Hook to fetch a single product by ID.
 * @param {string} id - Product UUID
 */
export function useProduct(id) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}
