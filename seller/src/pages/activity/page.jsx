import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import DashboardLayout from '@/components/feature/DashboardLayout';

const ACTION_ICONS = {
  order_status_changed: 'ri-truck-line',
  product_created: 'ri-archive-line',
  product_updated: 'ri-edit-line',
  product_deleted: 'ri-delete-bin-line',
  variant_added: 'ri-stack-line',
  variant_deleted: 'ri-close-line',
  kyc_uploaded: 'ri-shield-check-line',
};

export default function ActivityPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    supabase.from('seller_logs').select('*').eq('seller_id', user.id).order('created_at', { ascending: false }).limit(100)
      .then(({ data }) => { setLogs(data || []); setLoading(false); });
  }, [user]);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Mon activité</h2>
        <p className="text-sm text-gray-400">Historique de vos actions sur la plateforme</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-[#125C8D] rounded-full animate-spin" /></div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 text-gray-400"><i className="ri-history-line text-3xl mb-2 block" /><p className="text-sm">Aucune activité enregistrée</p></div>
        ) : (
          <div className="divide-y divide-gray-50">
            {logs.map(l => (
              <div key={l.id} className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <i className={`${ACTION_ICONS[l.action] || 'ri-file-list-line'} text-[#125C8D] text-sm`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{l.action.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-gray-500">{l.resource_type} {l.resource_id?.slice(0, 8)}</p>
                </div>
                <span className="text-[10px] text-gray-400 flex-shrink-0">{new Date(l.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
