import { useState } from 'react';

const HUBS_RECEPTION = [
  'Lagos — Ikeja',
  'Lagos — Apapa',
  'Abuja — Wuse',
  'Abuja — Garki',
];

export default function ManifestBuilder({ packages }) {
  const [hub, setHub] = useState('Lagos');
  const [selected, setSelected] = useState([]);
  const [generated, setGenerated] = useState(false);

  // Reception form state
  const [receptionHub, setReceptionHub] = useState(HUBS_RECEPTION[0]);
  const [ref, setRef] = useState('');
  const [agent, setAgent] = useState('');
  const [notes, setNotes] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const hubPkgs = packages.filter(p => p.hub === hub);
  const allSelected = hubPkgs.length > 0 && hubPkgs.every(p => selected.includes(p.id));

  function toggleAll() {
    setAllSelected(!allSelected);
  }

  function setAllSelected(val) {
    setSelected(val ? hubPkgs.map(p => p.id) : []);
  }

  function togglePkg(id) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function handleGenerate() {
    if (selected.length === 0) return;
    setGenerated(true);
    setTimeout(() => setGenerated(false), 3000);
    setSelected([]);
  }

  function handleConfirmReception() {
    setConfirmed(true);
    setTimeout(() => {
      setConfirmed(false);
      setRef('');
      setAgent('');
      setNotes('');
    }, 2500);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* LEFT — Manifest */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Manifeste d'Expédition
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Regrouper des commandes en un voyage</p>
        </div>

        <div className="p-5">
          {/* Hub selector */}
          <div className="flex gap-2 mb-4">
            {['Lagos', 'Abuja'].map(h => (
              <button
                key={h}
                onClick={() => { setHub(h); setSelected([]); }}
                className={`px-5 py-2 rounded-xl text-sm font-semibold cursor-pointer border transition-all ${
                  hub === h ? 'bg-trustblue text-white border-trustblue' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {h}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-slate-400">{selected.length} sélectionné{selected.length > 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Select all row */}
          <div
            onClick={() => setAllSelected(!allSelected)}
            className="flex items-center gap-3 py-2.5 px-1 mb-1 cursor-pointer hover:bg-slate-50 rounded-xl"
          >
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${allSelected ? 'bg-trustblue border-trustblue' : 'border-slate-300'}`}>
              {allSelected && <i className="ri-check-line text-white text-xs" />}
              {!allSelected && selected.length > 0 && <span className="w-2 h-2 bg-slate-400 rounded-sm" />}
            </div>
            <span className="text-sm text-slate-600 font-medium">Tout sélectionner ({hubPkgs.length} colis)</span>
          </div>

          {/* Package list */}
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {hubPkgs.length === 0 ? (
              <div className="py-10 text-center">
                <i className="ri-box-3-line text-3xl text-slate-200 block mb-2" />
                <p className="text-sm text-slate-400">Aucun colis pour {hub}</p>
              </div>
            ) : hubPkgs.map(pkg => {
              const isSel = selected.includes(pkg.id);
              return (
                <div
                  key={pkg.id}
                  onClick={() => togglePkg(pkg.id)}
                  className={`flex items-center gap-3 px-2 py-3 rounded-xl cursor-pointer border transition-all ${
                    isSel ? 'border-slate-100 bg-blue-50/40' : 'border-transparent hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${isSel ? 'bg-trustblue border-trustblue' : 'border-slate-300'}`}>
                    {isSel && <i className="ri-check-line text-white text-xs" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800">{pkg.product}</p>
                    <p className="text-xs text-slate-400">{pkg.order_ref} — {pkg.buyer}</p>
                  </div>
                  <span className="text-xs text-slate-500 flex-shrink-0">{pkg.weight_kg}kg</span>
                </div>
              );
            })}
          </div>

          {/* Generate button */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            {generated && (
              <div className="animate-fade-in bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-emerald-700 text-sm flex items-center gap-2 mb-3">
                <i className="ri-checkbox-circle-line" />Voyage généré avec succès !
              </div>
            )}
            <button
              onClick={handleGenerate}
              disabled={selected.length === 0}
              className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all border ${
                selected.length > 0
                  ? 'border-trustblue text-trustblue hover:bg-blue-50 cursor-pointer'
                  : 'border-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <i className="ri-route-line" />
              Générer le Voyage ({selected.length} colis)
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT — Reception form */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Saisie Hub — Arrivée colis
          </h3>
        </div>

        <div className="p-5 space-y-5">
          {/* Hub de réception */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Hub de réception</label>
            <div className="relative">
              <select
                value={receptionHub}
                onChange={e => setReceptionHub(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-trustblue bg-white appearance-none cursor-pointer pr-10"
              >
                {HUBS_RECEPTION.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
              <i className="ri-arrow-down-s-line absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Référence commande */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Référence commande</label>
            <div className="flex gap-2">
              <input
                value={ref}
                onChange={e => setRef(e.target.value)}
                placeholder="TL-2024-XXX ou scanner..."
                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-trustblue"
              />
              <button className="w-12 h-12 border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-50 cursor-pointer flex-shrink-0">
                <i className="ri-qr-scan-line text-slate-500 text-lg" />
              </button>
            </div>
          </div>

          {/* Agent réceptionnaire */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Agent réceptionnaire</label>
            <input
              value={agent}
              onChange={e => setAgent(e.target.value)}
              placeholder="Nom de l'agent..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-trustblue"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Observations sur l'état du colis..."
              rows={3}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:border-trustblue resize-none"
            />
          </div>

          {confirmed && (
            <div className="animate-fade-in bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-emerald-700 text-sm flex items-center gap-2">
              <i className="ri-checkbox-circle-line" />Réception confirmée avec succès !
            </div>
          )}

          <button
            onClick={handleConfirmReception}
            className="w-full py-3.5 bg-trustblue text-white rounded-xl font-semibold text-sm cursor-pointer flex items-center justify-center gap-2 hover:bg-trustblue-600 transition-colors"
          >
            <i className="ri-checkbox-circle-line" />
            Confirmer la réception
          </button>
        </div>
      </div>
    </div>
  );
}
