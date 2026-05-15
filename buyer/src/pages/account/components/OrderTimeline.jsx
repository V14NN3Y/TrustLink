import { formatPrice } from '@/utils/format';

const JOURNEY_STEPS = [
  { key: 'pending', icon: 'ri-time-line', label: 'Commande passée' },
  { key: 'paid', icon: 'ri-bank-card-line', label: 'Paiement confirmé' },
  { key: 'processing', icon: 'ri-loader-2-line', label: 'En préparation' },
  { key: 'in_transit', icon: 'ri-truck-line', label: 'En transit' },
  { key: 'delivered', icon: 'ri-map-pin-line', label: 'Livré' },
  { key: 'confirmed', icon: 'ri-check-double-line', label: 'Confirmé' },
];

const STATUS_PRIORITY = {
  disputed: 6, cancelled: 6, refunded: 6,
  pending: 0, paid: 1, processing: 2, in_transit: 3, delivered: 4, confirmed: 5,
};

export default function OrderTimeline({ order, onConfirmDelivery, onOpenDispute }) {
  const currentIdx = STATUS_PRIORITY[order.status] ?? 0;
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
        <div className="relative mb-8">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
          {JOURNEY_STEPS.map((step, idx) => {
            const done = idx <= currentIdx;
            return (
              <div key={step.key} className="relative flex items-start gap-4 pb-6 last:pb-0">
                <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'text-white' : 'bg-gray-100 text-gray-400'}`}
                  style={done ? { backgroundColor: idx === currentIdx ? '#FF6A00' : '#10B981' } : {}}>
                  <i className={`${step.icon} text-sm`}></i>
                </div>
                <div className="flex-1 pt-1">
                  <p className={`text-sm font-poppins font-semibold ${done ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                  {done && idx === currentIdx && (
                    <p className="text-xs font-inter mt-0.5 text-[#FF6A00]">En cours</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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
