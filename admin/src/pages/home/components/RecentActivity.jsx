import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ACTIVITY_FEED, HUB_STATS } from '@/mocks/dashboard';
import { formatDateTime } from '@/components/base/DataTransformer';
import { getSharedOrders } from '@/lib/sharedStorage';

const TYPE_ICONS = { ORDER: 'ri-shopping-bag-3-line', PAYOUT: 'ri-bank-line', VOYAGE: 'ri-truck-line', DISPUTE: 'ri-error-warning-line' };
const TYPE_ROUTES = { ORDER: '/orders', PAYOUT: '/finance', VOYAGE: '/logistics', DISPUTE: '/moderation' };
const TYPE_COLORS = { ORDER: 'bg-blue-50 text-blue-600', PAYOUT: 'bg-emerald-50 text-emerald-600', VOYAGE: 'bg-amber-50 text-amber-600', DISPUTE: 'bg-red-50 text-red-500' };

export default function RecentActivity() {
  const navigate = useNavigate();
  const totalVol = HUB_STATS.Lagos.volume_xof + HUB_STATS.Abuja.volume_xof;
  const [pendingOrders, setPendingOrders] = useState(() =>
    getSharedOrders().filter(o => o.status === 'pending_admin')
  );

  useEffect(() => {
    const handler = () => {
      setPendingOrders(getSharedOrders().filter(o => o.status === 'pending_admin'));
    };
    window.addEventListener('tl_storage_update', handler);
    return () => window.removeEventListener('tl_storage_update', handler);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6">
        <h3 className="font-semibold text-slate-800 text-base mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Activité récente</h3>
        <div className="space-y-2">
          {ACTIVITY_FEED.map(item => (
            <div key={item.id} onClick={() => navigate(TYPE_ROUTES[item.type])} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer group">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${TYPE_COLORS[item.type]}`}>
                <i className={`${TYPE_ICONS[item.type]} text-sm`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate group-hover:text-trustblue">{item.title}</p>
                <p className="text-xs text-slate-500 truncate">{item.sub}</p>
              </div>
              <p className="text-xs text-slate-400 flex-shrink-0">{formatDateTime(item.time)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="font-semibold text-slate-800 text-base mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Hubs de collecte</h3>
          {Object.entries(HUB_STATS).map(([hub, s]) => {
            const pct = Math.round((s.volume_xof / totalVol) * 100);
            return (
              <div key={hub} className="mb-4 last:mb-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-slate-700">{hub}</span>
                  <span className="text-xs text-slate-500">{s.orders} cmd · {pct}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-2 bg-trustblue rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs text-slate-400 mt-1">Ponctualité {s.on_time_pct}%</p>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="font-semibold text-slate-800 text-base mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Actions rapides</h3>
          <div className="space-y-2">
            {pendingOrders.length > 0 && (
              <button
                onClick={() => navigate('/orders')}
                className="w-full flex items-center justify-between p-3 rounded-xl text-left hover:opacity-90 transition-opacity cursor-pointer border"
                style={{ backgroundColor: 'rgba(255,106,0,0.08)', borderColor: 'rgba(255,106,0,0.2)' }}
              >
                <div className="flex items-center gap-2">
                  <i className="ri-time-line text-sm" style={{ color: '#FF6A00' }} />
                  <span className="text-xs font-medium text-slate-700">Valider commandes en attente</span>
                </div>
                <span className="text-xs text-white font-semibold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ backgroundColor: '#FF6A00' }}>
                  {pendingOrders.length}
                </span>
              </button>
            )}
            {[
              { label: 'Voir commandes en litige', icon: 'ri-error-warning-line', path: '/moderation' },
              { label: 'Valider les payouts', icon: 'ri-bank-line', path: '/finance' },
              { label: 'Suivre les voyages', icon: 'ri-truck-line', path: '/logistics' },
            ].map(a => (
              <button key={a.path} onClick={() => navigate(a.path)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 cursor-pointer text-left">
                <i className={`${a.icon} text-trustblue`} />
                <span className="text-sm text-slate-700">{a.label}</span>
                <i className="ri-arrow-right-s-line text-slate-400 ml-auto" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
