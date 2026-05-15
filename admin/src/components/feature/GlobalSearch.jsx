import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

const SEARCHABLES = [
  { label: 'Commandes', path: '/orders', table: 'orders', searchField: 'id', displayField: 'id', icon: 'ri-shopping-bag-line' },
  { label: 'Utilisateurs', path: '/users', table: 'profiles', searchField: 'full_name', displayField: 'full_name', icon: 'ri-user-line' },
  { label: 'Produits', path: '/products', table: 'products', searchField: 'name', displayField: 'name', icon: 'ri-archive-line' },
];

export default function GlobalSearch({ open: externalOpen, onOpenChange }) {
  const navigate = useNavigate();
  const [internalOpen, setInternalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef(null);

  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpen(true); }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [setOpen]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    setLoading(true);
    const promises = SEARCHABLES.map(s =>
      supabase.from(s.table).select('id, ' + s.searchField).ilike(s.searchField, `%${query}%`).limit(5)
        .then(({ data }) => (data || []).map(d => ({ ...s, id: d.id, display: d[s.displayField] })))
    );
    Promise.all(promises).then(all => {
      setResults(all.flat());
      setSelectedIdx(0);
      setLoading(false);
    });
  }, [query]);

  const handleSelect = (item) => {
    navigate(item.path);
    setOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, results.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && results[selectedIdx]) { handleSelect(results[selectedIdx]); }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={() => setOpen(false)}>
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
          <i className="ri-search-line text-slate-400" />
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Rechercher commandes, utilisateurs, produits..."
            className="flex-1 text-sm outline-none bg-transparent" />
          <span className="text-[10px] font-medium px-2 py-1 rounded bg-slate-100 text-slate-400">ESC</span>
        </div>
        {loading && <div className="px-4 py-3 text-xs text-slate-400">Recherche...</div>}
        {results.length > 0 && (
          <div className="max-h-64 overflow-y-auto p-2">
            {results.map((item, i) => (
              <button key={`${item.table}-${item.id}`} onClick={() => handleSelect(item)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm cursor-pointer ${i === selectedIdx ? 'bg-trustblue text-white' : 'text-slate-700 hover:bg-slate-50'}`}>
                <i className={`${item.icon} text-base`} />
                <span className="flex-1 text-left truncate">{item.display}</span>
                <span className="text-[10px] opacity-60">{item.label}</span>
              </button>
            ))}
          </div>
        )}
        {query.length >= 2 && !loading && results.length === 0 && (
          <div className="px-4 py-6 text-center text-sm text-slate-400">Aucun résultat pour "{query}"</div>
        )}
        {query.length < 2 && (
          <div className="px-4 py-6 text-center text-xs text-slate-400">
            Tapez au moins 2 caractères pour lancer une recherche
            <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-slate-400">
              <span><kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px]">↑↓</kbd> Naviguer</span>
              <span><kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px]">⏎</kbd> Ouvrir</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
