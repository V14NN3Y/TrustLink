import { supabase } from '@/lib/supabaseClient';
/**
 * Fetches every review of a product with the buyer's profile
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
 * Checks whether the buyer has already reviewed this product
 */
export const getBuyerReview = async (productId, buyerId) => {
  if (!buyerId) return null;
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
 * Checks whether the buyer has a delivered order containing this product
 * (required to be allowed to review it)
 */
export const canBuyerReview = async (productId, buyerId) => {
  if (!buyerId) return false;
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('id')
    .eq('buyer_id', buyerId)
    .in('status', ['delivered', 'confirmed']);
  if (ordersError || !orders?.length) return false;
  const orderIds = orders.map((o) => o.id);
  // Check whether this product is in one of those orders
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
 * Submits a review (create or update)
 */
export const submitReview = async ({ productId, buyerId, orderId, rating, comment }) => {
  if (!buyerId) throw new Error('buyerId required');
  // Check whether a review already exists
  const existing = await getBuyerReview(productId, buyerId);
  if (existing) {
    // Update
    const { data, error } = await supabase
      .from('reviews')
      .update({ rating, comment, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    // Create
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
 * Computes a product's average rating and review count
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
