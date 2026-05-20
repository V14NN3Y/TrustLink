import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ToggleSwitch from '@/components/base/ToggleSwitch';

const ICON_OPTIONS = [
  { value: 'ri-t-shirt-line', label: 'Mode' },
  { value: 'ri-shirt-line', label: 'Chemise' },
  { value: 'ri-women-line', label: 'Robe' },
  { value: 'ri-footprint-line', label: 'Chaussures' },
  { value: 'ri-shopping-bag-line', label: 'Sac' },
  { value: 'ri-gemini-line', label: 'Bijou' },
  { value: 'ri-scissors-cut-line', label: 'Tissu' },
  { value: 'ri-smartphone-line', label: 'Smartphone' },
  { value: 'ri-computer-line', label: 'Ordinateur' },
  { value: 'ri-usb-line', label: 'Accessoire' },
  { value: 'ri-headphone-line', label: 'Audio' },
  { value: 'ri-sparkling-line', label: 'Beauté' },
  { value: 'ri-palette-line', label: 'Maquillage' },
  { value: 'ri-hand-sanitizer-line', label: 'Soin' },
  { value: 'ri-flower-line', label: 'Parfum' },
  { value: 'ri-scissors-line', label: 'Cheveux' },
  { value: 'ri-home-3-line', label: 'Maison' },
  { value: 'ri-armchair-line', label: 'Meuble' },
  { value: 'ri-cup-line', label: 'Cuisine' },
  { value: 'ri-paint-brush-line', label: 'Déco' },
  { value: 'ri-hotel-bed-line', label: 'Literie' },
  { value: 'ri-run-line', label: 'Sport' },
  { value: 'ri-body-scan-line', label: 'Fitness' },
  { value: 'ri-bike-line', label: 'Vélo' },
  { value: 'ri-tent-line', label: 'Camping' },
  { value: 'ri-car-line', label: 'Auto' },
  { value: 'ri-tools-line', label: 'Pièce auto' },
  { value: 'ri-steering-line', label: 'Accessoire auto' },
  { value: 'ri-oil-line', label: 'Huile' },
  { value: 'ri-restaurant-line', label: 'Alimentation' },
  { value: 'ri-heart-pulse-line', label: 'Santé' },
  { value: 'ri-price-tag-3-line', label: 'Générique' },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', icon: 'ri-price-tag-3-line', parent_id: '', is_active: true, sort_order: 0 });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*, parent:parent_id(name)').order('sort_order', { ascending: true }).order('name');
    setCategories(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setEditItem(null);
    setForm({ name: '', slug: '', icon: 'ri-price-tag-3-line', parent_id: '', is_active: true, sort_order: 0 });
  };

  const openEdit = (cat) => {
    setEditItem(cat);
    setForm({
      name: cat.name, slug: cat.slug, icon: cat.icon || 'ri-price-tag-3-line',
      parent_id: cat.parent_id || '', is_active: cat.is_active !== false, sort_order: cat.sort_order || 0,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.slug) return;
    setSaving(true);
    const payload = {
      name: form.name, slug: form.slug, icon: form.icon,
      parent_id: form.parent_id || null,
      is_active: form.is_active,
      sort_order: parseInt(form.sort_order) || 0,
    };
    if (editItem) {
      const { error } = await supabase.from('categories').update(payload).eq('id', editItem.id);
      if (error) { alert('Erreur: ' + error.message); setSaving(false); return; }
    } else {
      const { error } = await supabase.from('categories').insert(payload);
      if (error) { alert('Erreur: ' + error.message); setSaving(false); return; }
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    resetForm();
    load();
  };

  const handleDelete = async (id) => {
    const children = categories.filter(c => c.parent_id === id);
    const msg = children.length > 0
      ? `Cette catégorie a ${children.length} sous-catégorie(s). Les supprimer aussi ?`
      : 'Supprimer cette catégorie ? Les produits associés ne seront plus catégorisés.';
    if (!confirm(msg)) return;
    setDeleting(id);
    if (children.length > 0) await supabase.from('categories').delete().eq('parent_id', id);
    await supabase.from('categories').delete().eq('id', id);
    setDeleting(null);
    load();
  };

  const toggleActive = async (cat) => {
    await supabase.from('categories').update({ is_active: !cat.is_active }).eq('id', cat.id);
    load();
  };

  const moveUp = async (cat) => {
    const sorted = categories.filter(c => !c.parent_id).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    const idx = sorted.findIndex(c => c.id === cat.id);
    if (idx <= 0) return;
    const prev = sorted[idx - 1];
    await supabase.from('categories').update({ sort_order: prev.sort_order || 0 }).eq('id', cat.id);
    await supabase.from('categories').update({ sort_order: cat.sort_order || 0 }).eq('id', prev.id);
    load();
  };
  const moveDown = async (cat) => {
    const sorted = categories.filter(c => !c.parent_id).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    const idx = sorted.findIndex(c => c.id === cat.id);
    if (idx >= sorted.length - 1) return;
    const next = sorted[idx + 1];
    await supabase.from('categories').update({ sort_order: next.sort_order || 0 }).eq('id', cat.id);
    await supabase.from('categories').update({ sort_order: cat.sort_order || 0 }).eq('id', next.id);
    load();
  };

  const getChildren = (parentId) => categories.filter(c => c.parent_id === parentId)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0) || a.name.localeCompare(b.name));

  const rootCategories = categories.filter(c => !c.parent_id)
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0) || a.name.localeCompare(b.name));

  const filtered = rootCategories.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.slug.toLowerCase().includes(search.toLowerCase())
  );

  const renderRow = (cat, depth = 0) => (
    <div key={cat.id}>
      <div className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-all border-b border-slate-50"
        style={{ paddingLeft: `${16 + depth * 28}px` }}>
        <ToggleSwitch enabled={cat.is_active} onClick={() => toggleActive(cat)} size="sm" />
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
          <i className={`${cat.icon || 'ri-price-tag-3-line'} text-sm text-trustblue`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-slate-800">{cat.name}</p>
            <span className="text-[10px] font-mono text-slate-400">/{cat.slug}</span>
            {!cat.is_active && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">Masquée</span>
            )}
          </div>
        </div>
        {depth === 0 && (
          <div className="flex gap-0.5 flex-shrink-0">
            <button onClick={() => moveUp(cat)} disabled={filtered.indexOf(cat) === 0}
              className="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-20 cursor-pointer">
              <i className="ri-arrow-up-s-line text-sm" />
            </button>
            <button onClick={() => moveDown(cat)} disabled={filtered.indexOf(cat) === filtered.length - 1}
              className="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-20 cursor-pointer">
              <i className="ri-arrow-down-s-line text-sm" />
            </button>
          </div>
        )}
        <div className="flex gap-1 flex-shrink-0">
          <button onClick={() => openEdit(cat)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-trustblue cursor-pointer transition-colors" title="Modifier">
            <i className="ri-edit-line text-sm" />
          </button>
          <button onClick={() => handleDelete(cat.id)} disabled={deleting === cat.id}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 cursor-pointer transition-colors disabled:opacity-50" title="Supprimer">
            <i className="ri-delete-bin-line text-sm" />
          </button>
        </div>
      </div>
      {getChildren(cat.id).map(child => renderRow(child, depth + 1))}
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Poppins, sans-serif' }}>Catégories</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {categories.filter(c => c.is_active && !c.parent_id).length} actives · {categories.filter(c => !c.is_active).length} masquées · {rootCategories.length} racines · {categories.length} totale{categories.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Formulaire */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 h-fit sticky top-6">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <i className={`${editItem ? 'ri-edit-line' : 'ri-add-line'} text-trustblue`} />
            {editItem ? 'Modifier' : 'Nouvelle'} catégorie
          </h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
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
            </div>

            {/* Icône Remix — grille de sélection */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Icône</label>
              <div className="grid grid-cols-6 gap-1.5 max-h-40 overflow-y-auto p-1.5 border border-slate-200 rounded-xl">
                {ICON_OPTIONS.map(opt => (
                  <button key={opt.value} type="button" onClick={() => setForm(f => ({ ...f, icon: opt.value }))}
                    className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-all cursor-pointer ${form.icon === opt.value ? 'bg-trustblue text-white' : 'hover:bg-slate-50 text-slate-600'}`}
                    title={opt.label}>
                    <i className={`${opt.value} text-base`} />
                    <span className="text-[8px] leading-tight text-center truncate w-full">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Catégorie parente</label>
                <select value={form.parent_id} onChange={e => setForm(f => ({ ...f, parent_id: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-trustblue">
                  <option value="">— Aucune (racine) —</option>
                  {categories.filter(c => c.id !== editItem?.id && !c.parent_id).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Ordre d'affichage</label>
                <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-trustblue" placeholder="0" />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
              <div>
                <p className="text-sm font-semibold text-slate-800">Visible sur la boutique</p>
                <p className="text-xs text-slate-500">{form.is_active ? 'Les acheteurs voient cette catégorie' : 'Catégorie masquée pour les acheteurs'}</p>
              </div>
              <ToggleSwitch enabled={form.is_active} onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))} size="md" />
            </div>

            {saved && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-emerald-700 text-sm flex items-center gap-2">
                <i className="ri-checkbox-circle-line" />Catégorie {editItem ? 'modifiée' : 'créée'}
              </div>
            )}
            <div className="flex gap-2">
              <button type="submit" disabled={saving}
                className="flex-1 py-2.5 bg-trustblue text-white rounded-xl font-semibold text-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sauvegarde...</> : <><i className="ri-check-line" /> {editItem ? 'Mettre à jour' : 'Créer'}</>}
              </button>
              {editItem && (
                <button type="button" onClick={resetForm}
                  className="py-2.5 px-4 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 cursor-pointer hover:bg-slate-50">Annuler</button>
              )}
            </div>
          </form>
        </div>

        {/* Liste */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-3">
            <i className="ri-search-line text-slate-400 text-sm" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une catégorie..."
              className="flex-1 text-sm outline-none bg-transparent" />
            {categories.filter(c => !c.is_active).length > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">
                {categories.filter(c => !c.is_active).length} masquée{categories.filter(c => !c.is_active).length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-trustblue rounded-full animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <i className="ri-folder-open-line text-3xl mb-2 block" />
              <p className="text-sm">{search ? 'Aucune catégorie trouvée' : 'Aucune catégorie'}</p>
              {!search && <p className="text-xs mt-1">Créez votre première catégorie</p>}
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 px-5 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                <div className="w-8 flex-shrink-0" />
                <div className="w-8 flex-shrink-0" />
                <div className="flex-1">Catégorie</div>
                <div className="w-12 flex-shrink-0 text-center">Ordre</div>
                <div className="w-16 flex-shrink-0 text-right">Actions</div>
              </div>
              {filtered.map(cat => renderRow(cat))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
