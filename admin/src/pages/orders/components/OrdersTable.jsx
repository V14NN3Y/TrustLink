import { useState, useRef, useEffect } from 'react';
import StatusBadge from '@/components/base/StatusBadge';
import { supabase } from '@/lib/supabaseClient';
import { formatXOF, formatNGN, formatDate } from '@/components/base/DataTransformer';

const ITEMS_PER_PAGE = 8;
const ALL_STATUSES = ['PENDING', 'FUNDED', 'IN_TRANSIT', 'CUSTOMS', 'DELIVERED', 'DISPUTED'];

export default function OrdersTable({ orders, onSelect, onUpdate }) {
  const [search, setSearch] = useState('');
  const [filterHub, setFilterHub] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSeller, setFilterSeller] = useState('');
  const [page, setPage] = useState(1);
  const [dropdownId, setDropdownId] = useState(null);
  const [flashId, setFlashId] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownId(null);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setPage(1); }, [search, filterHub, filterStatus, filterSeller]);

  const filtered = orders.filter(o => {
    const s = search.toLowerCase();
    const matchSearch = !search || o.ref.toLowerCase().includes(s) || o.product.toLowerCase().includes(s) || o.buyer_name.toLowerCase().includes(s);
    const matchHub = !filterHub || o.hub_origin === filterHub;
    const matchStatus = !filterStatus || o.status === filterStatus;
    const matchSeller = !filterSeller || o.seller_name.toLowerCase().includes(filterSeller.toLowerCase());
    return matchSearch && matchHub && matchStatus && matchSeller;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  async function handleStatusChange(order, status) {
    onUpdate({ ...order, status });
    setDropdownId(null);
    setFlashId(order.id);
    setTimeout(() => setFlashId(null), 1000);

    // Créer une notification pour le buyer
    // D'abord récupérer le buyer_id depuis la commande
    const { data: orderData } = await supabase
      .from('orders')
      .select('buyer_id')
      .eq('id', order.id)
      .single();


    if (orderData?.buyer_id) {
      await supabase.from('notifications').insert({
        user_id: orderData.buyer_id,
        type: 'order_update',
        title: `Commande ${order.ref} : statut mis à jour → ${status}`,
        body: `Votre commande est maintenant : ${status}`,
        resource_type: 'order',
        resource_id: order.id,
        is_read: false,
      });
    }

    // Log admin
    const { data: { user: adminUser } } = await supabase.auth.getUser();
    await supabase.from('admin_logs').insert({
      admin_id: adminUser.id,
      action: 'order_status_changed',
      resource_type: 'order',
      resource_id: order.id,
      old_value: { status: order.status },
      new_value: { status },
    });
  }

  const inputClass = "px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-trustblue transition-colors bg-white";

  return (
    <div className="bg-white rounded-2xl border border-slate-100">
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-800 text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>Commandes Escrow</h3>
            <p className="text-xs text-slate-500 mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>{filtered.length} commande{filtered.length !== 1 ? 's' : ''} trouvée{filtered.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => { setSearch(''); setFilterHub(''); setFilterStatus(''); setFilterSeller(''); }} className="text-xs text-trustblue hover:underline cursor-pointer" style={{ fontFamily: 'Inter, sans-serif' }}>Réinitialiser filtres</button>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ref, produit, acheteur…" className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-trustblue transition-colors" style={{ fontFamily: 'Inter, sans-serif' }} />
          </div>
          <select value={filterHub} onChange={e => setFilterHub(e.target.value)} className={inputClass + ' cursor-pointer'} style={{ fontFamily: 'Inter, sans-serif' }}>
            <option value="">Tous hubs</option>
            <option value="Lagos">Lagos</option>
            <option value="Abuja">Abuja</option>
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={inputClass + ' cursor-pointer'} style={{ fontFamily: 'Inter, sans-serif' }}>
            <option value="">Tous statuts</option>
            {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input value={filterSeller} onChange={e => setFilterSeller(e.target.value)} placeholder="Vendeur…" className={inputClass + ' w-36'} style={{ fontFamily: 'Inter, sans-serif' }} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              {['Réf / Voyage', 'Produit / Acheteur', 'Vendeur', 'Hub', 'Montant', 'Statut', 'Date', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-slate-400">Aucune commande trouvée</td></tr>
            ) : paginated.map(order => (
              <tr key={order.id} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${flashId === order.id ? 'bg-emerald-50' : ''}`}>
                <td className="px-4 py-3">
                  <p className="text-sm font-semibold text-slate-800" style={{ fontFamily: 'Inter, sans-serif' }}>{order.ref}</p>
                  {order.voyage_id && <p className="text-xs text-slate-400">{order.voyage_id}</p>}
                </td>
                <td className="px-4 py-3 max-w-xs">
                  <p className="text-sm text-slate-700 truncate" style={{ fontFamily: 'Inter, sans-serif' }}>{order.product}</p>
                  <p className="text-xs text-slate-400">{order.buyer_name}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-slate-700" style={{ fontFamily: 'Inter, sans-serif' }}>{order.seller_name}</p>
                  <p className="text-xs text-slate-400">{order.seller_id}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">{order.hub_origin}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <p className="text-sm font-semibold text-slate-800" style={{ fontFamily: 'Inter, sans-serif' }}>{formatXOF(order.amount_xof)}</p>
                  <p className="text-xs text-slate-400">{formatNGN(order.amount_ngn)}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="relative" ref={dropdownId === order.id ? dropdownRef : undefined}>
                    <button onClick={() => setDropdownId(dropdownId === order.id ? null : order.id)} className="cursor-pointer">
                      <StatusBadge status={order.status} />
                    </button>
                    {dropdownId === order.id && (
                      <div className="absolute top-8 left-0 z-20 bg-white border border-slate-100 rounded-xl py-1 min-w-max animate-fade-in">
                        {ALL_STATUSES.map(s => (
                          <button key={s} onClick={() => handleStatusChange(order, s)} className={`w-full text-left px-4 py-2 text-xs hover:bg-slate-50 cursor-pointer ${s === order.status ? 'font-semibold text-trustblue' : 'text-slate-700'}`}>{s}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <p className="text-xs text-slate-500">{formatDate(order.created_at)}</p>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => onSelect(order)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-blue-50 cursor-pointer">
                    <i className="ri-eye-line text-trustblue" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-4 flex items-center justify-between">
        <p className="text-xs text-slate-500">Page {safePage} / {totalPages}</p>
        <div className="flex items-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1} className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer">
            <i className="ri-arrow-left-s-line text-slate-600" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => Math.abs(p - safePage) <= 2).map(p => (
            <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-medium cursor-pointer ${p === safePage ? 'bg-trustblue text-white' : 'border border-slate-200 hover:bg-slate-50 text-slate-600'}`}>{p}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="w-8 h-8 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer">
            <i className="ri-arrow-right-s-line text-slate-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
