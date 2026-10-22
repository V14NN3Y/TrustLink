import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { formatXOF, formatNGN } from '@/components/base/DataTransformer';

const PERIODS = [
  { key: '7d', label: '7 jours', days: 7 },
  { key: '30d', label: '30 jours', days: 30 },
  { key: '90d', label: '90 jours', days: 90 },
  { key: '12m', label: '12 mois', days: 365 },
];

export default function ReportsPage() {
  const [period, setPeriod] = useState('30d');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const days = PERIODS.find(p => p.key === period)?.days || 30;

  useEffect(() => {
    setLoading(true);
    const since = new Date();
    since.setDate(since.getDate() - days);
    supabase.from('orders')
      .select('*, order_items(*), buyer:profiles!buyer_id(full_name)')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [days]);

  const totalRevenue = orders.reduce((s, o) => s + Number(o.total_amount || 0), 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  const dailyMap = {};
  orders.forEach(o => {
    const day = new Date(o.created_at).toISOString().slice(0, 10);
    dailyMap[day] = (dailyMap[day] || 0) + Number(o.total_amount || 0);
  });
  const chartData = Object.entries(dailyMap).sort(([a], [b]) => a.localeCompare(b)).map(([date, revenue]) => ({ date, revenue }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Poppins, sans-serif' }}>Rapports de ventes</h1>
          <p className="text-sm text-slate-500 mt-0.5">{totalOrders} commandes · {formatXOF(totalRevenue)} total</p>
        </div>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {PERIODS.map(p => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${period === p.key ? 'bg-white text-trustblue shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{p.label}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Revenu total', value: formatXOF(totalRevenue), icon: 'ri-line-chart-line', color: '#125C8D', bg: 'bg-blue-50' },
          { label: 'Commandes', value: String(totalOrders), icon: 'ri-shopping-bag-line', color: '#10B981', bg: 'bg-emerald-50' },
          { label: 'Panier moyen', value: formatXOF(avgOrderValue), icon: 'ri-money-dollar-circle-line', color: '#FF6A00', bg: 'bg-orange-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg}`}><i className={`${s.icon} text-lg`} style={{ color: s.color }} /></div>
            <div><p className="text-xs text-slate-500">{s.label}</p><p className="text-xl font-bold text-slate-900">{s.value}</p></div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Évolution du revenu</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
            <Tooltip />
            <Area type="monotone" dataKey="revenue" stroke="#125C8D" fill="#125C8D20" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Statut des commandes</h3>
          <div className="space-y-3">
            {['pending', 'paid', 'processing', 'in_transit', 'delivered', 'confirmed', 'disputed', 'cancelled', 'refunded'].map(status => {
              const count = orders.filter(o => o.status === status).length;
              const pct = totalOrders > 0 ? (count / totalOrders) * 100 : 0;
              return (
                <div key={status} className="flex items-center gap-3">
                  <span className="text-xs font-medium w-24 text-slate-600 capitalize">{status}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-2 rounded-full bg-trustblue transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs font-semibold w-16 text-right text-slate-700">{count} ({Math.round(pct)}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
