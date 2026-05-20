import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ToggleSwitch from '@/components/base/ToggleSwitch';

export default function DeliveryCitiesPage() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [newName, setNewName] = useState('');

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('delivery_cities').select('*').order('sort_order');
    setCities(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (city) => {
    await supabase.from('delivery_cities').update({ is_active: !city.is_active }).eq('id', city.id);
    load();
  };

  const addCity = async () => {
    if (!newName.trim()) return;
    const { error } = await supabase.from('delivery_cities').insert({
      name: newName.trim(),
      sort_order: cities.length + 1,
    });
    if (!error) {
      setNewName('');
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      load();
    }
  };

  const editCity = async (city, field, value) => {
    await supabase.from('delivery_cities').update({ [field]: value }).eq('id', city.id);
    load();
  };

  const deleteCity = async (city) => {
    if (!confirm(`Supprimer "${city.name}" ?`)) return;
    await supabase.from('delivery_cities').delete().eq('id', city.id);
    load();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Poppins, sans-serif' }}>Villes de livraison</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {cities.filter(c => c.is_active).length} actives · {cities.filter(c => !c.is_active).length} désactivées
        </p>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-emerald-700 text-sm flex items-center gap-2">
          <i className="ri-checkbox-circle-line" />Mise à jour enregistrée
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 h-fit">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <i className="ri-add-line text-trustblue" />Ajouter une ville
          </h3>
          <div className="flex gap-2">
            <input value={newName} onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCity()}
              className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-trustblue"
              placeholder="Nom de la ville" />
            <button onClick={addCity} disabled={!newName.trim()}
              className="px-4 py-2.5 bg-trustblue text-white rounded-xl font-semibold text-sm cursor-pointer disabled:opacity-50">
              Ajouter
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="grid grid-cols-12 gap-3 px-5 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
            <div className="col-span-5">Ville</div>
            <div className="col-span-2 text-center">Actif</div>
            <div className="col-span-2 text-center">Ordre</div>
            <div className="col-span-3 text-right">Actions</div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-32"><div className="w-8 h-8 border-4 border-slate-200 border-t-trustblue rounded-full animate-spin" /></div>
          ) : cities.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <i className="ri-map-pin-line text-3xl mb-2 block" />
              <p className="text-sm">Aucune ville</p>
            </div>
          ) : (
            cities.map(c => (
              <div key={c.id} className="grid grid-cols-12 gap-3 items-center px-5 py-3 hover:bg-slate-50 border-b border-slate-50">
                <div className="col-span-5 flex items-center gap-2">
                  <i className="ri-map-pin-line text-sm text-slate-300" />
                  <span className={`text-sm ${c.is_active ? 'text-slate-800' : 'text-slate-400'}`}>{c.name}</span>
                  {!c.is_active && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">Désactivée</span>
                  )}
                </div>
                <div className="col-span-2 flex justify-center">
                  <ToggleSwitch enabled={c.is_active} onClick={() => toggleActive(c)} size="sm" />
                </div>
                <div className="col-span-2 flex justify-center gap-1">
                  <button onClick={() => {
                    const idx = cities.indexOf(c);
                    if (idx > 0) {
                      const prev = cities[idx - 1];
                      editCity(c, 'sort_order', prev.sort_order);
                      editCity(prev, 'sort_order', c.sort_order);
                    }
                  }} disabled={cities.indexOf(c) === 0}
                    className="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-20 cursor-pointer">
                    <i className="ri-arrow-up-s-line text-sm" />
                  </button>
                  <span className="text-sm text-slate-500 w-4 text-center">{c.sort_order}</span>
                  <button onClick={() => {
                    const idx = cities.indexOf(c);
                    if (idx < cities.length - 1) {
                      const next = cities[idx + 1];
                      editCity(c, 'sort_order', next.sort_order);
                      editCity(next, 'sort_order', c.sort_order);
                    }
                  }} disabled={cities.indexOf(c) === cities.length - 1}
                    className="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-20 cursor-pointer">
                    <i className="ri-arrow-down-s-line text-sm" />
                  </button>
                </div>
                <div className="col-span-3 flex justify-end gap-1">
                  <button onClick={() => deleteCity(c)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 cursor-pointer">
                    <i className="ri-delete-bin-line text-sm" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
