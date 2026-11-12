import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' || char === "'") {
      if (inQuotes && line[i + 1] === char) {
        current += char;
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export default function ImportCSVModal({ onClose, onImported }) {
  const { user } = useAuth();
  const fileRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [preview, setPreview] = useState([]);
  const [importStatus, setImportStatus] = useState('pending_review'); // or 'draft'
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);

  useEffect(() => {
    supabase.from('categories').select('id, name, slug').then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      if (lines.length < 2) return;
      const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
      const rows = lines.slice(1, 6).map(line => {
        const vals = parseCSVLine(line);
        const obj = {};
        headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
        return obj;
      });
      setPreview(rows);
      setResult(null);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!user?.id || preview.length === 0) return;
    setImporting(true);
    setProgress(0);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target.result;
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase());
      const rows = lines.slice(1);
      
      const nameIdx = headers.indexOf('name');
      const priceIdx = headers.indexOf('price');
      const stockIdx = headers.indexOf('stock') !== -1 ? headers.indexOf('stock') : headers.indexOf('stock_quantity');
      const descIdx = headers.indexOf('description');
      const catIdx = headers.indexOf('category') !== -1 ? headers.indexOf('category') : headers.indexOf('categorie');
      const imgIdx = headers.indexOf('image_url') !== -1 ? headers.indexOf('image_url') : headers.indexOf('image');

      let success = 0, errors = 0;
      const total = rows.length;

      for (let i = 0; i < total; i++) {
        const line = rows[i];
        if (!line.trim()) continue;
        const vals = parseCSVLine(line);
        const name = vals[nameIdx] || '';
        const price = parseFloat(vals[priceIdx]) || 0;
        const stock = parseInt(vals[stockIdx]) || 20;
        const desc = descIdx !== -1 ? vals[descIdx] || '' : '';
        const catStr = catIdx !== -1 ? vals[catIdx] || '' : '';
        const imgUrl = imgIdx !== -1 ? vals[imgIdx] || '' : '';

        if (!name || price <= 0) {
          errors++;
          continue;
        }

        // Match category
        let categoryId = null;
        if (catStr && categories.length > 0) {
          const matched = categories.find(
            c => c.name.toLowerCase() === catStr.toLowerCase() ||
                 c.slug.toLowerCase() === catStr.toLowerCase()
          );
          if (matched) categoryId = matched.id;
        }

        const { data: newProd, error: insertErr } = await supabase.from('products').insert({
          seller_id: user.id,
          name,
          price,
          stock_quantity: stock,
          description: desc,
          category_id: categoryId,
          status: importStatus,
          delivery_min_days: 2,
          delivery_max_days: 5,
        }).select('id').single();

        if (insertErr || !newProd) {
          errors++;
        } else {
          success++;
          // Insert image if available
          if (imgUrl && imgUrl.startsWith('http')) {
            await supabase.from('product_images').insert({
              product_id: newProd.id,
              url: imgUrl,
              is_primary: true,
              sort_order: 0,
            });
          }
        }

        setProgress(Math.round(((i + 1) / total) * 100));
      }

      setResult({ success, errors });
      setImporting(false);
      if (onImported) onImported();
    };
    reader.readAsText(fileRef.current?.files?.[0]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#125C8D]/10 flex items-center justify-center text-[#125C8D]">
              <i className="ri-file-upload-line text-lg" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Importer des produits (CSV)</h3>
              <p className="text-xs text-gray-500">Ajout par lot de produits dans votre catalogue</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer text-gray-400 hover:text-gray-600">
            <i className="ri-close-line text-xl" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-100">
            <p className="text-xs font-semibold text-blue-800 mb-1 flex items-center gap-1.5">
              <i className="ri-information-line text-sm" /> Colonnes supportées :
            </p>
            <code className="text-[11px] text-blue-700 block font-mono bg-white/70 p-2 rounded-lg border border-blue-100/80">
              name, price, stock, description, category, image_url
            </code>
            <p className="text-[11px] text-blue-600 mt-1.5">
              Les prix doivent être en FCFA. Si une URL d'image est présente, elle sera automatiquement associée.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Statut initial des produits :</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setImportStatus('pending_review')}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                  importStatus === 'pending_review'
                    ? 'border-[#125C8D] bg-blue-50/60 text-[#125C8D]'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                Soumettre pour validation
              </button>
              <button
                type="button"
                onClick={() => setImportStatus('draft')}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border text-center transition-all cursor-pointer ${
                  importStatus === 'draft'
                    ? 'border-[#125C8D] bg-blue-50/60 text-[#125C8D]'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                Sauvegarder en brouillon
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Sélectionner le fichier CSV :</label>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              onChange={handleFile}
              className="w-full text-sm file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#125C8D] file:text-white hover:file:bg-[#0e4870] cursor-pointer border border-gray-200 rounded-xl p-1"
            />
          </div>

          {preview.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center justify-between">
                <span>Aperçu des 5 premières lignes :</span>
                <span className="text-[11px] text-[#125C8D] font-medium">{preview.length} détectées</span>
              </p>
              <div className="bg-gray-50 rounded-xl p-3 text-xs font-mono space-y-1.5 max-h-40 overflow-y-auto border border-gray-100">
                {preview.map((row, i) => (
                  <div key={i} className="text-gray-700 truncate border-b border-gray-200/50 pb-1 last:border-0">
                    <span className="font-semibold text-gray-900">{row.name || 'Sans titre'}</span> · {row.price || '0'} FCFA · {row.stock || '20'} unités
                    {row.category && <span className="text-blue-600 ml-1">({row.category})</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {importing && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-gray-600 font-semibold">
                <span>Import en cours...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#125C8D] transition-all duration-200 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {result && (
            <div className={`p-4 rounded-xl text-sm flex items-center gap-3 ${
              result.errors > 0 ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-green-50 text-green-800 border border-green-200'
            }`}>
              <i className={`text-xl ${result.errors > 0 ? 'ri-error-warning-line text-amber-600' : 'ri-checkbox-circle-line text-green-600'}`} />
              <div>
                <p className="font-semibold">Import terminé</p>
                <p className="text-xs mt-0.5">{result.success} produit(s) importé(s) avec succès · {result.errors} erreur(s)</p>
              </div>
            </div>
          )}

          <div className="flex gap-2.5 pt-2">
            <button
              onClick={handleImport}
              disabled={importing || preview.length === 0}
              className="flex-1 py-2.5 bg-[#125C8D] hover:bg-[#0e4870] text-white rounded-xl font-semibold text-sm cursor-pointer disabled:opacity-50 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              {importing ? (
                <>
                  <i className="ri-loader-4-line animate-spin" />
                  Importation ({progress}%)...
                </>
              ) : (
                <>
                  <i className="ri-upload-2-line" />
                  Importer les produits
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="py-2.5 px-4 border border-gray-200 hover:bg-gray-50 rounded-xl text-sm font-semibold text-gray-600 cursor-pointer transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
