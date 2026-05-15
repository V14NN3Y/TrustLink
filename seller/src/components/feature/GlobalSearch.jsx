import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';

export default function GlobalSearch() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpen(true); } if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 100); }, [open]);

  useEffect(() => {
    if (query.length < 2 || !user?.id) { setResults([]); return; }
    const q = `%${query}%`;
    Promise.all([
      supabase.from('order_items').select('id, product_name, order_id').eq('seller_id', user.id).ilike('product_name', q).limit(5),
      supabase.from('products').select('id, name').eq('seller_id', user.id).ilike('name', q).limit(5),
    ]).then(([orders, products]) => {
      const o = (orders.data || []).map(d => ({ id: d.id, label: d.product_name, sub: `Commande #${d.order_id?.slice(0, 8)}`, path: '/orders', icon: 'ri-shopping-bag-line' }));
      const p = (products.data || []).map(d => ({ id: d.id, label: d.name, sub: 'Produit', path: '/catalog', icon: 'ri-archive-line' }));
      setResults([...o, ...p]);
      setSelectedIdx(0);
    });
  }, [query, user]);

  const handleSelect = (item) => { navigate(item.path); setOpen(false); setQuery(''); };
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && results[selectedIdx]) handleSelect(results[selectedIdx]);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={() => setOpen(false)}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl border overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b">
          <i className="ri-search-line text-gray-400" />
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Rechercher commandes, produits..."
            className="flex-1 text-sm outline-none bg-transparent" />
          <span className="text-[10px] font-medium px-2 py-1 rounded bg-slate-100 text-slate-400">ESC</span>
        </div>
        {results.length > 0 && (
          <div className="max-h-64 overflow-y-auto p-2">
            {results.map((item, i) => (
              <button key={`${item.path}-${item.id}`} onClick={() => handleSelect(item)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm cursor-pointer ${i === selectedIdx ? 'bg-[#125C8D] text-white' : 'text-gray-700 hover:bg-slate-50'}`}>
                <i className={`${item.icon} text-base`} />
                <span className="flex-1 text-left truncate">{item.label}</span>
                <span className="text-[10px] opacity-60">{item.sub}</span>
              </button>
            ))}
          </div>
        )}
        {query.length >= 2 && results.length === 0 && <div className="px-4 py-6 text-center text-sm text-gray-400">Aucun résultat</div>}
        {query.length < 2 && <div className="px-4 py-6 text-center text-xs text-gray-400">Tapez au moins 2 caractères<span className="block mt-2">⌘K pour ouvrir · ↑↓ naviguer · ⏎ ouvrir</span></div>}
      </div>
    </div>
  );
}
