import { useState } from 'react';
import { formatDateTime } from '@/components/base/DataTransformer';

export default function PackageTimeline({ packages }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(packages[0] || null);

  function handleSearch(e) {
    if (e.key !== 'Enter') return;
    const match = packages.find(p => p.order_ref.toLowerCase().includes(search.toLowerCase()));
    setSelected(match || null);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Rechercher</label>
        <div className="relative mb-4">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={handleSearch} placeholder="Réf + Entrée" className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-trustblue" />
        </div>
        {!selected && search && (
          <div className="text-center py-4 mb-3">
            <p className="text-xs text-slate-400 mb-2">Aucun résultat</p>
            <button onClick={() => { setSearch(''); setSelected(packages[0] || null); }} className="text-xs text-trustblue hover:underline cursor-pointer">Réinitialiser</button>
          </div>
        )}
        <div className="space-y-2">
          {packages.map(pkg => (
            <button key={pkg.id} onClick={() => setSelected(pkg)} className={`w-full text-left p-3 rounded-xl border cursor-pointer ${selected?.id === pkg.id ? 'border-trustblue bg-blue-50' : 'border-slate-100 hover:bg-slate-50'}`}>
              <p className="text-sm font-semibold text-slate-800">{pkg.order_ref}</p>
              <p className="text-xs text-slate-500 truncate">{pkg.buyer} · {pkg.hub}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6">
        {selected ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-semibold text-slate-800 text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>{selected.order_ref}</h3>
                <p className="text-xs text-slate-500">{selected.product} · {selected.buyer}</p>
              </div>
              <span className="text-xs font-semibold px-3 py-1.5 bg-blue-50 text-trustblue rounded-full border border-blue-100">{selected.hub}</span>
            </div>
            <div className="space-y-0">
              {selected.steps.map((step, i) => (
                <div key={step.key} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${step.status === 'completed' ? 'bg-trustblue' : step.status === 'current' ? 'bg-orange-400' : 'bg-slate-100'}`}>
                      {step.status === 'completed' && <i className="ri-check-line text-white" />}
                      {step.status === 'current' && <span className="live-dot" />}
                      {step.status === 'pending' && <i className="ri-time-line text-slate-300" />}
                    </div>
                    {i < selected.steps.length - 1 && <div className={`w-0.5 h-10 my-1 ${step.status === 'completed' ? 'bg-trustblue' : 'bg-slate-100'}`} />}
                  </div>
                  <div className={`pb-2 flex-1 ${step.status === 'pending' ? 'opacity-40' : ''}`}>
                    <div className="flex items-center gap-2 mt-2">
                      <p className={`text-sm font-semibold ${step.status === 'current' ? 'text-orange-500' : step.status === 'completed' ? 'text-trustblue' : 'text-slate-400'}`}>{step.label}</p>
                      {step.status === 'current' && <span className="text-xs bg-orange-50 text-orange-500 border border-orange-100 px-2 py-0.5 rounded-full font-semibold">Position actuelle</span>}
                    </div>
                    {step.location && <p className="text-xs text-slate-500 mt-0.5"><i className="ri-map-pin-line mr-1" />{step.location}</p>}
                    {step.timestamp && <p className="text-xs text-slate-400">{formatDateTime(step.timestamp)}</p>}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full py-20 text-center">
            <div>
              <i className="ri-box-3-line text-4xl text-slate-200 block mb-2" />
              <p className="text-sm text-slate-400">Sélectionnez un colis</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
