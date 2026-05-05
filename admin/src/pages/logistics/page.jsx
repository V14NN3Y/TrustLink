import { useState, useEffect } from 'react';
import { useSupabaseLogistics } from '@/hooks/useSupabaseLogistics';
import VoyageCard from './components/VoyageCard';
import ManifestBuilder from './components/ManifestBuilder';
import PackageTimeline from './components/PackageTimeline';
import VoyageUpdateModal from './components/VoyageUpdateModal';
const TABS = [
  { key: 'voyages', label: 'Voyages actifs', icon: 'ri-truck-2-line' },
  { key: 'manifest', label: 'Manifeste', icon: 'ri-file-list-3-line' },
  { key: 'suivi', label: 'Timeline colis', icon: 'ri-git-branch-line' },
];
export default function LogisticsPage() {
  const [tab, setTab] = useState('voyages');
  const { dispatches, orders, packages, loading } = useSupabaseLogistics();
  const [voyages, setVoyages] = useState([]);
  const [selectedVoyage, setSelectedVoyage] = useState(null);
  const [editVoyage, setEditVoyage] = useState(null);
  // Sync avec Supabase quand les données arrivent
  useEffect(() => {
    if (dispatches.length > 0) setVoyages(dispatches);
  }, [dispatches]);
  // Normalise les dispatches Supabase au format attendu par VoyageCard
  const normalizedVoyages = dispatches.length > 0 ? dispatches.map(d => ({
    id: d.id,
    voyage_id: d.dispatch_code,
    status: d.status?.toUpperCase() || 'PREPARING',
    hub_origin: d.origin_hub,
    orders_count: d.orders_count || 0,
    total_value_xof: d.total_value || 0,
    departure_date: d.departure_date,
    estimated_arrival: d.estimated_arrival,
    actual_arrival: d.actual_arrival,
    driver_name: d.driver_name || '—',
    truck_plate: d.truck_plate || '—',
    customs_agent: d.customs_agent,
  })) : [];
  function handleVoyageUpdate(updated) {
    setVoyages(prev => prev.map(v => v.id === updated.id ? updated : v));
    setSelectedVoyage(updated);
    setEditVoyage(null);
  }
  const displayVoyages = normalizedVoyages.length > 0 ? normalizedVoyages : voyages;
  return (
    <>
      <div className="space-y-5">
        <div>
          <h1 className="font-bold text-slate-800 text-2xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Tour de Contrôle Logistique
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Hub Lagos / Abuja → Cotonou</p>
        </div>
        <div className="flex gap-2">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all border ${tab === t.key
                ? 'bg-trustblue text-white border-trustblue shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
            >
              <i className={t.icon} />
              {t.label}
            </button>
          ))}
        </div>
        {tab === 'voyages' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-3">
              {loading ? (
                <div className="py-10 text-center text-sm text-slate-400">Chargement...</div>
              ) : displayVoyages.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-400">Aucun voyage trouvé</div>
              ) : displayVoyages.map(v => (
                <VoyageCard
                  key={v.id}
                  voyage={v}
                  selected={selectedVoyage?.id === v.id}
                  onClick={() => setSelectedVoyage(v)}
                  onEdit={() => setEditVoyage(v)}
                />
              ))}
            </div>
            <div className="lg:col-span-2">
              {selectedVoyage ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-800 text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {selectedVoyage.voyage_id} — Détails
                    </h3>
                    <button
                      onClick={() => setEditVoyage(selectedVoyage)}
                      className="flex items-center gap-2 px-4 py-2 bg-trustblue text-white rounded-xl text-sm font-semibold cursor-pointer"
                    >
                      <i className="ri-edit-line" />Mettre à jour
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Chauffeur', value: selectedVoyage.driver_name },
                      { label: 'Plaque', value: selectedVoyage.truck_plate },
                      { label: 'Hub origine', value: selectedVoyage.hub_origin },
                      { label: 'Commandes', value: String(selectedVoyage.orders_count) },
                      { label: 'Valeur totale', value: `${((selectedVoyage.total_value_xof || 0) / 1_000_000).toFixed(2)}M XOF` },
                      { label: 'Départ', value: selectedVoyage.departure_date ? new Date(selectedVoyage.departure_date).toLocaleDateString('fr-FR') : '—' },
                      { label: 'Arrivée estimée', value: selectedVoyage.estimated_arrival ? new Date(selectedVoyage.estimated_arrival).toLocaleDateString('fr-FR') : '—' },
                      { label: 'Agent douane', value: selectedVoyage.customs_agent || '—' },
                    ].map(f => (
                      <div key={f.label}>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">{f.label}</label>
                        <p className="text-sm text-slate-700 px-3 py-2.5 bg-slate-50 rounded-xl">{f.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-100 h-64 flex items-center justify-center">
                  <div className="text-center">
                    <i className="ri-truck-line text-4xl text-slate-200 block mb-2" />
                    <p className="text-sm text-slate-400">Sélectionnez un voyage</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {tab === 'manifest' && <ManifestBuilder packages={packages} />}
        {tab === 'suivi' && <PackageTimeline packages={packages} />}
      </div>
      {editVoyage && (
        <VoyageUpdateModal
          voyage={editVoyage}
          onClose={() => setEditVoyage(null)}
          onUpdate={handleVoyageUpdate}
        />
      )}
    </>
  );
}
