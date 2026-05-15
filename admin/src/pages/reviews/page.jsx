import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, avg: 0, fiveStars: 0, oneStars: 0 });
  const [filter, setFilter] = useState('all');
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('reviews')
      .select('*, product:product_id(name), buyer:buyer_id(full_name, avatar_url), order:order_id(id)')
      .order('created_at', { ascending: false });
    const list = data || [];
    setReviews(list);
    const total = list.length;
    const avg = total > 0 ? Math.round((list.reduce((s, r) => s + r.rating, 0) / total) * 10) / 10 : 0;
    setStats({ total, avg, fiveStars: list.filter(r => r.rating === 5).length, oneStars: list.filter(r => r.rating === 1).length });
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet avis ? Cette action est irréversible.')) return;
    setDeleting(id);
    await supabase.from('reviews').delete().eq('id', id);
    setDeleting(null);
    load();
  };

  const filtered = filter === 'all' ? reviews : filter === 'positive' ? reviews.filter(r => r.rating >= 4) : filter === 'negative' ? reviews.filter(r => r.rating <= 2) : reviews.filter(r => r.rating === 3);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Poppins, sans-serif' }}>Avis clients</h1>
          <p className="text-sm text-slate-500 mt-0.5">Consultez et modérez les avis laissés par les acheteurs</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total avis', value: stats.total, icon: 'ri-chat-3-line', color: '#125C8D', bg: 'bg-blue-50' },
          { label: 'Note moyenne', value: `${stats.avg}/5`, icon: 'ri-star-fill', color: '#F59E0B', bg: 'bg-amber-50' },
          { label: '5 étoiles', value: stats.fiveStars, icon: 'ri-star-smile-fill', color: '#10B981', bg: 'bg-emerald-50' },
          { label: '1 étoile', value: stats.oneStars, icon: 'ri-star-sad-fill', color: '#EF4444', bg: 'bg-red-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg}`}>
              <i className={`${s.icon} text-lg`} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className="text-xl font-bold text-slate-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {[
          { key: 'all', label: 'Tous' },
          { key: 'positive', label: 'Positifs (4-5★)' },
          { key: 'neutral', label: 'Neutres (3★)' },
          { key: 'negative', label: 'Négatifs (1-2★)' },
        ].map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${filter === t.key ? 'bg-white text-trustblue shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Liste */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-trustblue rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <i className="ri-star-line text-3xl mb-2 block" />
            <p className="text-sm">Aucun avis trouvé</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.map(r => (
              <div key={r.id} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50 transition-all">
                <div className="w-9 h-9 rounded-full bg-trustblue flex items-center justify-center flex-shrink-0 text-white text-xs font-bold overflow-hidden">
                  {r.buyer?.avatar_url ? (
                    <img src={r.buyer.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (r.buyer?.full_name || '?').slice(0, 2).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="text-sm font-semibold text-slate-800">{r.buyer?.full_name || 'Anonyme'}</p>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <i key={s} className={`text-xs ${s <= r.rating ? 'ri-star-fill text-amber-400' : 'ri-star-line text-slate-300'}`} />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-400">{new Date(r.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-1">
                    sur <span className="font-medium text-slate-700">{r.product?.name || 'Produit supprimé'}</span>
                    {r.order?.id && <> · Commande #{r.order.id.slice(0, 8)}</>}
                  </p>
                  {r.comment && <p className="text-sm text-slate-600 leading-relaxed">{r.comment}</p>}
                </div>
                <button onClick={() => handleDelete(r.id)} disabled={deleting === r.id}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 cursor-pointer transition-colors disabled:opacity-50 flex-shrink-0"
                  title="Supprimer l'avis">
                  <i className="ri-delete-bin-line text-sm" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
