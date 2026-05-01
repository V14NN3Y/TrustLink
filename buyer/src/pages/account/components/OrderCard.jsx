import { useState } from 'react';
import { formatPrice } from '@/utils/format';

const STATUS_CONFIG = {
  all:        { label: 'Toutes',        color: '#111827', bg: '#F8FAFC' },
  pending:    { label: 'En attente',    color: '#B45309', bg: '#FEF3C7' },
  paid:       { label: 'Payée',         color: '#2563EB', bg: '#EFF6FF' },
  processing: { label: 'En cours de traitement', color: '#125C8D', bg: '#E1F0F9' },
  in_transit: { label: 'En cours de livraison',  color: '#7C3AED', bg: '#F5F3FF' },
  delivered:  { label: 'Livrée',        color: '#15803D', bg: '#DCFCE7' },
  confirmed:  { label: 'Confirmée',     color: '#15803D', bg: '#DCFCE7' },
  disputed:   { label: 'Litige',        color: '#DC2626', bg: '#FEE2E2' },
  cancelled:  { label: 'Annulée',       color: '#6B7280', bg: '#F1F5F9' },
  refunded:   { label: 'Remboursée',    color: '#0891B2', bg: '#ECFEFF' },
};

export default function OrderCard({ order }) {
  const [confirmed, setConfirmed] = useState(false);
  const config = STATUS_CONFIG[order.status];
  const maxImages = order.items.slice(0, 3);
  const extra = order.items.length - 3;

  const date = new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <article className="bg-white border border-gray-100 rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-poppins font-bold" style={{ color: '#111827' }}>{order.id}</p>
          <p className="text-xs font-inter mt-0.5" style={{ color: '#6B7280' }}>{date}</p>
        </div>
        <span className="text-xs font-poppins font-bold px-3 py-1 rounded-full" style={{ backgroundColor: config.bg, color: config.color }}>
          {config.label}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        {maxImages.map((item, i) => (
          <div key={i} className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0" style={{ backgroundColor: '#F8FAFC' }}>
            <img src={item.image} alt={item.name} className="w-full h-full object-cover object-top" />
          </div>
        ))}
        {extra > 0 && (
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-100 text-xs font-poppins font-semibold" style={{ color: '#6B7280' }}>
            +{extra}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div>
          {order.trackingNumber && (
            <p className="text-xs font-inter" style={{ color: '#6B7280' }}>
              Suivi : <span className="font-medium" style={{ color: '#125C8D' }}>{order.trackingNumber}</span>
            </p>
          )}
          <p className="text-sm font-poppins font-bold mt-0.5" style={{ color: '#125C8D' }}>{formatPrice(order.total)}</p>
        </div>
        {(order.status === 'in_transit' || order.status === 'delivered') && !confirmed && (
          <button
            onClick={() => setConfirmed(true)}
            className="text-sm font-poppins font-medium px-4 py-2 rounded-full transition-all"
            style={{ backgroundColor: '#E1F0F9', color: '#125C8D' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#125C8D'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#E1F0F9'; e.currentTarget.style.color = '#125C8D'; }}
          >
            Confirmer réception
          </button>
        )}
        {confirmed && (
          <span className="text-xs font-poppins font-bold px-3 py-1.5 rounded-full" style={{ backgroundColor: '#DCFCE7', color: '#15803D' }}>
            ✓ Réception confirmée !
          </span>
        )}
      </div>
    </article>
  );
}
