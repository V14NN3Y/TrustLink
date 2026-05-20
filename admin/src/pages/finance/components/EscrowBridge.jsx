import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { formatXOF, formatNGN, convertNGNtoXOF } from '@/components/base/DataTransformer';

export default function EscrowBridge() {
  const { rate } = useExchangeRate();
  const { user } = useAuth();
  const [config, setConfig] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasOrders, setHasOrders] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.from('escrow_config').select('*').limit(1).single(),
      supabase.from('orders').select('id', { count: 'exact', head: true }).limit(1),
    ]).then(([configRes, ordersRes]) => {
      if (!configRes.error && configRes.data) {
        setConfig(configRes.data);
        setDraft(configRes.data);
      }
      setHasOrders((ordersRes.count || 0) > 0);
      setLoading(false);
    });
  }, []);

  async function handleSave() {
    if (!user) return;
    const { error } = await supabase
      .from('escrow_config')
      .update({ ...draft, updated_by: user.id, updated_at: new Date().toISOString() })
      .eq('id', config.id);
    if (!error) {
      setConfig(draft);
      setEditMode(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  if (loading || !config || !draft) return null;

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
          {hasOrders ? (
            <>
              <div>
                <p className="text-xs text-white/60 mb-1">XOF (Bénin)</p>
                <p className="font-bold text-white text-2xl" style={{ fontFamily: 'Poppins, sans-serif' }}>{formatXOF(convertNGNtoXOF(1000000, rate))}</p>
                <p className="text-xs text-white/60 mt-0.5">pour 1M ₦</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-orange-200 mb-1">NGN (Nigeria)</p>
                <p className="font-bold text-orange-400 text-2xl" style={{ fontFamily: 'Poppins, sans-serif' }}>{formatNGN(1000000)}</p>
              </div>
            </>
          ) : (
            <div className="col-span-2 py-4 text-center">
              <p className="text-white/60 text-sm">En attente de commandes</p>
              <p className="text-white/40 text-xs mt-1">Les volumes apparaîtront ici une fois les premières commandes traitées</p>
            </div>
          )}
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
          { label: 'Frais de livraison (FCFA)', key: 'delivery_fee' },
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
          <button onClick={() => editMode && setDraft(d => ({ ...d, auto_release: !d.auto_release }))} className={`relative rounded-full w-11 h-6 flex-shrink-0 transition-colors ${draft.auto_release ? 'bg-trustblue' : 'bg-slate-200'} ${!editMode ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${draft.auto_release ? 'translate-x-5' : 'translate-x-0'}`} />
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
