import { supabase } from '@/lib/supabaseClient';

/**
 * Creates the order(s) for the current cart.
 * Prices, delivery fee, escrow commission and coupon are computed SERVER-SIDE
 * by the create_checkout_order() RPC (buyers cannot insert into orders /
 * order_items directly anymore), so the amount sent to KkiaPay must be the
 * `totalAmount` returned here, not a client-side calculation.
 */
export const createOrder = async ({ buyerId, items, address, paymentMethod, couponCode }) => {
  if (buyerId) {
    const profileUpdates = {};
    if (address.district) profileUpdates.default_address_line1 = address.district;
    if (address.city) profileUpdates.default_city = address.city;
    if (address.phone) profileUpdates.phone = address.phone;
    if (Object.keys(profileUpdates).length > 0) {
      await supabase.from('profiles').update(profileUpdates).eq('id', buyerId);
    }
  }

  const { data, error } = await supabase.rpc('create_checkout_order', {
    p_items: items.map((item) => ({ product_id: item.productId, quantity: item.quantity })),
    p_shipping: { district: address.district || null, city: address.city || null, phone: address.phone || null },
    p_payment_method: paymentMethod,
    p_coupon_code: couponCode || null,
  });
  if (error) throw error;

  return {
    groupId: data.group_id,
    orderIds: data.order_ids,
    subtotal: Number(data.subtotal),
    deliveryFee: Number(data.delivery_fee),
    commissionAmount: Number(data.commission_amount),
    couponDiscount: Number(data.coupon_discount),
    totalAmount: Number(data.total_amount),
    sellerCount: data.seller_count,
  };
};

/**
 * Asks the verify-payment Edge Function to check the KkiaPay transaction
 * server-side; on success the orders are marked 'paid' immediately.
 * Returns { paid: boolean, reason?: string }. Never throws: if the function is
 * not deployed / unreachable, the admin still validates manually from the
 * payment reference recorded by recordPaymentReference().
 */
export const verifyPayment = async ({ groupId, transactionId }) => {
  if (!groupId || !transactionId) return { paid: false, reason: 'missing_reference' };
  try {
    const { data, error } = await supabase.functions.invoke('verify-payment', {
      body: { group_id: groupId, transaction_id: transactionId },
    });
    if (error) return { paid: false, reason: error.message };
    return { paid: Boolean(data?.paid), reason: data?.reason };
  } catch (err) {
    return { paid: false, reason: err?.message || 'verify_failed' };
  }
};

export const fetchOrders = async (buyerId) => {
  if (!buyerId) return [];
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      group_id,
      status,
      total_amount,
      commission_amount,
      delivery_fee,
      coupon_code,
      coupon_discount,
      currency,
      shipping_city,
      created_at,
      dispatch_id,
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

  const dispatchIds = [...new Set((data || []).map(o => o.dispatch_id).filter(Boolean))];
  let dispatches = [];
  if (dispatchIds.length > 0) {
    const { data: d } = await supabase
      .from('dispatches')
      .select('id, dispatch_code, status, origin_hub, destination_hub, estimated_arrival, updated_at')
      .in('id', dispatchIds);
    dispatches = d || [];
  }
  const dispatchMap = Object.fromEntries(dispatches.map(d => [d.id, d]));

  const grouped = {};
  (data || []).forEach((order) => {
    const key = order.group_id || order.id;
    if (!grouped[key]) {
      grouped[key] = {
        groupId: order.group_id,
        id: order.id,
        status: order.status,
        total: 0,
        city: order.shipping_city,
        createdAt: order.created_at,
        trackingNumber: `TL-${(order.group_id || order.id).substring(0, 8).toUpperCase()}`,
        items: [],
        orderIds: [],
        dispatches: [],
      };
    }
    const group = grouped[key];
    group.total += Number(order.total_amount);
    group.orderIds.push(order.id);

    if (order.dispatch_id && dispatchMap[order.dispatch_id]) {
      const dispatch = dispatchMap[order.dispatch_id];
      if (!group.dispatches.find(d => d.id === dispatch.id)) {
        group.dispatches.push(dispatch);
      }
    }

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

export const fetchOrderById = async (orderId) => {
  if (!orderId) return null;
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      status,
      total_amount,
      commission_amount,
      delivery_fee,
      coupon_code,
      coupon_discount,
      dispatch_id,
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

  if (data?.dispatch_id) {
    const { data: dispatch } = await supabase
      .from('dispatches')
      .select('dispatch_code, status, origin_hub, destination_hub, estimated_arrival, updated_at')
      .eq('id', data.dispatch_id)
      .single();
    data.dispatch = dispatch || null;
  }

  return data;
};

// Les buyers n'ont pas de droit `update` sur orders (RLS) — et c'est
// volontaire : rien ne vérifie côté serveur qu'un paiement KkiaPay a
// réellement eu lieu, donc laisser le buyer se mettre lui-même "paid"
// serait une faille (n'importe qui pourrait s'auto-valider sans payer).
// On se contente d'enregistrer la référence de transaction pour que
// l'admin puisse la rapprocher du dashboard KkiaPay ; c'est lui qui
// bascule le statut en 'paid' après vérification (flux déjà documenté).
export const recordPaymentReference = async ({ groupId, paymentReference, paymentMethod }) => {
  if (!groupId) return;
  const { error } = await supabase.rpc('record_payment_reference', {
    p_group_id: groupId,
    p_reference: paymentReference || null,
    p_method: paymentMethod || null,
  });
  if (error) throw error;
};
