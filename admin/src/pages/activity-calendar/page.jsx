import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function ActivityCalendarPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));

  useEffect(() => {
    setLoading(true);
    const start = new Date(selectedMonth + '-01');
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    supabase.from('admin_logs')
      .select('*, admin:admin_id(full_name)')
      .gte('created_at', start.toISOString())
      .lt('created_at', end.toISOString())
      .order('created_at', { ascending: false })
      .then(({ data }) => { setLogs(data || []); setLoading(false); });
  }, [selectedMonth]);

  const byDay = {};
  logs.forEach(l => {
    const day = new Date(l.created_at).toISOString().slice(0, 10);
    if (!byDay[day]) byDay[day] = [];
    byDay[day].push(l);
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Poppins, sans-serif' }}>Calendrier d'activité</h1>
          <p className="text-sm text-slate-500 mt-0.5">{logs.length} actions ce mois</p>
        </div>
        <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-trustblue" />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-trustblue/20 border-t-trustblue rounded-full animate-spin" /></div>
      ) : Object.keys(byDay).length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400">
          <i className="ri-calendar-line text-3xl mb-2 block" /><p className="text-sm">Aucune activité ce mois</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(byDay).sort(([a], [b]) => b.localeCompare(a)).map(([day, dayLogs]) => (
            <div key={day} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
                <span className="text-sm font-semibold text-slate-700">
                  {new Date(day).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <span className="text-xs text-slate-400 ml-2">({dayLogs.length} actions)</span>
              </div>
              <div className="divide-y divide-slate-50">
                {dayLogs.map(l => (
                  <div key={l.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <i className="ri-admin-line text-trustblue text-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800">{l.action}</p>
                      <p className="text-xs text-slate-500">
                        {l.resource_type} · {l.admin?.full_name || 'Admin'}
                        {l.resource_id && <> · {l.resource_id.slice(0, 8)}</>}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(l.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
