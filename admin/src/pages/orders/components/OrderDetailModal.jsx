import { useState } from 'react';
import { JOURNEY_STEPS } from '@/mocks/orders';
import StatusBadge from '@/components/base/StatusBadge';
import { formatXOF, formatNGN, formatDate } from '@/components/base/DataTransformer';

const ALL_STATUSES = ['PENDING', 'FUNDED', 'IN_TRANSIT', 'CUSTOMS', 'DELIVERED', 'DISPUTED'];

export default function OrderDetailModal({ order, onClose, onUpdate }) {
  const [tab, setTab] = useState('info');
  const [editStep, setEditStep] = useState(order.journey_step);
  const [editStatus, setEditStatus] = useState(order.status);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [disputePhase, setDisputePhase] = useState(null);
  const [disputeAction, setDisputeAction] = useState(null);

  const hasChanges = editStep !== order.journey_step || editStatus !== order.status;

  function handleSave() {
    setSaving(true);
    setTimeout(() => {
      onUpdate({ ...order, journey_step: editStep, status: editStatus });
      setSaving(false); setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 600);
  }

  function handleDisputeConfirm() {
    onUpdate({ ...order, status: 'DELIVERED' });
    setDisputePhase('done');
    setTimeout(() => onClose(), 1500);
  }

  const tabs = [
    { key: 'info', label: 'Informations', icon: 'ri-information-line' },
    { key: 'journey', label: 'Parcours', icon: 'ri-map-pin-time-line' },
    ...(order.status === 'DISPUTED' ? [{ key: 'dispute', label: 'Vidéo litige', icon: 'ri-video-line' }] : []),
  ];

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col" style={{ animation: 'fadeIn 0.18s ease' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="font-bold text-slate-800 text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>{order.ref}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{order.product}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={order.status} size="md" />
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-50 cursor-pointer">
              <i className="ri-close-line text-slate-500 text-xl" />
            </button>
          </div>
        </div>

        <div className="flex gap-1 px-6 pt-4 flex-shrink-0">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer ${tab === t.key ? 'bg-trustblue text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
              <i className={t.icon} />{t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {tab === 'info' && (
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Acheteur', value: order.buyer_name },
                { label: 'Vendeur', value: `${order.seller_name} (${order.seller_id})` },
                { label: 'Hub origine', value: order.hub_origin },
                { label: 'Voyage', value: order.voyage_id || '—' },
                { label: 'Montant XOF', value: formatXOF(order.amount_xof) },
                { label: 'Montant NGN', value: formatNGN(order.amount_ngn) },
                { label: 'Créé le', value: formatDate(order.created_at) },
                { label: 'Étape', value: order.journey_step },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">{f.label}</label>
                  <p className="text-sm text-slate-700 px-3 py-2.5 bg-slate-50 rounded-xl">{f.value}</p>
                </div>
              ))}
              {order.dispute_reason && (
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Motif du litige</label>
                  <p className="text-sm text-slate-700 px-3 py-2.5 bg-red-50 rounded-xl border border-red-100">{order.dispute_reason}</p>
                </div>
              )}
            </div>
          )}

          {tab === 'journey' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Étape du parcours</label>
                <select value={editStep} onChange={e => setEditStep(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-trustblue cursor-pointer bg-white">
                  {JOURNEY_STEPS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Statut</label>
                <select value={editStatus} onChange={e => setEditStatus(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-trustblue cursor-pointer bg-white">
                  {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-0">
                {JOURNEY_STEPS.map((step, i) => {
                  const idx = JOURNEY_STEPS.findIndex(s => s.key === editStep);
                  const isCompleted = i < idx; const isCurrent = i === idx;
                  return (
                    <div key={step.key} className="flex items-start gap-3 cursor-pointer" onClick={() => setEditStep(step.key)}>
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isCompleted ? 'bg-trustblue' : isCurrent ? 'bg-orange-400' : 'bg-slate-100'}`}>
                          {isCompleted ? <i className="ri-check-line text-white text-sm" /> : isCurrent ? <span className="live-dot" /> : <i className="ri-time-line text-slate-400 text-sm" />}
                        </div>
                        {i < JOURNEY_STEPS.length - 1 && <div className={`w-0.5 h-6 my-1 ${isCompleted ? 'bg-trustblue' : 'bg-slate-100'}`} />}
                      </div>
                      <div className={`pb-6 ${isCurrent ? 'font-semibold text-orange-500' : isCompleted ? 'text-trustblue' : 'text-slate-400 opacity-40'}`}>
                        <p className="text-sm mt-1.5">{step.label}</p>
                        {isCurrent && <span className="text-xs bg-orange-50 text-orange-500 border border-orange-100 px-2 py-0.5 rounded-full">Position actuelle</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
              {saved && (
                <div className="animate-fade-in bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-emerald-700 text-sm flex items-center gap-2">
                  <i className="ri-checkbox-circle-line" />Modifications sauvegardées
                </div>
              )}
              {hasChanges && (
                <button onClick={handleSave} disabled={saving} className="w-full py-2.5 bg-trustblue text-white rounded-xl font-semibold text-sm cursor-pointer disabled:opacity-50">
                  {saving ? 'Sauvegarde…' : 'Sauvegarder les modifications'}
                </button>
              )}
            </div>
          )}

          {tab === 'dispute' && order.status === 'DISPUTED' && (
            <div className="space-y-4">
              {order.dispute_video_url && (
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Vidéo de preuve</label>
                  <div className="relative rounded-xl overflow-hidden border border-slate-100">
                    <video src={order.dispute_video_url} controls className="w-full rounded-xl" />
                    <span className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
                      <i className="ri-shield-check-line" />In-app · Certifiée
                    </span>
                  </div>
                </div>
              )}
              {disputePhase === null && (
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => { setDisputeAction('refund'); setDisputePhase('confirming'); }} className="py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl font-semibold text-sm cursor-pointer flex items-center justify-center gap-2">
                    <i className="ri-refund-2-line" />Rembourser acheteur
                  </button>
                  <button onClick={() => { setDisputeAction('force_pay'); setDisputePhase('confirming'); }} className="py-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl font-semibold text-sm cursor-pointer flex items-center justify-center gap-2">
                    <i className="ri-bank-card-line" />Paiement forcé vendeur
                  </button>
                </div>
              )}
              {disputePhase === 'confirming' && (
                <div className="animate-fade-in bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="font-semibold text-amber-700 mb-3">Confirmer : {disputeAction === 'refund' ? 'Remboursement total acheteur' : 'Paiement forcé au vendeur'} ?</p>
                  <div className="flex gap-3">
                    <button onClick={handleDisputeConfirm} className="px-6 py-2 bg-amber-600 text-white rounded-xl font-semibold text-sm cursor-pointer">Confirmer</button>
                    <button onClick={() => { setDisputePhase(null); setDisputeAction(null); }} className="px-6 py-2 border border-amber-300 text-amber-700 rounded-xl font-semibold text-sm cursor-pointer">Annuler</button>
                  </div>
                </div>
              )}
              {disputePhase === 'done' && (
                <div className="animate-fade-in bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-emerald-700 text-sm flex items-center gap-2">
                  <i className="ri-checkbox-circle-line text-lg" />Résolution appliquée avec succès
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
