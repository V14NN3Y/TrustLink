import { useState } from 'react';
import { ORDERS } from '@/mocks/orders';
import OrdersTable from './components/OrdersTable';
import OrderDetailModal from './components/OrderDetailModal';

export default function OrdersPage() {
  const [orders, setOrders] = useState(ORDERS);
  const [selectedOrder, setSelectedOrder] = useState(null);

  function handleUpdate(updated) {
    setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
    setSelectedOrder(updated);
  }

  return (
    <>
      <OrdersTable orders={orders} onSelect={setSelectedOrder} onUpdate={handleUpdate} />
      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onUpdate={handleUpdate} />
      )}
    </>
  );
}
