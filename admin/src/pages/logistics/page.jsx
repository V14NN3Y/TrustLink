import { useState } from 'react';
import { VOYAGES, PACKAGES } from '@/mocks/logistics';
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
  const [voyages, setVoyages] = useState(VOYAGES);
  const [selectedVoyage, setSelectedVoyage] = useState(null);
  const [editVoyage, setEditVoyage] = useState(null);

  function handleVoyageUpdate(updated) {
    setVoyages(prev => prev.map(v => v.id === updated.id ? updated : v));
    setSelectedVoyage(updated);
    setEditVoyage(null);
  }

  return (
    <>
      <div className="space-y-5">
        {/* Page header */}
        <div>
          <h1 className="font-bold text-slate-800 text-2xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Tour de Contrôle Logistique
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Hub Lagos / Abuja → Cotonou</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all border ${
                tab === t.key
                  ? 'bg-trustblue text-white border-trustblue shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <i className={t.icon} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'voyages' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-3">
              {voyages.map(v => (
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
                      { label: 'Valeur totale', value: `${(selectedVoyage.total_value_xof / 1_000_000).toFixed(2)}M XOF` },
                      { label: 'Départ', value: new Date(selectedVoyage.departure_date).toLocaleDateString('fr-FR') },
                      { label: 'Arrivée estimée', value: new Date(selectedVoyage.estimated_arrival).toLocaleDateString('fr-FR') },
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

        {tab === 'manifest' && <ManifestBuilder packages={PACKAGES} />}
        {tab === 'suivi' && <PackageTimeline packages={PACKAGES} />}
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
