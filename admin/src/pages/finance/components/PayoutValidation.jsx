import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import StatusBadge from '@/components/base/StatusBadge';
import { formatNGN, formatXOF, formatDate } from '@/components/base/DataTransformer';

// Mapping UI status -> DB enum
const STATUS_TO_DB = {
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PAID: 'paid',
};

export default function PayoutValidation({ payouts, onRefresh }) {
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);

  async function handleAction(payout, uiStatus) {
    setUpdating(true);
    const dbStatus = STATUS_TO_DB[uiStatus];
    const { error } = await supabase
      .from('payouts')
      .update({
        status: dbStatus,
        resolved_at: new Date().toISOString(),
        resolved_by: (await supabase.auth.getUser()).data.user?.id,
      })
      .eq('id', payout.id);
    setUpdating(false);
    if (error) {
      console.error('Erreur mise à jour payout:', error);
      alert('Erreur lors de la mise à jour');
    } else {
      setSelected(null);
      onRefresh?.();
    }
  }

  function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-800 text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>Validation Payouts</h3>
        <p className="text-xs text-slate-500 mt-0.5">{payouts.filter(p => p.status === 'PENDING_REVIEW').length} en attente</p>
      </div>
      <div className="divide-y divide-slate-50">
        {payouts.map(payout => {
          const isOpen = selected === payout.id;
          return (
            <div key={payout.id}>
              <div onClick={() => setSelected(isOpen ? null : payout.id)} className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50 cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-trustblue text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>{getInitials(payout.seller_name)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{payout.seller_name}</p>
                  <p className="text-xs text-slate-500">{payout.seller_id} · {formatDate(payout.requested_at)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-sm text-slate-800 mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>{formatNGN(payout.amount_ngn)}</p>
                  <StatusBadge status={payout.status} />
                </div>
                <i className={`ri-arrow-${isOpen ? 'up' : 'down'}-s-line text-slate-400 flex-shrink-0`} />
              </div>
              {isOpen && (
                <div className="px-5 pb-4 animate-fade-in">
                  <div className="bg-slate-50 rounded-xl p-4 space-y-2 mb-4">
                    {[
                      { label: 'Montant XOF', value: formatXOF(payout.amount_xof) },
                      { label: 'ID Payout', value: payout.id.slice(0, 8) },
                    ].map(f => (
                      <div key={f.label} className="flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">{f.label}</span>
                        <span className="text-slate-800 font-semibold">{f.value}</span>
                      </div>
                    ))}
                  </div>
                  {payout.status === 'PENDING_REVIEW' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleAction(payout, 'APPROVED')}
                        disabled={updating}
                        className="py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl font-semibold text-xs cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <i className="ri-checkbox-circle-line" />Approuver
                      </button>
                      <button
                        onClick={() => handleAction(payout, 'REJECTED')}
                        disabled={updating}
                        className="py-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl font-semibold text-xs cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <i className="ri-close-circle-line" />Rejeter
                      </button>
                    </div>
                  )}
                  {payout.status === 'APPROVED' && (
                    <button
                      onClick={() => handleAction(payout, 'PAID')}
                      disabled={updating}
                      className="w-full py-2.5 bg-trustblue text-white rounded-xl font-semibold text-xs cursor-pointer disabled:opacity-50"
                    >
                      <i className="ri-bank-card-line mr-1.5" />Marquer comme payé
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
