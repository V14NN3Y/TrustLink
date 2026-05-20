import { supabase } from '@/lib/supabaseClient';

export const createOrder = async ({ buyerId, items, address, paymentMethod, totalAmount, deliveryFee, commissionAmount, couponCode, couponDiscount }) => {
  if (buyerId) {
    const profileUpdates = {};
    if (address.district) profileUpdates.default_address_line1 = address.district;
    if (address.city) profileUpdates.default_city = address.city;
    if (address.phone) profileUpdates.phone = address.phone;
    if (Object.keys(profileUpdates).length > 0) {
      await supabase.from('profiles').update(profileUpdates).eq('id', buyerId);
    }
  }

  const groupId = crypto.randomUUID();
  const itemsBySeller = items.reduce((acc, item) => {
    const sellerId = item.seller_id;
    if (!acc[sellerId]) acc[sellerId] = [];
    acc[sellerId].push(item);
    return acc;
  }, {});

  const sellerIds = Object.keys(itemsBySeller);
  const grandSubtotal = sellerIds.reduce((sum, sid) => {
    return sum + itemsBySeller[sid].reduce((s, item) => s + item.price * item.quantity, 0);
  }, 0);

  const createdOrderIds = [];
  try {
    for (const sellerId of sellerIds) {
      const sellerItems = itemsBySeller[sellerId];
      const sellerSubtotal = sellerItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const ratio = grandSubtotal > 0 ? sellerSubtotal / grandSubtotal : 1 / sellerIds.length;
      const orderDeliveryFee = Math.round(ratio * (deliveryFee || 0));
      const orderCommission = Math.round(ratio * (commissionAmount || 0));
      const orderDiscount = Math.round(ratio * (couponDiscount || 0));
      const sellerTotal = sellerSubtotal + orderDeliveryFee + orderCommission - orderDiscount;

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
          commission_amount: orderCommission,
          delivery_fee: orderDeliveryFee,
          coupon_code: couponCode || null,
          coupon_discount: orderDiscount || 0,
          currency: 'XOF',
          payment_method: paymentMethod,
          notes: `Paiement via ${paymentMethod}`,
        })
        .select('id')
        .single();
      if (orderError) throw orderError;
      createdOrderIds.push(order.id);

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
  } catch (err) {
    if (createdOrderIds.length > 0) {
      await supabase.from('orders').delete().in('id', createdOrderIds);
    }
    throw err;
  }
};

export const fetchOrders = async (buyerId) => {
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
        trackingNumber: `TL-${order.id.substring(0, 8).toUpperCase()}`,
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

export const updateOrdersAfterPayment = async ({ groupId, paymentReference }) => {
  const updateData = { status: 'paid', updated_at: new Date().toISOString() };
  if (paymentReference) updateData.payment_reference = paymentReference;

  const { error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('group_id', groupId);
  if (error) throw error;
};
