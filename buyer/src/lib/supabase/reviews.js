import { supabase } from '@/lib/supabaseClient';
/**
 * Récupère toutes les reviews d'un produit avec le profil du buyer
 */
export const getProductReviews = async (productId) => {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      id,
      rating,
      comment,
      created_at,
      buyer_id,
      profiles:buyer_id (full_name, avatar_url)
    `)
    .eq('product_id', productId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};
/**
 * Vérifie si le buyer a déjà reviewé ce produit
 */
export const getBuyerReview = async (productId, buyerId) => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .eq('buyer_id', buyerId)
    .maybeSingle();
  if (error) throw error;
  return data;
};
/**
 * Vérifie si le buyer a une commande livrée contenant ce produit
 * (condition pour pouvoir reviewer)
 */
export const canBuyerReview = async (productId, buyerId) => {
  // Récupère les commandes livrées du buyer
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('id')
    .eq('buyer_id', buyerId)
    .in('status', ['delivered', 'confirmed']);
  if (ordersError || !orders?.length) return false;
  const orderIds = orders.map((o) => o.id);
  // Vérifie si ce produit est dans une de ces commandes
  const { data, error } = await supabase
    .from('order_items')
    .select('id')
    .eq('product_id', productId)
    .in('order_id', orderIds)
    .limit(1);
  if (error) throw error;
  return data && data.length > 0;
};
/**
 * Soumet une review (création ou mise à jour)
 */
export const submitReview = async ({ productId, buyerId, orderId, rating, comment }) => {
  // Vérifie si une review existe déjà
  const existing = await getBuyerReview(productId, buyerId);
  if (existing) {
    // Mise à jour
    const { data, error } = await supabase
      .from('reviews')
      .update({ rating, comment, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    // Création
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        product_id: productId,
        buyer_id: buyerId,
        order_id: orderId || null,
        rating,
        comment,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};
/**
 * Calcule la note moyenne et le nombre de reviews d'un produit
 */
export const getProductRatingStats = async (productId) => {
  const { data, error } = await supabase
    .from('reviews')
    .select('rating')
    .eq('product_id', productId);
  if (error) throw error;
  if (!data || data.length === 0) return { average: 0, count: 0 };
  const total = data.reduce((sum, r) => sum + r.rating, 0);
  return {
    average: Math.round((total / data.length) * 10) / 10,
    count: data.length,
  };
};
