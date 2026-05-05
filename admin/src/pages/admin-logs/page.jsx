import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { formatDateTime } from '@/components/base/DataTransformer';
const ACTION_ICONS = {
  order_status_changed: 'ri-shopping-bag-line',
  product_approved: 'ri-checkbox-circle-line',
  product_rejected: 'ri-close-circle-line',
  dispute_resolved: 'ri-shield-check-line',
  exchange_rate_updated: 'ri-exchange-line',
  payout_approved: 'ri-bank-line',
  user_kyc_updated: 'ri-user-check-line',
};
export default function AdminLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  useEffect(() => {
    async function fetch() {
      setLoading(true);
      const { data } = await supabase
        .from('admin_logs')
        .select('*, admin:profiles!admin_id(full_name, email)')
        .order('created_at', { ascending: false })
        .limit(200);
      setLogs(data || []);
      setLoading(false);
    }
    fetch();
  }, []);
  const filtered = logs.filter(l => {
    const matchSearch = !search || l.action.toLowerCase().includes(search.toLowerCase()) || (l.admin?.full_name || '').toLowerCase().includes(search.toLowerCase());
    const matchResource = !resourceFilter || l.resource_type === resourceFilter;
    return matchSearch && matchResource;
  });
  const resourceTypes = [...new Set(logs.map(l => l.resource_type).filter(Boolean))];
  return (
    <div className="space-y-4">
      <h1 className="font-bold text-slate-800 text-2xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
        Historique des actions
      </h1>
      <div className="bg-white rounded-2xl border border-slate-100">
        <div className="p-5 border-b border-slate-100 flex gap-3">
          <div className="relative flex-1">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Action, admin..." className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-trustblue" />
          </div>
          <select value={resourceFilter} onChange={e => setResourceFilter(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none cursor-pointer bg-white">
            <option value="">Toutes ressources</option>
            {resourceTypes.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <span className="text-xs text-slate-400 self-center">{filtered.length} entrée(s)</span>
        </div>
        {loading ? (
          <div className="py-20 text-center text-sm text-slate-400">Chargement...</div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.map(log => (
              <div key={log.id} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <i className={`${ACTION_ICONS[log.action] || 'ri-history-line'} text-trustblue text-sm`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">{log.action}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-slate-500">{log.admin?.full_name || log.admin_id?.slice(0,8)}</span>
                    {log.resource_type && (
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{log.resource_type}</span>
                    )}
                    {log.resource_id && (
                      <span className="text-xs text-slate-400 font-mono">{log.resource_id.slice(0,8)}</span>
                    )}
                  </div>
                  {(log.old_value || log.new_value) && (
                    <div className="mt-1 flex gap-3 text-xs">
                      {log.old_value && <span className="text-red-500">Avant: {JSON.stringify(log.old_value)}</span>}
                      {log.new_value && <span className="text-emerald-600">Après: {JSON.stringify(log.new_value)}</span>}
                    </div>
                  )}
                </div>
                <span className="text-xs text-slate-400 flex-shrink-0">{formatDateTime(log.created_at)}</span>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="py-12 text-center text-sm text-slate-400">Aucune entrée trouvée</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
