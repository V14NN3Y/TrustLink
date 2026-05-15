import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function VariantsEditor({ productId }) {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newVariant, setNewVariant] = useState({ type: 'size', value: '', stock_quantity: 0, price_modifier: 0 });

  useEffect(() => {
    if (!productId) { setLoading(false); return; }
    supabase.from('product_variants').select('*').eq('product_id', productId).order('sort_order')
      .then(({ data }) => { setVariants(data || []); setLoading(false); });
  }, [productId]);

  const addVariant = async () => {
    if (!newVariant.value || !productId) return;
    const { data } = await supabase.from('product_variants').insert({
      product_id: productId, type: newVariant.type, value: newVariant.value,
      stock_quantity: newVariant.stock_quantity, price_modifier: newVariant.price_modifier,
    }).select().single();
    if (data) setVariants(v => [...v, data]);
    setNewVariant({ type: 'size', value: '', stock_quantity: 0, price_modifier: 0 });
  };

  const deleteVariant = async (id) => {
    await supabase.from('product_variants').delete().eq('id', id);
    setVariants(v => v.filter(x => x.id !== id));
  };

  if (!productId) return <p className="text-xs text-gray-400">Créez d'abord le produit pour ajouter des variantes</p>;

  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Variantes (tailles, couleurs, matériaux)</p>
      {variants.length > 0 && (
        <div className="space-y-1 mb-3">
          {variants.map(v => (
            <div key={v.id} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-xs">
              <span className="font-semibold text-gray-600 capitalize w-16">{v.type}</span>
              <span className="text-gray-800 flex-1">{v.value}</span>
              <span className="text-gray-500">Stock: {v.stock_quantity}</span>
              {v.price_modifier !== 0 && <span className="text-gray-500">Ajust: {v.price_modifier > 0 ? '+' : ''}{v.price_modifier}</span>}
              <button onClick={() => deleteVariant(v.id)} className="text-red-400 hover:text-red-600 cursor-pointer"><i className="ri-close-line text-sm" /></button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-1.5 items-end flex-wrap">
        <select value={newVariant.type} onChange={e => setNewVariant(f => ({ ...f, type: e.target.value }))}
          className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs outline-none">
          <option value="size">Taille</option>
          <option value="color">Couleur</option>
          <option value="material">Matériau</option>
        </select>
        <input value={newVariant.value} onChange={e => setNewVariant(f => ({ ...f, value: e.target.value }))}
          placeholder="Valeur" className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-xs outline-none" />
        <input type="number" value={newVariant.stock_quantity} onChange={e => setNewVariant(f => ({ ...f, stock_quantity: parseInt(e.target.value) || 0 }))}
          placeholder="Stock" className="w-16 px-2 py-1.5 border border-gray-200 rounded-lg text-xs outline-none" />
        <input type="number" value={newVariant.price_modifier} onChange={e => setNewVariant(f => ({ ...f, price_modifier: parseInt(e.target.value) || 0 }))}
          placeholder="Ajust." className="w-16 px-2 py-1.5 border border-gray-200 rounded-lg text-xs outline-none" />
        <button onClick={addVariant} disabled={!newVariant.value}
          className="px-2.5 py-1.5 bg-[#125C8D] text-white rounded-lg text-xs font-semibold disabled:opacity-50 cursor-pointer">+</button>
      </div>
    </div>
  );
}
