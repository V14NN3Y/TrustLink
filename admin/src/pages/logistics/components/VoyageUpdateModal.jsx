import { useState } from 'react';

const STEPS = [
  { key: 'preparing', label: 'Préparation', icon: 'ri-archive-line' },
  { key: 'in_transit', label: 'En transit', icon: 'ri-truck-line' },
  { key: 'customs', label: 'Douane', icon: 'ri-building-2-line' },
  { key: 'arrived', label: 'Arrivé', icon: 'ri-map-pin-line' },
  { key: 'completed', label: 'Complété', icon: 'ri-check-double-line' },
];

export default function VoyageUpdateModal({ voyage, onClose, onUpdate }) {
  const [newStatus, setNewStatus] = useState(voyage.status);
  const [customsAgent, setCustomsAgent] = useState(voyage.customs_agent || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const hasChanges = newStatus !== voyage.status || customsAgent !== (voyage.customs_agent || '');
  const showAgent = newStatus === 'customs' || newStatus === 'arrived';

  function handleSave() {
    if (!hasChanges) return;
    setSaving(true);
    setTimeout(() => {
      const updated = {
        ...voyage, status: newStatus,
        customs_agent: customsAgent || undefined,
        actual_arrival: (newStatus === 'arrived' || newStatus === 'completed') && !voyage.actual_arrival
          ? new Date().toISOString() : voyage.actual_arrival,
      };
      setSaving(false); setSaved(true);
      setTimeout(() => onUpdate(updated), 1200);
    }, 700);
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-lg" style={{ animation: 'fadeIn 0.18s ease' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-800 text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>Mise à jour — {voyage.voyage_id}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-50 cursor-pointer">
            <i className="ri-close-line text-slate-500 text-xl" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 block">Nouveau statut</label>
            <div className="grid grid-cols-5 gap-2">
              {STEPS.map((step, i) => {
                const currentIdx = STEPS.findIndex(s => s.key === newStatus);
                const isPast = i < currentIdx;
                const isSelected = step.key === newStatus;
                return (
                  <button key={step.key} onClick={() => setNewStatus(step.key)} className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 cursor-pointer ${isSelected ? 'border-trustblue bg-trustblue text-white' : isPast ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-slate-50 text-slate-500'}`}>
                    <i className={`${step.icon} text-lg`} />
                    <span className="text-xs font-medium leading-tight text-center">{step.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {showAgent && (
            <div className="animate-fade-in">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Agent douane</label>
              <input value={customsAgent} onChange={e => setCustomsAgent(e.target.value)} placeholder="Nom de l'agent douanier" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-trustblue" />
            </div>
          )}
          {saved && (
            <div className="animate-fade-in bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-emerald-700 text-sm flex items-center gap-2">
              <i className="ri-checkbox-circle-line" />Voyage mis à jour avec succès
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm cursor-pointer">Annuler</button>
            <button onClick={handleSave} disabled={!hasChanges || saving || saved} className={`flex-1 py-2.5 rounded-xl font-semibold text-sm ${hasChanges && !saving && !saved ? 'bg-trustblue text-white cursor-pointer' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
              {saving ? 'Sauvegarde…' : saved ? 'Mis à jour !' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
