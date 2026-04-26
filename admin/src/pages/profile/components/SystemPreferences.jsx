import { useState } from 'react';
import { getSharedRate, setSharedRate, getRateHistory } from '@/lib/sharedStorage';
import { setRateWithMeta } from '@/hooks/useExchangeRate';
import { formatDateTime } from '@/components/base/DataTransformer';

const HUBS_CONFIG = [
  { code: 'LOS', name: 'Lagos', country: 'Nigeria' },
  { code: 'ABJ', name: 'Abuja', country: 'Nigeria' },
  { code: 'COT', name: 'Cotonou', country: 'Bénin' },
  { code: 'PNV', name: 'Porto-Novo', country: 'Bénin' },
];

export default function SystemPreferences() {
  const [ngnXofRate, setNgnXofRate] = useState(() => String(getSharedRate().rate));
  const [hubs, setHubs] = useState({ LOS: true, ABJ: true, COT: true, PNV: false });
  const [saved, setSaved] = useState(false);
  const [rateHistory, setRateHistory] = useState(() => getRateHistory());

  const rateNum = parseFloat(ngnXofRate);
  const rateValid = !isNaN(rateNum) && rateNum > 0;

  function handleSave() {
    if (rateValid) {
      setRateWithMeta(rateNum, 'Kolade Adeyemi');
    }
    setRateHistory(getRateHistory());
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="p-5 border-b" style={{ background: 'linear-gradient(to right, rgba(18,92,141,0.05), rgba(255,106,0,0.05))', borderColor: 'rgba(18,92,141,0.2)' }}>
          <h3 className="font-semibold text-slate-800 text-base mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Taux de change NGN / FCFA</h3>
          <p className="text-xs text-slate-500">Taux utilisé pour toutes les conversions</p>
        </div>
        <div className="p-5">
          <div className="mb-4">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">1 ₦ = X FCFA</label>
            <input
              type="number" step="0.0001" min="0" value={ngnXofRate}
              onChange={e => setNgnXofRate(e.target.value)}
              className={`w-full px-3 py-2.5 border-2 rounded-xl text-sm outline-none ${rateValid ? 'border-trustblue' : 'border-red-300'}`}
            />
            <p className="text-xs text-slate-400 italic mt-1">Ce taux sera automatiquement appliqué sur la Marketplace et le Seller Hub.</p>
            {!rateValid && ngnXofRate && <p className="text-xs text-red-500 mt-1"><i className="ri-error-warning-line mr-1" />Taux invalide</p>}
          </div>
          {rateValid && (
            <div className="animate-fade-in bg-slate-50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Aperçu des conversions</p>
              <div className="flex justify-between text-xs"><span className="text-slate-500">1 NGN</span><span className="font-semibold">{rateNum.toFixed(4)} FCFA</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-500">1 FCFA</span><span className="font-semibold">{(1 / rateNum).toFixed(2)} NGN</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-500">₦50,000</span><span className="font-semibold">FCFA {Math.round(50000 * rateNum).toLocaleString('fr-FR')}</span></div>
            </div>
          )}
        </div>
      </div>

      {/* Historique */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Historique récent</p>
        {rateHistory.length === 0 ? (
          <p className="text-xs text-slate-400">Aucune modification enregistrée.</p>
        ) : (
          <div className="bg-slate-50 rounded-lg divide-y divide-slate-100 overflow-hidden">
            {rateHistory.slice(0, 3).map((h, i) => (
              <div key={i} className="flex items-center justify-between p-3 text-xs">
                <span className="text-slate-500">{h.updated_at ? formatDateTime(h.updated_at) : '—'}</span>
                <span className="font-semibold text-slate-800">1 FCFA = {(1 / h.rate).toFixed(2)} NGN</span>
                <span className="text-slate-400 truncate max-w-[100px]">{h.updated_by}</span>
              </div>
            ))}
          </div>
        )}
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
              <button onClick={() => setHubs(prev => ({ ...prev, [hub.code]: !prev[hub.code] }))} className={`relative rounded-full cursor-pointer w-10 h-5 transition-colors ${hubs[hub.code] ? 'bg-trustblue' : 'bg-slate-200'}`}>
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${hubs[hub.code] ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {saved && (
        <div className="animate-fade-in bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-emerald-700 text-sm flex items-center gap-2">
          <i className="ri-checkbox-circle-line" />Paramètres système sauvegardés et synchronisés
        </div>
      )}
      <button onClick={handleSave} disabled={!rateValid} className={`w-full py-2.5 rounded-xl font-semibold text-sm ${rateValid ? 'bg-trustblue text-white cursor-pointer' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
        Sauvegarder les paramètres système
      </button>
    </div>
  );
}
