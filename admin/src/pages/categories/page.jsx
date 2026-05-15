import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';

export default function CategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', image_url: '', parent_id: '' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [saved, setSaved] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*, parent:parent_id(name)').order('name');
    setCategories(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setEditItem(null);
    setForm({ name: '', slug: '', description: '', image_url: '', parent_id: '' });
  };

  const openEdit = (cat) => {
    setEditItem(cat);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', image_url: cat.image_url || '', parent_id: cat.parent_id || '' });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.slug) return;
    setSaving(true);
    const payload = { ...form, parent_id: form.parent_id || null, image_url: form.image_url || null, description: form.description || null };
    if (editItem) {
      await supabase.from('categories').update(payload).eq('id', editItem.id);
    } else {
      await supabase.from('categories').insert(payload);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    resetForm();
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette catégorie ? Les produits associés ne seront plus catégorisés.')) return;
    setDeleting(id);
    await supabase.from('categories').delete().eq('id', id);
    setDeleting(null);
    load();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Poppins, sans-serif' }}>Catégories</h1>
          <p className="text-sm text-slate-500 mt-0.5">Gérez les catégories de produits</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulaire */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 h-fit sticky top-6">
          <h3 className="font-semibold text-slate-800 mb-4">{editItem ? 'Modifier' : 'Nouvelle'} catégorie</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Nom *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: editItem ? f.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }))}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-trustblue" placeholder="Mode & Vêtements" required />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Slug *</label>
              <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-trustblue" placeholder="mode-vetements" required />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-trustblue resize-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Image URL</label>
              <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-trustblue" placeholder="https://..." />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Catégorie parente</label>
              <select value={form.parent_id} onChange={e => setForm(f => ({ ...f, parent_id: e.target.value }))}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-trustblue">
                <option value="">— Aucune (racine) —</option>
                {categories.filter(c => c.id !== editItem?.id).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            {saved && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-emerald-700 text-sm flex items-center gap-2">
                <i className="ri-checkbox-circle-line" />Catégorie {editItem ? 'modifiée' : 'créée'}
              </div>
            )}
            <div className="flex gap-2">
              <button type="submit" disabled={saving}
                className="flex-1 py-2.5 bg-trustblue text-white rounded-xl font-semibold text-sm cursor-pointer disabled:opacity-50">
                {saving ? 'Sauvegarde...' : editItem ? 'Mettre à jour' : 'Créer'}
              </button>
              {editItem && (
                <button type="button" onClick={resetForm}
                  className="py-2.5 px-4 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 cursor-pointer hover:bg-slate-50">
                  Annuler
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Liste */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-trustblue rounded-full animate-spin" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <i className="ri-folder-open-line text-3xl mb-2 block" />
              <p className="text-sm">Aucune catégorie</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {categories.map(cat => (
                <div key={cat.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-all">
                  {cat.image_url ? (
                    <img src={cat.image_url} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <i className="ri-folder-2-line text-trustblue text-sm" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800">{cat.name}</p>
                      <span className="text-[10px] font-mono text-slate-400">/ {cat.slug}</span>
                      {cat.parent && <span className="text-[10px] text-slate-400">sous {cat.parent.name}</span>}
                    </div>
                    {cat.description && <p className="text-xs text-slate-500 mt-0.5 truncate">{cat.description}</p>}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => openEdit(cat)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-trustblue cursor-pointer transition-colors">
                      <i className="ri-edit-line text-sm" />
                    </button>
                    <button onClick={() => handleDelete(cat.id)} disabled={deleting === cat.id}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 cursor-pointer transition-colors disabled:opacity-50">
                      <i className="ri-delete-bin-line text-sm" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
