import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { StorageManager } from '@/lib/storage';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { formatXOF, formatNGN } from '@/components/base/DataTransformer';

const HUBS_CONFIG = [
  { code: 'LOS', name: 'Lagos', country: 'Nigeria' },
  { code: 'ABJ', name: 'Abuja', country: 'Nigeria' },
  { code: 'COT', name: 'Cotonou', country: 'Bénin' },
  { code: 'PNV', name: 'Porto-Novo', country: 'Bénin' },
];

export default function SystemPreferences() {
  const { user } = useAuth();
  const { rate, setRate } = useExchangeRate();
  const [ngnXofRate, setNgnXofRate] = useState(String(rate));
  const [hubs, setHubs] = useState({ LOS: true, ABJ: true, COT: true, PNV: false });
  const [saved, setSaved] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const rateNum = parseFloat(ngnXofRate);
  const rateValid = !isNaN(rateNum) && rateNum > 0;

  async function handleSave() {
    if (rateValid) {
      setRate(rateNum);
      // Persister dans Supabase
      await supabase
        .from('exchange_rates')
        .update({ rate: rateNum, updated_by: user.id, updated_at: new Date().toISOString() })
        .eq('from_currency', 'NGN')
        .eq('to_currency', 'XOF');
    }
    setSaved(true); setTimeout(() => setSaved(false), 3000);
  }

  function handleReset() {
    StorageManager.reset();
  }

  return (
    <div className="space-y-4 pb-10">
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="p-5 border-b" style={{ background: 'linear-gradient(to right, rgba(18,92,141,0.05), rgba(255,106,0,0.05))', borderColor: 'rgba(18,92,141,0.2)' }}>
          <h3 className="font-semibold text-slate-800 text-base mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Taux de change NGN / XOF</h3>
          <p className="text-xs text-slate-500">Taux utilisé pour toutes les conversions</p>
        </div>
        <div className="p-5">
          <div className="mb-4">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">1 ₦ = X FCFA</label>
            <input type="number" step="0.001" min="0" value={ngnXofRate} onChange={e => setNgnXofRate(e.target.value)} className={`w-full px-3 py-2.5 border-2 rounded-xl text-sm outline-none transition-all ${rateValid ? 'border-slate-100 focus:border-trustblue' : 'border-red-300'}`} />
            {!rateValid && ngnXofRate && <p className="text-xs text-red-500 mt-1"><i className="ri-error-warning-line mr-1" />Taux invalide</p>}
          </div>
          {rateValid && (
            <div className="animate-fade-in bg-slate-50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Aperçu des conversions</p>
              <div className="flex justify-between text-xs"><span className="text-slate-500">100 ₦</span><span className="font-semibold">{formatXOF(Math.round(100 * rateNum))}</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-500">10 000 FCFA</span><span className="font-semibold">{formatNGN(Math.round(10000 / rateNum))}</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-500">1 000 000 ₦</span><span className="font-semibold">{formatXOF(Math.round(1000000 * rateNum))}</span></div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <h3 className="font-semibold text-slate-800 text-base mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Hubs actifs</h3>
        <div className="space-y-3">
          {HUBS_CONFIG.map(hub => (
            <div key={hub.code} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                  <i className="ri-map-pin-line text-trustblue text-sm" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{hub.name}</p>
                  <p className="text-xs text-slate-500">{hub.country} · {hub.code}</p>
                </div>
              </div>
              <button
                onClick={() => setHubs(prev => ({ ...prev, [hub.code]: !prev[hub.code] }))}
                className={`relative rounded-full cursor-pointer w-10 h-5 transition-colors ${hubs[hub.code] ? 'bg-trustblue' : 'bg-slate-200'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${hubs[hub.code] ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {saved && (
        <div className="animate-fade-in bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-emerald-700 text-sm flex items-center gap-2">
          <i className="ri-checkbox-circle-line" />Paramètres système sauvegardés
        </div>
      )}
      <button
        onClick={handleSave}
        disabled={!rateValid}
        className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${rateValid ? 'bg-trustblue text-white cursor-pointer shadow-md hover:shadow-lg active:scale-[0.98]' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
      >
        Sauvegarder les paramètres système
      </button>

      {/* ZONE DE DANGER - DEV ONLY */}
      <div className="mt-12 pt-8 border-t border-slate-100">
        <div className="bg-red-50/50 border border-red-100 rounded-2xl p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <i className="ri-error-warning-fill text-red-600 text-xl" />
            </div>
            <div>
              <h4 className="font-bold text-red-800 text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>Zone de maintenance (Dev Only)</h4>
              <p className="text-sm text-red-600/80 leading-relaxed mt-1">
                La réinitialisation supprimera toutes les données stockées dans votre navigateur (taux, commandes modifiées, produits approuvés) et rechargera les données de test initiales.
              </p>
            </div>
          </div>

          {!showConfirmReset ? (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="w-full py-3 border-2 border-red-200 text-red-600 rounded-xl font-bold text-sm hover:bg-red-50 transition-colors cursor-pointer"
            >
              Réinitialiser toutes les données
            </button>
          ) : (
            <div className="flex gap-3 animate-fade-in">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-200 cursor-pointer active:scale-95 transition-all"
              >
                CONFIRMER LA SUPPRESSION
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
