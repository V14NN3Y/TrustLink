import { useState, useEffect } from 'react';
import { ORDERS } from '@/mocks/orders';
import { getSharedOrders, setSharedOrders } from '@/lib/sharedStorage';
import OrdersTable from './components/OrdersTable';
import OrderDetailModal from './components/OrderDetailModal';

function sharedOrderToOrder(o) {
  return {
    id: o.id,
    ref: o.id,
    status: o.status,
    journey_step: 'awaiting_payment',
    hub_origin: o.hub ? o.hub.replace(' Hub', '') : 'Lagos',
    seller_name: o.seller_name,
    seller_id: o.seller_id,
    buyer_name: o.buyer_name,
    product: o.product_name,
    amount_xof: o.amount_xof,
    amount_ngn: o.amount_ngn,
    created_at: o.created_at,
    _fromShared: true,
  };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState(ORDERS);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const shared = getSharedOrders();
    if (shared.length > 0) {
      const adapted = shared.map(sharedOrderToOrder);
      // Merge: shared orders first, then mock orders not already in shared
      const sharedIds = new Set(adapted.map(o => o.id));
      const mockOnly = ORDERS.filter(o => !sharedIds.has(o.id));
      setOrders([...adapted, ...mockOnly]);
    }
  }, []);

  function handleUpdate(updated) {
    setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
    setSelectedOrder(updated);
    // Persist if from shared
    const shared = getSharedOrders();
    if (shared.find(o => o.id === updated.id)) {
      setSharedOrders(shared.map(o =>
        o.id === updated.id
          ? { ...o, status: updated.status, updated_at: new Date().toISOString() }
          : o
      ));
    }
  }

  function handleDispatchSuccess(orderId) {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'dispatched_to_seller' } : o));
    setSelectedOrder(null);
  }

  return (
    <>
      <OrdersTable orders={orders} onSelect={setSelectedOrder} onUpdate={handleUpdate} />
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdate={handleUpdate}
          onDispatchSuccess={handleDispatchSuccess}
        />
      )}
    </>
  );
}
