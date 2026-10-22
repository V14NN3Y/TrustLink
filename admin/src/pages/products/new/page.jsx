import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabaseClient';
import { useSupabaseProductCreate } from '@/hooks/useSupabaseProductCreate';

const initialForm = {
  name: '',
  category_id: '',
  description: '',
  price: 0,
  stock_quantity: 0,
  imageFiles: [],
  imagePreviews: [],
};

const STEPS = [
  { num: 1, label: 'Informations' },
  { num: 2, label: 'Prix & stock' },
  { num: 3, label: 'Récapitulatif' },
];

export default function ProductNewPage() {
  const navigate = useNavigate();
  const { createProduct, submitting } = useSupabaseProductCreate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    supabase.from('categories').select('id, name').order('name')
      .then(({ data }) => { if (data) setCategories(data); });
  }, []);

  const handleChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleImageFiles = (files) => {
    const list = Array.from(files || []).filter(f => f.type.startsWith('image/'));
    if (!list.length) return;
    const previews = list.map(f => URL.createObjectURL(f));
    setForm(prev => ({
      ...prev,
      imageFiles: [...prev.imageFiles, ...list],
      imagePreviews: [...prev.imagePreviews, ...previews],
    }));
  };

  const removeImage = (idx) => {
    setForm(prev => ({
      ...prev,
      imageFiles: prev.imageFiles.filter((_, i) => i !== idx),
      imagePreviews: prev.imagePreviews.filter((_, i) => i !== idx),
    }));
  };

  const getCatName = (id) => categories.find(c => c.id === id)?.name || '—';

  const canNext1 = form.name.trim() && form.category_id;
  const canSubmit = canNext1 && form.price > 0 && form.stock_quantity >= 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setError(null);
    const { success, error: err } = await createProduct({
      name: form.name,
      description: form.description,
      category_id: form.category_id,
      price: form.price,
      stock_quantity: form.stock_quantity,
      imageFiles: form.imageFiles,
    });
    if (!success) {
      setError(err || 'Erreur lors de la création du produit.');
      return;
    }
    toast.success('Produit publié dans le catalogue');
    navigate('/products');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div>
        <h1 className="font-bold text-slate-800 text-2xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Nouveau produit
        </h1>
        <p className="text-sm text-slate-400">Publié directement dans le catalogue, sans étape de modération.</p>
      </div>

      <div className="flex items-center">
        {STEPS.map((s, i) => (
          <div key={s.num} className="flex items-center flex-1">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${step >= s.num ? 'bg-trustblue text-white' : 'bg-slate-100 text-slate-400'}`}>
                {step > s.num ? <i className="ri-check-line" /> : s.num}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${step >= s.num ? 'text-trustblue' : 'text-slate-400'}`}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <div className="flex-1 h-px bg-slate-200 mx-3" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 block mb-1.5">Nom du produit</label>
            <input
              value={form.name}
              onChange={e => handleChange('name', e.target.value)}
              placeholder="Ex: Robe wax imprimée"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-trustblue"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 block mb-1.5">Catégorie</label>
            <select
              value={form.category_id}
              onChange={e => handleChange('category_id', e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-trustblue bg-white"
            >
              <option value="">Sélectionner une catégorie</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 block mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={e => handleChange('description', e.target.value)}
              rows={4}
              placeholder="Décrivez le produit..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-trustblue resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 block mb-1.5">Photos</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => handleImageFiles(e.target.files)}
            />
            {form.imagePreviews.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mb-2">
                {form.imagePreviews.map((src, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white shadow flex items-center justify-center text-slate-500 hover:text-red-500 cursor-pointer"
                    >
                      <i className="ri-close-line text-xs" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div
              className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-trustblue transition-colors group"
              onClick={() => fileInputRef.current?.click()}
            >
              <i className="ri-image-add-line text-3xl text-slate-300 group-hover:text-trustblue transition-colors mb-2 block" />
              <p className="text-sm font-medium text-slate-500 group-hover:text-trustblue">Ajouter des photos</p>
              <p className="text-xs text-slate-400 mt-1">JPG, PNG — 5 Mo max par image</p>
            </div>
          </div>
          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              <i className="ri-error-warning-line mr-1" />{error}
            </div>
          )}
          <div className="flex justify-end">
            <button
              onClick={() => setStep(2)}
              disabled={!canNext1}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer disabled:opacity-40 hover:opacity-90 transition-opacity bg-trustblue"
            >
              Suivant <i className="ri-arrow-right-line ml-1" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 block mb-1.5">Prix (XOF)</label>
            <input
              type="number"
              min="0"
              value={form.price || ''}
              onChange={e => handleChange('price', Number(e.target.value))}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-trustblue"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 block mb-1.5">Stock disponible</label>
            <input
              type="number"
              min="0"
              value={form.stock_quantity || ''}
              onChange={e => handleChange('stock_quantity', Number(e.target.value))}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-trustblue"
            />
          </div>
          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 cursor-pointer"
            >
              <i className="ri-arrow-left-line mr-1" />Retour
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={form.price <= 0}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer disabled:opacity-40 hover:opacity-90 transition-opacity bg-trustblue"
            >
              Suivant <i className="ri-arrow-right-line ml-1" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Récapitulatif</h3>
          {form.imagePreviews[0] && (
            <div className="mb-4 w-full h-40 rounded-xl overflow-hidden border border-slate-100">
              <img src={form.imagePreviews[0]} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Nom</span>
              <span className="font-semibold text-slate-800 text-right max-w-xs truncate">{form.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Catégorie</span>
              <span className="font-semibold text-slate-800">{getCatName(form.category_id)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Prix</span>
              <span className="font-semibold text-slate-800">{form.price.toLocaleString()} XOF</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Stock</span>
              <span className="font-semibold text-slate-800">{form.stock_quantity} unité(s)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Statut initial</span>
              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-600">Approuvé — publié immédiatement</span>
            </div>
          </div>
          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mt-4">
              <i className="ri-error-warning-line mr-1" />{error}
            </div>
          )}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 cursor-pointer"
            >
              <i className="ri-arrow-left-line mr-1" />Retour
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !canSubmit}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer disabled:opacity-40 hover:opacity-90 transition-opacity bg-trustblue"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Publication...
                </span>
              ) : (
                <><i className="ri-check-line mr-1" />Publier le produit</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
