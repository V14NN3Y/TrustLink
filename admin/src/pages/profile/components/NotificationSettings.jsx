import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';

const NOTIF_TYPES = [
  { key: 'new_order', type: 'new_order', label: 'Nouvelles commandes', description: 'Notification à chaque nouvelle commande escrow', icon: 'ri-shopping-bag-3-line' },
  { key: 'dispute', type: 'dispute_update', label: 'Litiges', description: "Alerte immédiate en cas d'ouverture de litige", icon: 'ri-error-warning-line' },
  { key: 'payout', type: 'payment_received', label: 'Demandes de payout', description: 'Notification pour chaque payout en attente', icon: 'ri-bank-line' },
  { key: 'voyage_update', type: 'order_update', label: 'Mises à jour voyages', description: 'Statut des voyages en cours', icon: 'ri-truck-line' },
  { key: 'moderation', type: 'product_approved', label: 'Produits à modérer', description: 'Nouveaux produits en attente de validation', icon: 'ri-shield-star-line' },
];

export default function NotificationSettings() {
  const { user } = useAuth();
  const [enabled, setEnabled] = useState({});
  const [frequency, setFrequency] = useState('realtime');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('notification_preferences').select('type, enabled').eq('user_id', user.id).eq('channel', 'email'),
      supabase.from('profiles').select('notification_frequency').eq('id', user.id).single(),
    ]).then(([prefsRes, profileRes]) => {
      const prefs = {};
      NOTIF_TYPES.forEach(n => { prefs[n.key] = false; });
      prefsRes.data?.forEach(p => {
        const match = NOTIF_TYPES.find(n => n.type === p.type);
        if (match) prefs[match.key] = p.enabled;
      });
      setEnabled(prefs);
      if (profileRes.data?.notification_frequency) setFrequency(profileRes.data.notification_frequency);
      setLoading(false);
    });
  }, [user]);

  async function handleSave() {
    if (!user) return;
    const rows = NOTIF_TYPES.map(n => ({
      user_id: user.id,
      type: n.type,
      channel: 'email',
      enabled: enabled[n.key],
    }));
    for (const row of rows) {
      await supabase.from('notification_preferences').upsert(row, { onConflict: 'user_id, type, channel' });
    }
    await supabase.from('profiles').update({ notification_frequency: frequency }).eq('id', user.id);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) return null;

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
        {NOTIF_TYPES.map(n => (
          <div key={n.key} className="flex items-center justify-between gap-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <i className={`${n.icon} text-trustblue text-sm`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">{n.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{n.description}</p>
              </div>
            </div>
            <button onClick={() => setEnabled(prev => ({ ...prev, [n.key]: !prev[n.key] }))} className={`relative rounded-full cursor-pointer flex-shrink-0 w-11 h-6 transition-colors ${enabled[n.key] ? 'bg-trustblue' : 'bg-slate-200'}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled[n.key] ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        ))}
      </div>
      {saved && (
        <div className="animate-fade-in bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-emerald-700 text-sm flex items-center gap-2 mt-4">
          <i className="ri-checkbox-circle-line" />Préférences sauvegardées
        </div>
      )}
      <button onClick={handleSave} className="w-full mt-4 py-2.5 bg-trustblue text-white rounded-xl font-semibold text-sm cursor-pointer">
        Sauvegarder les préférences
      </button>
    </div>
  );
}
