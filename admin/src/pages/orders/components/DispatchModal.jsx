import { useState } from 'react';
import { dispatchOrderToSeller, setSharedOrders, getSharedOrders } from '@/lib/sharedStorage';
import { formatXOF, formatNGN } from '@/components/base/DataTransformer';

export default function DispatchModal({ order, selectedSeller, instructions, onConfirm, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function handleConfirm() {
    setLoading(true);
    setTimeout(() => {
      dispatchOrderToSeller(order.ref || order.id, {
        order_id: order.ref || order.id,
        seller_id: selectedSeller.id,
        seller_name: selectedSeller.name,
        dispatched_at: new Date().toISOString(),
        dispatched_by: 'Kolade Adeyemi',
        instructions: instructions || undefined,
      });
      // Also update in shared orders if exists
      const shared = getSharedOrders();
      if (shared.find(o => o.id === (order.ref || order.id))) {
        setSharedOrders(shared.map(o =>
          o.id === (order.ref || order.id)
            ? { ...o, status: 'dispatched_to_seller', updated_at: new Date().toISOString() }
            : o
        ));
      }
      setDone(true);
      setTimeout(() => onConfirm(), 600);
    }, 600);
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4" onClick={onCancel}>
      <div className="bg-white rounded-2xl w-full max-w-md p-6" style={{ animation: 'fadeIn 0.18s ease' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: 'rgba(18,92,141,0.1)' }}>
            <i className="ri-send-plane-line text-lg" style={{ color: '#125C8D' }} />
          </div>
          <h3 className="font-semibold text-slate-800 text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>Confirmer le dispatch</h3>
          <p className="text-xs text-slate-400 mt-0.5">Cette action notifiera le vendeur immédiatement.</p>
        </div>

        {/* Récap */}
        <div className="bg-slate-50 rounded-xl p-4 space-y-2.5 mb-5">
          {[
            { label: 'Commande', value: order.ref || order.id, mono: true },
            { label: 'Produit', value: order.product || order.product_name },
            { label: 'Montant', value: `${formatXOF(order.amount_xof)} · ${formatNGN(order.amount_ngn)}` },
          ].map(f => (
            <div key={f.label} className="flex justify-between text-xs">
              <span className="text-slate-500 font-medium">{f.label}</span>
              <span className={`font-semibold ${f.mono ? 'font-mono text-[#125C8D]' : 'text-slate-800'}`}>{f.value}</span>
            </div>
          ))}
          <div className="flex justify-between text-xs">
            <span className="text-slate-500 font-medium">Vendeur assigné</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1">
              <i className="ri-store-2-line text-xs" />{selectedSeller.name}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-500 font-medium">Hub</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1">
              <i className="ri-map-pin-line text-xs" />{selectedSeller.hub}
            </span>
          </div>
          {instructions && (
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 font-medium">Instructions</span>
              <span className="italic text-slate-500 max-w-[180px] text-right">{instructions}</span>
            </div>
          )}
        </div>

        {done && (
          <div className="animate-fade-in bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-emerald-700 text-xs flex items-center gap-2 mb-4">
            <i className="ri-checkbox-circle-line" />Dispatch confirmé !
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer" style={{ backgroundColor: '#F1F5F9', color: '#475569' }}>
            Annuler
          </button>
          <button onClick={handleConfirm} disabled={loading || done} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer disabled:opacity-60" style={{ backgroundColor: '#125C8D' }}>
            {loading && !done ? <i className="ri-loader-4-line animate-spin" /> : <i className="ri-send-plane-line" />}
            Confirmer le dispatch
          </button>
        </div>
      </div>
    </div>
  );
}
