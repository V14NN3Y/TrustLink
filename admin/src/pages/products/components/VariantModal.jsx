import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function VariantModal({ productId, productName, onClose }) {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;
    supabase.from('product_variants').select('*').eq('product_id', productId).order('sort_order')
      .then(({ data }) => { setVariants(data || []); setLoading(false); });
  }, [productId]);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Variantes : {productName}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-50 cursor-pointer">
            <i className="ri-close-line text-slate-500 text-xl" />
          </button>
        </div>
        <div className="p-5">
          {loading ? (
            <div className="flex justify-center py-8"><div className="w-6 h-6 border-4 border-slate-200 border-t-trustblue rounded-full animate-spin" /></div>
          ) : variants.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Aucune variante pour ce produit</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 text-xs font-semibold text-slate-500 uppercase">Type</th>
                  <th className="text-left py-2 text-xs font-semibold text-slate-500 uppercase">Valeur</th>
                  <th className="text-right py-2 text-xs font-semibold text-slate-500 uppercase">Stock</th>
                  <th className="text-right py-2 text-xs font-semibold text-slate-500 uppercase">Ajust. prix</th>
                </tr>
              </thead>
              <tbody>
                {variants.map(v => (
                  <tr key={v.id} className="border-b border-slate-50">
                    <td className="py-2 text-sm text-slate-600 capitalize">{v.type}</td>
                    <td className="py-2 text-sm font-medium text-slate-800">{v.value}</td>
                    <td className="py-2 text-sm text-right">
                      <span className={`font-semibold ${v.stock_quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>{v.stock_quantity}</span>
                    </td>
                    <td className="py-2 text-sm text-right text-slate-600">
                      {v.price_modifier > 0 ? `+${v.price_modifier}` : v.price_modifier < 0 ? v.price_modifier : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
