import { useCurrencyContext } from '@/lib/CurrencyContext';
import TrackingBar from './TrackingBar';

export default function OrderTimeline({ order, onConfirmDelivery, onOpenDispute }) {
  const { formatPrice } = useCurrencyContext();
  const isTerminal = ['disputed', 'cancelled', 'refunded'].includes(order.status);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h3 className="text-lg font-poppins font-bold" style={{ color: '#111827' }}>Suivi de commande</h3>
        <span className="text-xs font-mono font-bold px-2 py-1 rounded-lg" style={{ backgroundColor: '#F1F5F9', color: '#6B7280' }}>
          #{order.id?.slice(0, 8).toUpperCase()}
        </span>
      </div>

      {isTerminal ? (
        <div className={`p-4 rounded-xl mb-4 ${order.status === 'disputed' ? 'bg-red-50 border border-red-200' : 'bg-gray-50 border border-gray-200'}`}>
          <div className="flex items-center gap-2">
            <i className={`${order.status === 'disputed' ? 'ri-error-warning-line text-red-500' : 'ri-close-circle-line text-gray-500'}`}></i>
            <p className="text-sm font-semibold text-gray-800">
              {order.status === 'disputed' ? 'Litige en cours de traitement' : order.status === 'refunded' ? 'Commande remboursée' : 'Commande annulée'}
            </p>
          </div>
        </div>
      ) : (
        <TrackingBar order={order} />
      )}

      {order.items && (
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Articles</p>
          <div className="space-y-2">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm font-inter">
                <span style={{ color: '#374151' }}>{item.name} × {item.quantity}</span>
                <span className="font-semibold" style={{ color: '#111827' }}>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <hr className="border-gray-200 my-2" />
          <div className="flex justify-between text-sm font-poppins font-bold">
            <span style={{ color: '#111827' }}>Total</span>
            <span style={{ color: '#125C8D' }}>{formatPrice(order.total)}</span>
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {(order.status === 'in_transit' || order.status === 'delivered') && onConfirmDelivery && (
          <button onClick={onConfirmDelivery}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-poppins font-semibold text-white rounded-lg cursor-pointer"
            style={{ backgroundColor: '#16A34A' }}>
            <i className="ri-checkbox-circle-line"></i> Confirmer la réception
          </button>
        )}
        {(order.status === 'in_transit' || order.status === 'delivered') && onOpenDispute && (
          <button onClick={() => onOpenDispute(order)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-poppins font-semibold rounded-lg border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer">
            <i className="ri-error-warning-line"></i> Produit défectueux ?
          </button>
        )}
      </div>
    </div>
  );
}
