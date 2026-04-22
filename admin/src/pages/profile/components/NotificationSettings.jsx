import { useState } from 'react';

function NotifToggle({ label, description, value, onChange, icon }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
          <i className={`${icon} text-trustblue text-sm`} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-800">{label}</p>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>
      <button onClick={onChange} className={`relative rounded-full cursor-pointer flex-shrink-0 w-11 h-6 transition-colors ${value ? 'bg-trustblue' : 'bg-slate-200'}`}>
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
}

export default function NotificationSettings() {
  const [notifs, setNotifs] = useState({ new_order: true, dispute: true, payout: true, voyage_update: false, moderation: true, rate_change: false });
  const [frequency, setFrequency] = useState('realtime');
  const [saved, setSaved] = useState(false);

  const NOTIFS = [
    { key: 'new_order', label: 'Nouvelles commandes', description: 'Notification à chaque nouvelle commande escrow', icon: 'ri-shopping-bag-3-line' },
    { key: 'dispute', label: 'Litiges', description: "Alerte immédiate en cas d'ouverture de litige", icon: 'ri-error-warning-line' },
    { key: 'payout', label: 'Demandes de payout', description: 'Notification pour chaque payout en attente', icon: 'ri-bank-line' },
    { key: 'voyage_update', label: 'Mises à jour voyages', description: 'Statut des voyages en cours', icon: 'ri-truck-line' },
    { key: 'moderation', label: 'Produits à modérer', description: 'Nouveaux produits en attente de validation', icon: 'ri-shield-star-line' },
    { key: 'rate_change', label: 'Changement de taux', description: 'Variation significative du taux NGN/XOF', icon: 'ri-exchange-line' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6">
      <h3 className="font-semibold text-slate-800 text-base mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>Préférences de notifications</h3>
      <div className="mb-6">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3 block">Fréquence d'envoi</label>
        <div className="grid grid-cols-3 gap-2">
          {['realtime', 'hourly', 'daily'].map(f => (
            <button key={f} onClick={() => setFrequency(f)} className={`py-3 rounded-xl border-2 text-sm font-medium cursor-pointer ${frequency === f ? 'border-trustblue bg-trustblue text-white' : 'border-slate-100 text-slate-600'}`}>
              {f === 'realtime' ? 'Temps réel' : f === 'hourly' ? 'Chaque heure' : 'Résumé quotidien'}
            </button>
          ))}
        </div>
        {frequency !== 'realtime' && <p className="text-xs text-amber-600 mt-2"><i className="ri-information-line mr-1" />Les alertes critiques sont toujours en temps réel.</p>}
      </div>
      <div className="divide-y divide-slate-50">
        {NOTIFS.map(n => (
          <NotifToggle key={n.key} label={n.label} description={n.description} value={notifs[n.key]} onChange={() => setNotifs(prev => ({ ...prev, [n.key]: !prev[n.key] }))} icon={n.icon} />
        ))}
      </div>
      {saved && (
        <div className="animate-fade-in bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-emerald-700 text-sm flex items-center gap-2 mt-4">
          <i className="ri-checkbox-circle-line" />Préférences sauvegardées
        </div>
      )}
      <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000); }} className="w-full mt-4 py-2.5 bg-trustblue text-white rounded-xl font-semibold text-sm cursor-pointer">
        Sauvegarder les préférences
      </button>
    </div>
  );
}
