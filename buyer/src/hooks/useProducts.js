import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '@/lib/supabase/products';
/**
 * Hook to fetch products with optional filters.
 * @param {Object} filters - { category, search }
 */
export function useProducts(filters = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
