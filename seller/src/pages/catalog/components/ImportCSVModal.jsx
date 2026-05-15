import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';

export default function ImportCSVModal({ onClose, onImported }) {
  const { user } = useAuth();
  const fileRef = useRef(null);
  const [preview, setPreview] = useState([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length < 2) return;
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const rows = lines.slice(1).map(line => {
        const vals = line.split(',').map(v => v.trim());
        const obj = {};
        headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
        return obj;
      });
      setPreview(rows.slice(0, 5));
      setResult(null);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!user?.id || preview.length === 0) return;
    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target.result;
      const lines = text.split('\n').filter(l => l.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const rows = lines.slice(1);
      let success = 0, errors = 0;
      for (const line of rows) {
        const vals = line.split(',').map(v => v.trim());
        const name = vals[headers.indexOf('name')] || '';
        const price = parseFloat(vals[headers.indexOf('price')]) || 0;
        const stock = parseInt(vals[headers.indexOf('stock')]) || 0;
        if (!name || !price) { errors++; continue; }
        const { error } = await supabase.from('products').insert({
          seller_id: user.id, name, price, stock_quantity: stock,
          description: vals[headers.indexOf('description')] || '',
          status: 'draft',
        });
        if (error) errors++; else success++;
      }
      setResult({ success, errors });
      setImporting(false);
      if (onImported) onImported();
    };
    reader.readAsText(fileRef.current?.files?.[0]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">Importer des produits (CSV)</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"><i className="ri-close-line text-xl text-gray-500" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
            <p className="text-xs font-semibold text-blue-700 mb-1">Format attendu :</p>
            <code className="text-[10px] text-blue-600">name,price,stock,description<br />"Mon produit",15000,50,"Description optionnelle"</code>
          </div>
          <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="w-full text-sm file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#125C8D] file:text-white cursor-pointer" />
          {preview.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">Aperçu ({preview.length} lignes) :</p>
              <div className="bg-gray-50 rounded-xl p-3 text-xs font-mono space-y-1">
                {preview.map((row, i) => <div key={i} className="text-gray-700">{row.name} · {row.price} FCFA · {row.stock} unités</div>)}
              </div>
            </div>
          )}
          {result && (
            <div className={`p-3 rounded-xl text-sm ${result.errors > 0 ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}>
              {result.success} importé(s), {result.errors} erreur(s)
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={handleImport} disabled={importing || preview.length === 0}
              className="flex-1 py-2.5 bg-[#125C8D] text-white rounded-xl font-semibold text-sm cursor-pointer disabled:opacity-50">
              {importing ? 'Import...' : 'Importer'}
            </button>
            <button onClick={onClose} className="py-2.5 px-4 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 cursor-pointer">Annuler</button>
          </div>
        </div>
      </div>
    </div>
  );
}
