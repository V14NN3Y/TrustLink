import { useState } from 'react';
import { useSupabaseOrders } from '@/hooks/useSupabaseOrders';
import OrdersTable from './components/OrdersTable';
import OrderDetailModal from './components/OrderDetailModal';
export default function OrdersPage() {
  const { orders, loading, error, updateOrder } = useSupabaseOrders();
  const [selectedOrder, setSelectedOrder] = useState(null);
  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-trustblue/20 border-t-trustblue rounded-full animate-spin" /></div>;
  }
  return (
    <>
      <OrdersTable orders={orders} onSelect={setSelectedOrder} onUpdate={updateOrder} />
      {selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onUpdate={updateOrder} />
      )}
    </>
  );
}
