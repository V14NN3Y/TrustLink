import { supabase } from '@/lib/supabaseClient';
/**
 * Returns the signed-in user's cart, creating it if needed.
 */
const getOrCreateCart = async (userId) => {
  if (!userId) throw new Error('User ID required');
  const { data: existing } = await supabase
    .from('carts')
    .select('id')
    .eq('buyer_id', userId)
    .maybeSingle();
  if (existing) return existing.id;
  const { data: created, error } = await supabase
    .from('carts')
    .insert({ buyer_id: userId })
    .select('id')
    .single();
  if (error) {
    // Possible race (two tabs, double click...): another call created the
    // cart between our select and our insert. The unique constraint on
    // buyer_id makes THIS insert fail with Postgres code 23505; we simply
    // fetch the cart that now exists.
    if (error.code === '23505') {
      const { data: retry } = await supabase
        .from('carts')
        .select('id')
        .eq('buyer_id', userId)
        .maybeSingle();
      if (retry) return retry.id;
    }
    throw error;
  }
  return created.id;
};
/**
 * Fetches every cart item with its product details (including seller_id).
 */
export const fetchCartItems = async (userId) => {
  const cartId = await getOrCreateCart(userId);
  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      id,
      quantity,
      product_id,
      products (
        id,
        name,
        price,
        stock_quantity,
        seller_id,
        product_images (url, is_primary, sort_order)
      )
    `)
    .eq('cart_id', cartId);
  if (error) throw error;
  return (data || []).map((item) => {
    const images = [...(item.products?.product_images || [])]
      .sort((a, b) => {
        if (a.is_primary && !b.is_primary) return -1;
        if (!a.is_primary && b.is_primary) return 1;
        return (a.sort_order || 0) - (b.sort_order || 0);
      });
    return {
      id: item.id,
      productId: item.product_id,
      seller_id: item.products?.seller_id || null,
      name: item.products?.name || '',
      price: Number(item.products?.price || 0),
      stock: item.products?.stock_quantity || 0,
      image: images[0]?.url || '',
      quantity: item.quantity,
    };
  });
};
/**
 * Adds an item to the cart, or increments its quantity.
 */
export const addCartItem = async (userId, productId, quantity = 1) => {
  const cartId = await getOrCreateCart(userId);
  // Check whether the item is already in the cart
  const { data: existing } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('cart_id', cartId)
    .eq('product_id', productId)
    .maybeSingle();
  if (existing) {
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: existing.quantity + quantity })
      .eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('cart_items')
      .insert({ cart_id: cartId, product_id: productId, quantity });
    if (error) throw error;
  }
};
/**
 * Updates the quantity of an item.
 */
export const updateCartItemQuantity = async (itemId, quantity) => {
  if (quantity < 1) {
    return removeCartItem(itemId);
  }
  const { error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', itemId);
  if (error) throw error;
};
/**
 * Removes an item from the cart.
 */
export const removeCartItem = async (itemId) => {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', itemId);
  if (error) throw error;
};
/**
 * Empties the whole cart.
 */
export const clearCart = async (userId) => {
  const cartId = await getOrCreateCart(userId);
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('cart_id', cartId);
  if (error) throw error;
};
