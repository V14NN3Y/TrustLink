import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function StockNotificationsPage() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('stock_notifications')
      .select('*, product:product_id(name)')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setSubs(data || []); setLoading(false); });
  }, []);

  const markNotified = async (id) => {
    await supabase.from('stock_notifications').update({ notified: true }).eq('id', id);
    setSubs(s => s.map(x => x.id === id ? { ...x, notified: true } : x));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Poppins, sans-serif' }}>Notifications de stock</h1>
        <p className="text-sm text-slate-500 mt-0.5">{subs.filter(s => !s.notified).length} demandes en attente</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-trustblue rounded-full animate-spin" /></div>
        ) : subs.length === 0 ? (
          <div className="text-center py-16 text-slate-400"><i className="ri-mail-send-line text-3xl mb-2 block" /><p className="text-sm">Aucune notification de stock</p></div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Produit</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Statut</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {subs.map(s => (
                <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm font-medium text-slate-800">{s.email}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{s.product?.name || '—'}</td>
                  <td className="px-4 py-3 text-sm text-slate-500">{new Date(s.created_at).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${s.notified ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                      {s.notified ? 'Notifié' : 'En attente'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {!s.notified && (
                      <button onClick={() => markNotified(s.id)} className="text-xs font-semibold text-trustblue hover:underline cursor-pointer">Marquer notifié</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
