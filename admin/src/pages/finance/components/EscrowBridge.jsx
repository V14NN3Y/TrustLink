import { useState } from 'react';
import { ESCROW_CONFIG } from '@/mocks/finance';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { formatXOF, formatNGN, convertNGNtoXOF } from '@/components/base/DataTransformer';

export default function EscrowBridge({ config, onSave }) {
  const { rate } = useExchangeRate();
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState(config);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    onSave(draft); setEditMode(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div style={{ background: 'linear-gradient(135deg, #125C8D, #0A3857)' }} className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>Pont Escrow</h3>
          <button onClick={() => setEditMode(v => !v)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${editMode ? 'bg-white text-trustblue' : 'bg-white/20 text-white'}`}>
            {editMode ? 'Annuler' : <><i className="ri-edit-line mr-1" />Modifier</>}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-white/60 mb-1">XOF (Bénin)</p>
            <p className="font-bold text-white text-2xl" style={{ fontFamily: 'Poppins, sans-serif' }}>{formatXOF(convertNGNtoXOF(1000000, rate))}</p>
            <p className="text-xs text-white/60 mt-0.5">pour 1M ₦</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-orange-200 mb-1">NGN (Nigeria)</p>
            <p className="font-bold text-orange-400 text-2xl" style={{ fontFamily: 'Poppins, sans-serif' }}>{formatNGN(1000000)}</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-center gap-2">
          <span className="live-dot" />
          <span className="text-xs text-white/80">Taux live : 1 ₦ = {rate.toFixed(4)} FCFA</span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {[
          { label: 'Commission spread (%)', key: 'spread_pct' },
          { label: 'Montant minimum (XOF)', key: 'min_amount_xof' },
          { label: 'Délai libération (heures)', key: 'release_delay_hours' },
        ].map(field => (
          <div key={field.key}>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">{field.label}</label>
            {editMode
              ? <input type="number" value={String(draft[field.key])} onChange={e => setDraft(d => ({ ...d, [field.key]: parseFloat(e.target.value) || 0 }))} className="w-full px-3 py-2.5 border-2 border-trustblue rounded-xl text-sm outline-none" />
              : <p className="text-sm text-slate-700 px-3 py-2.5 bg-slate-50 rounded-xl">{String(config[field.key])}</p>
            }
          </div>
        ))}

        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Libération automatique</label>
          <button onClick={() => editMode && setDraft(d => ({ ...d, auto_release: !d.auto_release }))} className={`relative rounded-full w-11 h-6 transition-colors ${draft.auto_release ? 'bg-trustblue' : 'bg-slate-200'} ${!editMode ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${draft.auto_release ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>

        {saved && (
          <div className="animate-fade-in bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-emerald-700 text-sm flex items-center gap-2">
            <i className="ri-checkbox-circle-line" />Configuration sauvegardée
          </div>
        )}
        {editMode && (
          <button onClick={handleSave} className="w-full py-2.5 bg-trustblue text-white rounded-xl font-semibold text-sm cursor-pointer">
            Sauvegarder la configuration
          </button>
        )}
      </div>
    </div>
  );
}
