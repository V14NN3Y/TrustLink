import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import ToggleSwitch from '@/components/base/ToggleSwitch';

const ICON_OPTIONS = [
  { value: 'ri-bank-card-2-line', label: 'Carte' },
  { value: 'ri-smartphone-line', label: 'Mobile' },
  { value: 'ri-bank-card-line', label: 'Banque' },
  { value: 'ri-money-cny-circle-line', label: 'Espèces' },
  { value: 'ri-wallet-3-line', label: 'Portefeuille' },
  { value: 'ri-bank-line', label: 'Banque' },
  { value: 'ri-secure-payment-line', label: 'Sécurisé' },
];

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('payment_methods').select('*').order('sort_order');
    setMethods(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (method) => {
    await supabase.from('payment_methods').update({ is_active: !method.is_active }).eq('id', method.id);
    load();
  };

  const updateMethod = async (method, field, value) => {
    await supabase.from('payment_methods').update({ [field]: value }).eq('id', method.id);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    load();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Poppins, sans-serif' }}>Moyens de paiement</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {methods.filter(m => m.is_active).length} actifs · {methods.filter(m => !m.is_active).length} désactivés
        </p>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-emerald-700 text-sm flex items-center gap-2">
          <i className="ri-checkbox-circle-line" />Mise à jour enregistrée
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="grid grid-cols-12 gap-3 px-5 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
          <div className="col-span-1" />
          <div className="col-span-3">Code</div>
          <div className="col-span-4">Libellé</div>
          <div className="col-span-2 text-center">Actif</div>
          <div className="col-span-2 text-center">Ordre</div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-32"><div className="w-8 h-8 border-4 border-slate-200 border-t-trustblue rounded-full animate-spin" /></div>
        ) : methods.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <i className="ri-bank-card-line text-3xl mb-2 block" />
            <p className="text-sm">Aucun moyen de paiement</p>
          </div>
        ) : (
          methods.map(m => (
            <div key={m.id} className="grid grid-cols-12 gap-3 items-center px-5 py-3 hover:bg-slate-50 border-b border-slate-50">
              <div className="col-span-1">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <i className={`${m.icon} text-sm text-trustblue`} />
                </div>
              </div>
              <div className="col-span-3">
                <span className="text-sm font-mono text-slate-600">{m.code}</span>
              </div>
              <div className="col-span-4">
                <span className="text-sm text-slate-800">{m.label}</span>
              </div>
              <div className="col-span-2 flex justify-center">
                <ToggleSwitch enabled={m.is_active} onClick={() => toggleActive(m)} size="sm" />
              </div>
              <div className="col-span-2 flex justify-center gap-1">
                <button onClick={() => {
                  if (m.sort_order > 1) updateMethod(m, 'sort_order', m.sort_order - 1);
                }} className="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:bg-slate-100 hover:text-slate-600 cursor-pointer">
                  <i className="ri-arrow-up-s-line text-sm" />
                </button>
                <span className="text-sm text-slate-500 w-4 text-center">{m.sort_order}</span>
                <button onClick={() => {
                  if (m.sort_order < methods.length) updateMethod(m, 'sort_order', m.sort_order + 1);
                }} className="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:bg-slate-100 hover:text-slate-600 cursor-pointer">
                  <i className="ri-arrow-down-s-line text-sm" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
