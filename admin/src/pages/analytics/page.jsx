import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function AnalyticsPage() {
  const [profiles, setProfiles] = useState([]);
  const [products, setProducts] = useState([]);
  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('profiles').select('created_at, role, kyc_identity_verified'),
      supabase.from('products').select('id, name, price, status'),
      supabase.from('dispatches').select('status, origin_hub, departure_date, actual_arrival, estimated_arrival'),
    ]).then(([profilesRes, productsRes, dispatchesRes]) => {
      setProfiles(profilesRes.data || []);
      setProducts(productsRes.data || []);
      setDispatches(dispatchesRes.data || []);
      setLoading(false);
    });
  }, []);

  const userGrowthMap = {};
  profiles.forEach(p => {
    const month = new Date(p.created_at).toISOString().slice(0, 7);
    if (!userGrowthMap[month]) userGrowthMap[month] = { month, buyers: 0, sellers: 0, admins: 0 };
    userGrowthMap[month][p.role === 'buyer' ? 'buyers' : p.role === 'seller' ? 'sellers' : 'admins']++;
  });
  const userGrowthData = Object.values(userGrowthMap).sort((a, b) => a.month.localeCompare(b.month));

  const totalSellers = profiles.filter(p => p.role === 'seller').length;
  const kycVerified = profiles.filter(p => p.kyc_identity_verified).length;

  const hubPerfMap = {};
  dispatches.forEach(d => {
    if (!hubPerfMap[d.origin_hub]) hubPerfMap[d.origin_hub] = { total: 0, onTime: 0, delayed: 0, cancelled: 0 };
    hubPerfMap[d.origin_hub].total++;
    if (d.status === 'cancelled') hubPerfMap[d.origin_hub].cancelled++;
    else if (d.actual_arrival && d.estimated_arrival) {
      const delay = new Date(d.actual_arrival) - new Date(d.estimated_arrival);
      if (delay > 86400000) hubPerfMap[d.origin_hub].delayed++;
      else hubPerfMap[d.origin_hub].onTime++;
    } else hubPerfMap[d.origin_hub].onTime++;
  });

  const topProducts = products.filter(p => p.status === 'approved').slice(0, 5);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-trustblue/20 border-t-trustblue rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Poppins, sans-serif' }}>Analytique</h1>
        <p className="text-sm text-slate-500 mt-0.5">Indicateurs de performance et croissance</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <p className="text-xs text-slate-500">Total utilisateurs</p>
          <p className="text-2xl font-bold text-slate-900">{profiles.length}</p>
          <p className="text-xs text-green-600">{profiles.filter(p => p.role === 'buyer').length} acheteurs</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <p className="text-xs text-slate-500">Vendeurs</p>
          <p className="text-2xl font-bold text-slate-900">{totalSellers}</p>
          <p className="text-xs text-green-600">{kycVerified} KYC vérifiés</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <p className="text-xs text-slate-500">Produits approuvés</p>
          <p className="text-2xl font-bold text-slate-900">{products.filter(p => p.status === 'approved').length}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <p className="text-xs text-slate-500">Taux complétion KYC</p>
          <p className="text-2xl font-bold text-slate-900">{totalSellers > 0 ? Math.round((kycVerified / totalSellers) * 100) : 0}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Croissance utilisateurs</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="buyers" name="Acheteurs" fill="#125C8D" radius={[4, 4, 0, 0]} />
              <Bar dataKey="sellers" name="Vendeurs" fill="#FF6A00" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Performance hubs</h3>
          <table className="w-full">
            <thead><tr className="border-b border-slate-100">
              <th className="text-left py-2 text-xs font-semibold text-slate-500 uppercase">Hub</th>
              <th className="text-right py-2 text-xs font-semibold text-slate-500 uppercase">Total</th>
              <th className="text-right py-2 text-xs font-semibold text-slate-500 uppercase">À l'heure</th>
              <th className="text-right py-2 text-xs font-semibold text-slate-500 uppercase">Retard</th>
              <th className="text-right py-2 text-xs font-semibold text-slate-500 uppercase">Taux</th>
            </tr></thead>
            <tbody>
              {Object.entries(hubPerfMap).map(([hub, d]) => (
                <tr key={hub} className="border-b border-slate-50">
                  <td className="py-2 text-sm font-medium text-slate-800">{hub}</td>
                  <td className="py-2 text-sm text-right text-slate-600">{d.total}</td>
                  <td className="py-2 text-sm text-right text-green-600">{d.onTime}</td>
                  <td className="py-2 text-sm text-right text-red-500">{d.delayed}</td>
                  <td className="py-2 text-sm text-right font-semibold text-slate-800">
                    {d.total > 0 ? Math.round((d.onTime / d.total) * 100) : 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h3 className="font-semibold text-slate-800 mb-4">Top produits approuvés</h3>
        <table className="w-full">
          <thead><tr className="border-b border-slate-100">
            <th className="text-left py-2 text-xs font-semibold text-slate-500 uppercase">Produit</th>
            <th className="text-right py-2 text-xs font-semibold text-slate-500 uppercase">Prix</th>
            <th className="text-right py-2 text-xs font-semibold text-slate-500 uppercase">Stock</th>
          </tr></thead>
          <tbody>
            {topProducts.map(p => (
              <tr key={p.id} className="border-b border-slate-50">
                <td className="py-2 text-sm text-slate-700">{p.name}</td>
                <td className="py-2 text-sm text-right font-semibold text-slate-800">{Number(p.price).toLocaleString()} FCFA</td>
                <td className="py-2 text-sm text-right text-slate-600">{p.stock_quantity || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
