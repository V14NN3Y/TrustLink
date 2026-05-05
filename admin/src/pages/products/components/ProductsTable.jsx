import { useState } from 'react';
import { useSupabaseProducts } from '@/hooks/useSupabaseProducts';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import StatusBadge from '@/components/base/StatusBadge';
import { formatXOF, formatDate } from '@/components/base/DataTransformer';
const STATUSES = ['', 'PENDING_REVIEW', 'APPROVED', 'REJECTED'];
export default function ProductsTable() {
  const { rate } = useExchangeRate();
  const { products, loading, updateProduct } = useSupabaseProducts(null, rate);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const filtered = products.filter(p => {
    const matchStatus = !statusFilter || p.status === statusFilter;
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.seller_name.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });
  if (loading) return (
    <div className="py-20 text-center text-sm text-slate-400">Chargement...</div>
  );
  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-100">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Nom produit, vendeur..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-trustblue"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none cursor-pointer bg-white"
          >
            <option value="">Tous statuts</option>
            <option value="PENDING_REVIEW">En attente</option>
            <option value="APPROVED">Approuvés</option>
            <option value="REJECTED">Rejetés</option>
          </select>
          <span className="text-xs text-slate-400 self-center">{filtered.length} produit(s)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                {['Produit', 'Vendeur', 'Catégorie', 'Prix XOF', 'Statut', 'Soumis le', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400">Aucun produit trouvé</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                      <p className="text-sm font-medium text-slate-800 max-w-xs truncate">{p.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-slate-700">{p.seller_name}</p>
                    <p className="text-xs text-slate-400">{p.seller_id}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">{p.category}</span>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-slate-800">{formatXOF(p.price_xof)}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-xs text-slate-500">{formatDate(p.submitted_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelected(p)}
                        className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-blue-50 cursor-pointer"
                        title="Voir détails"
                      >
                        <i className="ri-eye-line text-trustblue" />
                      </button>
                      {p.status === 'PENDING_REVIEW' && (
                        <>
                          <button
                            onClick={() => updateProduct(p.id, 'APPROVED')}
                            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-emerald-50 cursor-pointer"
                            title="Approuver"
                          >
                            <i className="ri-checkbox-circle-line text-emerald-600" />
                          </button>
                          <button
                            onClick={() => updateProduct(p.id, 'REJECTED')}
                            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red-50 cursor-pointer"
                            title="Rejeter"
                          >
                            <i className="ri-close-circle-line text-red-500" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Modal détail produit */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-3xl w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>Détail produit</h3>
              <button onClick={() => setSelected(null)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-50 cursor-pointer">
                <i className="ri-close-line text-slate-500 text-xl" />
              </button>
            </div>
            <div className="w-full h-48 rounded-xl overflow-hidden bg-slate-100 mb-4">
              <img src={selected.images[0]} alt={selected.name} className="w-full h-full object-cover" />
            </div>
            <h4 className="font-bold text-slate-800 mb-1">{selected.name}</h4>
            <p className="text-xs text-slate-500 mb-3">{selected.category} · {selected.seller_name}</p>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">{selected.description}</p>
            <div className="flex gap-3">
              <div className="flex-1 bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-xs text-slate-400 mb-1">Prix XOF</p>
                <p className="font-bold text-trustblue">{formatXOF(selected.price_xof)}</p>
              </div>
              <div className="flex-1 bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-xs text-slate-400 mb-1">Statut</p>
                <StatusBadge status={selected.status} />
              </div>
            </div>
            {selected.status === 'PENDING_REVIEW' && (
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => updateProduct(selected.id, 'APPROVED')}
                  className="flex-1 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl font-semibold text-sm cursor-pointer flex items-center justify-center gap-2"
                >
                  <i className="ri-checkbox-circle-line" /> Approuver
                </button>
                <button
                  onClick={() => updateProduct(selected.id, 'REJECTED')}
                  className="flex-1 py-2 bg-red-50 border border-red-200 text-red-600 rounded-xl font-semibold text-sm cursor-pointer flex items-center justify-center gap-2"
                >
                  <i className="ri-close-circle-line" /> Rejeter
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
