import { useState } from 'react';
import { formatDateTime } from '@/components/base/DataTransformer';

const TYPE_CONFIG = {
  RATE_CHANGE: { icon: 'ri-exchange-line', color: 'text-trustblue', bg: 'bg-blue-50', label: 'Taux' },
  PAYOUT:      { icon: 'ri-bank-card-line', color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Payout' },
  SPREAD:      { icon: 'ri-percent-line', color: 'text-amber-600', bg: 'bg-amber-50', label: 'Spread' },
  MODERATION:  { icon: 'ri-shield-star-line', color: 'text-purple-600', bg: 'bg-purple-50', label: 'Modération' },
  DISPUTE:     { icon: 'ri-error-warning-line', color: 'text-red-500', bg: 'bg-red-50', label: 'Litige' },
};

export default function AuditTrail({ entries }) {
  const [exported, setExported] = useState(false);

  function handleExport() {
    const headers = ['Type', 'Description', 'Utilisateur', 'Date', 'Montant'];
    const rows = entries.map(e => [`"${e.type}"`, `"${e.description}"`, `"${e.user}"`, `"${formatDateTime(e.timestamp)}"`, `"${e.amount ? `${e.amount} ${e.currency}` : ''}"`].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `audit-trustlink-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
    setExported(true); setTimeout(() => setExported(false), 3000);
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-800 text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>Journal d'audit</h3>
          <p className="text-xs text-slate-500 mt-0.5">{entries.length} entrées</p>
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer">
          {exported ? <><i className="ri-checkbox-circle-line text-emerald-600" /><span className="text-emerald-600">Exporté !</span></> : <><i className="ri-download-line" />Export CSV</>}
        </button>
      </div>
      <div className="divide-y divide-slate-50 max-h-96 overflow-y-auto">
        {entries.map(entry => {
          const cfg = TYPE_CONFIG[entry.type] || TYPE_CONFIG.MODERATION;
          return (
            <div key={entry.id} className="flex items-start gap-3 px-5 py-3 hover:bg-slate-50">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                <i className={`${cfg.icon} text-sm ${cfg.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-800 leading-relaxed">{entry.description}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-400">{entry.user}</span>
                  <span className="text-slate-200">·</span>
                  <span className="text-xs text-slate-400">{formatDateTime(entry.timestamp)}</span>
                </div>
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color} flex-shrink-0`}>{cfg.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
