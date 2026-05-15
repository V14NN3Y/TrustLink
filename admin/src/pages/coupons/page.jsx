import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({
    code: '', discount_type: 'percentage', discount_value: '', min_order_amount: 0,
    max_uses: null, expires_at: '', active: true,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    setCoupons(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setEditItem(null);
    setForm({ code: '', discount_type: 'percentage', discount_value: '', min_order_amount: 0, max_uses: null, expires_at: '', active: true });
  };

  const openEdit = (c) => {
    setEditItem(c);
    setForm({
      code: c.code, discount_type: c.discount_type, discount_value: String(c.discount_value),
      min_order_amount: c.min_order_amount, max_uses: c.max_uses, expires_at: c.expires_at ? c.expires_at.slice(0, 16) : '', active: c.active,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.code || !form.discount_value) return;
    setSaving(true);
    const payload = {
      code: form.code.toUpperCase().replace(/\s+/g, ''),
      discount_type: form.discount_type,
      discount_value: parseFloat(form.discount_value),
      min_order_amount: parseFloat(form.min_order_amount) || 0,
      max_uses: form.max_uses ? parseInt(form.max_uses) : null,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      active: form.active,
    };
    if (editItem) {
      await supabase.from('coupons').update(payload).eq('id', editItem.id);
    } else {
      await supabase.from('coupons').insert(payload);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    resetForm();
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce coupon ?')) return;
    await supabase.from('coupons').delete().eq('id', id);
    load();
  };

  const toggleActive = async (c) => {
    await supabase.from('coupons').update({ active: !c.active }).eq('id', c.id);
    load();
  };

  const filtered = coupons.filter(c => !search || c.code.toLowerCase().includes(search.toLowerCase()) || c.discount_type.includes(search));
  const stats = {
    total: coupons.length, active: coupons.filter(c => c.active).length,
    totalUses: coupons.reduce((s, c) => s + (c.used_count || 0), 0),
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Poppins, sans-serif' }}>Coupons promo</h1>
          <p className="text-sm text-slate-500 mt-0.5">Gérez les codes promotionnels</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <p className="text-xs text-slate-500">Total coupons</p>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <p className="text-xs text-slate-500">Actifs</p>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <p className="text-xs text-slate-500">Utilisations totales</p>
          <p className="text-2xl font-bold text-trustblue">{stats.totalUses}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 h-fit sticky top-6">
          <h3 className="font-semibold text-slate-800 mb-4">{editItem ? 'Modifier' : 'Nouveau'} coupon</h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Code *</label>
              <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-trustblue font-mono" placeholder="PROMO20" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Type</label>
                <select value={form.discount_type} onChange={e => setForm(f => ({ ...f, discount_type: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-trustblue">
                  <option value="percentage">Pourcentage (%)</option>
                  <option value="fixed">Montant fixe (FCFA)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Valeur *</label>
                <input type="number" value={form.discount_value} onChange={e => setForm(f => ({ ...f, discount_value: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-trustblue" placeholder="20" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Montant min. commande</label>
                <input type="number" value={form.min_order_amount} onChange={e => setForm(f => ({ ...f, min_order_amount: e.target.value }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-trustblue" placeholder="0" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Utilisations max</label>
                <input type="number" value={form.max_uses || ''} onChange={e => setForm(f => ({ ...f, max_uses: e.target.value || null }))}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-trustblue" placeholder="Illimité" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Expire le</label>
              <input type="datetime-local" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-trustblue" />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Actif</label>
              <button type="button" onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                className={`relative rounded-full w-11 h-6 transition-colors ${form.active ? 'bg-green-500' : 'bg-slate-200'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.active ? 'translate-x-5' : ''}`} />
              </button>
            </div>
            {saved && <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-emerald-700 text-sm flex items-center gap-2"><i className="ri-checkbox-circle-line" />Coupon {editItem ? 'modifié' : 'créé'}</div>}
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-trustblue text-white rounded-xl font-semibold text-sm cursor-pointer disabled:opacity-50">
                {saving ? 'Sauvegarde...' : editItem ? 'Mettre à jour' : 'Créer'}
              </button>
              {editItem && <button type="button" onClick={resetForm} className="py-2.5 px-4 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 cursor-pointer hover:bg-slate-50">Annuler</button>}
            </div>
          </form>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un code..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-trustblue" />
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-slate-200 border-t-trustblue rounded-full animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400"><i className="ri-coupon-3-line text-3xl mb-2 block" /><p className="text-sm">Aucun coupon</p></div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filtered.map(c => (
                <div key={c.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-bold text-trustblue">{c.code}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {c.discount_type === 'percentage' ? `${c.discount_value}%` : `${Number(c.discount_value).toLocaleString()} FCFA`}
                      </span>
                      <button onClick={() => toggleActive(c)} className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer ${c.active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                        {c.active ? 'Actif' : 'Inactif'}
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {c.used_count || 0}/{c.max_uses || '∞'} utilisations · Min. {Number(c.min_order_amount).toLocaleString()} FCFA
                      {c.expires_at && <> · Expire le {new Date(c.expires_at).toLocaleDateString('fr-FR')}</>}
                    </p>
                  </div>
                  <button onClick={() => openEdit(c)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-trustblue cursor-pointer">
                    <i className="ri-edit-line text-sm" />
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 cursor-pointer">
                    <i className="ri-delete-bin-line text-sm" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
