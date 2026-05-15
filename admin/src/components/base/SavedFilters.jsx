import { useState } from 'react';

const STORAGE_KEY = 'trustlink_admin_saved_filters';

function loadFilters() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

function saveFilters(filters) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
}

export default function SavedFilters({ currentFilters, onApply, filterLabel }) {
  const [saved, setSaved] = useState(loadFilters);
  const [showSave, setShowSave] = useState(false);
  const [name, setName] = useState('');

  const handleSave = () => {
    if (!name.trim()) return;
    const newSaved = [...saved, { name: name.trim(), filters: { ...currentFilters }, label: filterLabel }];
    saveFilters(newSaved);
    setSaved(newSaved);
    setName('');
    setShowSave(false);
  };

  const handleDelete = (idx) => {
    const newSaved = saved.filter((_, i) => i !== idx);
    saveFilters(newSaved);
    setSaved(newSaved);
  };

  return (
    <div className="flex items-center gap-2">
      {saved.filter(s => s.label === filterLabel).map((s, i) => (
        <button key={i} onClick={() => onApply(s.filters)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer whitespace-nowrap">
          <i className="ri-bookmark-line text-xs" />{s.name}
          <span onClick={(e) => { e.stopPropagation(); handleDelete(saved.indexOf(s)); }} className="ml-1 hover:text-red-500">×</span>
        </button>
      ))}
      {showSave ? (
        <div className="flex gap-1">
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Nom du filtre..."
            className="w-28 px-2 py-1 border border-slate-200 rounded-lg text-[10px] outline-none"
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); }} />
          <button onClick={handleSave} className="text-[10px] font-semibold text-trustblue hover:underline cursor-pointer">OK</button>
          <button onClick={() => setShowSave(false)} className="text-[10px] text-slate-400 hover:underline cursor-pointer">Annuler</button>
        </div>
      ) : (
        <button onClick={() => setShowSave(true)} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-trustblue hover:bg-blue-50 cursor-pointer whitespace-nowrap">
          <i className="ri-bookmark-line text-xs" />Sauvegarder
        </button>
      )}
    </div>
  );
}
