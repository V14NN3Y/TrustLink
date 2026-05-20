import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ToggleSwitch from '@/components/base/ToggleSwitch';

export default function MaintenancePage() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('app_settings').select('value').eq('key', 'maintenance_mode').single()
      .then(({ data }) => {
        if (data) setEnabled(data.value === true || data.value === 'true');
        setLoading(false);
      });
  }, []);

  const toggle = async () => {
    setSaving(true);
    const newVal = !enabled;
    await supabase.from('app_settings').upsert(
      { key: 'maintenance_mode', value: JSON.stringify(newVal), updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    );
    setEnabled(newVal);
    setSaving(false);
  };

  if (loading) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${enabled ? 'bg-red-50' : 'bg-slate-50'}`}>
            <i className={`text-2xl ${enabled ? 'ri-shield-warning-line text-red-500' : 'ri-shield-check-line text-slate-400'}`} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Mode maintenance</h2>
            <p className="text-sm text-slate-500 mt-1">
              {enabled
                ? 'Le site est actuellement en maintenance. Les utilisateurs verront une page de maintenance.'
                : 'Le site est accessible normalement. Activez le mode maintenance pour effectuer des mises à jour.'}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
          <div className="flex items-center gap-4">
            <ToggleSwitch enabled={enabled} onClick={saving ? undefined : toggle} size="lg" />
            <div>
              <p className="text-sm font-semibold text-slate-800">{enabled ? 'Maintenance active' : 'Maintenance inactive'}</p>
              <p className="text-xs text-slate-500">{enabled ? 'Tout le trafic redirigé' : 'Site en production'}</p>
            </div>
          </div>
        </div>
        {enabled && (
          <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-100">
            <p className="text-xs text-red-700 flex items-center gap-2">
              <i className="ri-error-warning-line" />Attention : en mode maintenance, tous les utilisateurs (sauf admins) verront une page d'indisponibilité.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
