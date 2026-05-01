import { supabase } from '@/lib/supabaseClient';
/**
 * Fetch tous les IDs produits de la wishlist.
 */
export const fetchWishlistIds = async (userId) => {
  const { data, error } = await supabase
    .from('wishlists')
    .select('product_id')
    .eq('buyer_id', userId);
  if (error) throw error;
  return (data || []).map((w) => w.product_id);
};
/**
 * Fetch les produits complets de la wishlist.
 */
export const fetchWishlistProducts = async (userId) => {
  const { data, error } = await supabase
    .from('wishlists')
    .select(`
      product_id,
      products (
        id,
        name,
        price,
        product_images (url, is_primary, sort_order),
        categories (name, slug)
      )
    `)
    .eq('buyer_id', userId);
  if (error) throw error;
  return (data || []).map((w) => {
    const images = [...(w.products?.product_images || [])]
      .sort((a, b) => {
        if (a.is_primary && !b.is_primary) return -1;
        if (!a.is_primary && b.is_primary) return 1;
        return (a.sort_order || 0) - (b.sort_order || 0);
      });
    return {
      id: w.products?.id,
      name: w.products?.name || '',
      price: Number(w.products?.price || 0),
      images: images.map((i) => i.url),
      category: w.products?.categories?.slug || '',
    };
  });
};
/**
 * Ajoute un produit à la wishlist.
 */
export const addToWishlist = async (userId, productId) => {
  const { error } = await supabase
    .from('wishlists')
    .insert({ buyer_id: userId, product_id: productId });
  if (error && error.code !== '23505') throw error; // ignore duplicate
};
/**
 * Retire un produit de la wishlist.
 */
export const removeFromWishlist = async (userId, productId) => {
  const { error } = await supabase
    .from('wishlists')
    .delete()
    .eq('buyer_id', userId)
    .eq('product_id', productId);
  if (error) throw error;
};
