import { useState, useEffect } from 'react';
import { StorageManager } from '@/lib/storage';
import OrdersTable from './components/OrdersTable';
import OrderDetailModal from './components/OrderDetailModal';

export default function OrdersPage() {
  const [orders, setOrders] = useState(() => StorageManager.getOrders());
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === StorageManager.getKeys().ORDERS && e.newValue) {
        setOrders(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  function handleUpdate(updated) {
    StorageManager.updateOrder(updated);
    setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
    if (selectedOrder?.id === updated.id) {
      setSelectedOrder(updated);
    }
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
