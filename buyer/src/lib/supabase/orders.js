import { supabase } from '@/lib/supabaseClient';
/**
 * Crée des commandes groupées par vendeur (seller) avec un group_id commun.
 * Retourne le group_id pour que le checkout puisse l'utiliser.
 */
export const createOrder = async ({ buyerId, items, address, paymentMethod, totalAmount }) => {
  // 1. Générer un group_id unique pour lier les commandes de ce panier
  const groupId = crypto.randomUUID();
  // 2. Grouper les items par seller_id
  const itemsBySeller = items.reduce((acc, item) => {
    const sellerId = item.seller_id;
    if (!acc[sellerId]) acc[sellerId] = [];
    acc[sellerId].push(item);
    return acc;
  }, {});
  // 3. Créer une commande par vendeur
  const sellerIds = Object.keys(itemsBySeller);
  for (const sellerId of sellerIds) {
    const sellerItems = itemsBySeller[sellerId];
    const sellerTotal = sellerItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: buyerId,
        group_id: groupId,
        status: 'pending',
        shipping_address_line1: address.district,
        shipping_city: address.city,
        shipping_country: 'Bénin',
        total_amount: sellerTotal,
        currency: 'XOF',
        notes: `Paiement via ${paymentMethod}`,
      })
      .select('id')
      .single();
    if (orderError) throw orderError;
    // Créer les order_items pour ce vendeur
    const orderItems = sellerItems.map((item) => ({
      order_id: order.id,
      seller_id: sellerId,
      product_id: item.productId,
      product_name: item.name,
      product_price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
      status: 'pending',
    }));
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    if (itemsError) throw itemsError;
  }
  return groupId;
};
/**
 * Fetch toutes les commandes d'un buyer, consolidées par group_id.
 * Les commandes issues d'un même panier (plusieurs vendeurs) sont groupées.
 */
export const fetchOrders = async (buyerId) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      group_id,
      status,
      total_amount,
      currency,
      shipping_city,
      created_at,
      order_items (
        id,
        product_name,
        product_price,
        quantity,
        subtotal,
        status,
        product_id,
        seller_id,
        products (
          product_images (url, is_primary, sort_order)
        )
      )
    `)
    .eq('buyer_id', buyerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  // Grouper par group_id (ou par id si pas de group_id)
  const grouped = {};
  (data || []).forEach((order) => {
    const key = order.group_id || order.id;
    if (!grouped[key]) {
      grouped[key] = {
        groupId: order.group_id,
        id: order.id, // Une commande principale pour l'affichage
        status: order.status,
        total: 0,
        city: order.shipping_city,
        createdAt: order.created_at,
        trackingNumber: `TL-${order.id.substring(0, 8).toUpperCase()}`,
        items: [],
        orderIds: [],
      };
    }
    const group = grouped[key];
    group.total += Number(order.total_amount);
    group.orderIds.push(order.id);
    // Ajouter les items de cette commande
    (order.order_items || []).forEach((item) => {
      const images = [...(item.products?.product_images || [])].sort((a, b) => {
        if (a.is_primary && !b.is_primary) return -1;
        if (!a.is_primary && b.is_primary) return 1;
        return (a.sort_order || 0) - (b.sort_order || 0);
      });
      group.items.push({
        id: item.id,
        productId: item.product_id,
        name: item.product_name,
        price: Number(item.product_price),
        quantity: item.quantity,
        subtotal: Number(item.subtotal),
        image: images[0]?.url || '',
        sellerId: item.seller_id,
        orderItemStatus: item.status,
      });
    });
    // Le statut global = le plus critique parmi les commandes du groupe
    const statusPriority = {
      'disputed': 0, 'cancelled': 1, 'pending': 2, 'paid': 3,
      'processing': 4, 'in_transit': 5, 'delivered': 6, 'confirmed': 7, 'refunded': 8
    };
    if (statusPriority[order.status] < statusPriority[group.status]) {
      group.status = order.status;
    }
  });
  return Object.values(grouped);
};
/**
 * Fetch une commande par ID.
 */
export const fetchOrderById = async (orderId) => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      status,
      total_amount,
      shipping_city,
      shipping_address_line1,
      notes,
      created_at,
      order_items (
        id,
        product_name,
        product_price,
        quantity,
        subtotal,
        status,
        product_id,
        products (
          product_images (url, is_primary, sort_order)
        )
      )
    `)
    .eq('id', orderId)
    .maybeSingle();
  if (error) throw error;
  return data;
};
