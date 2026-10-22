import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useI18n } from '@/lib/I18nContext';

const METHOD_ICONS = {
  kkiapay: 'ri-bank-card-2-line',
  mtn: 'ri-smartphone-line',
  moov: 'ri-smartphone-line',
  wave: 'ri-bank-card-line',
};

const METHOD_COLORS = {
  kkiapay: '#8B5CF6',
  mtn: '#FCD34D',
  moov: '#3B82F6',
  wave: '#06B6D4',
};

export default function SavedPayments() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ method_type: 'kkiapay', identifier: '', label: '' });

  useEffect(() => {
    if (!user?.id) return;
    supabase.from('saved_payments').select('*').eq('buyer_id', user.id).then(({ data }) => {
      setMethods(data || []);
      setLoading(false);
    }).catch(err => { console.error("Error loading saved payments:", err); setLoading(false); });
  }, [user]);

  const addMethod = async () => {
    if (!form.identifier) return;
    try {
      await supabase.from('saved_payments').insert({
        buyer_id: user.id,
        method_type: form.method_type,
        identifier: form.identifier,
        label: form.label || `Mon ${form.method_type.toUpperCase()}`,
      });
      setShowAdd(false);
      setForm({ method_type: 'kkiapay', identifier: '', label: '' });
      const { data } = await supabase.from('saved_payments').select('*').eq('buyer_id', user.id);
      setMethods(data || []);
    } catch (err) {
      console.error("Error adding payment method:", err);
    }
  };

  const deleteMethod = async (id) => {
    if (!window.confirm(t('settings.confirmDeletePayment'))) return;
    try {
      await supabase.from('saved_payments').delete().eq('id', id);
      setMethods(m => m.filter(x => x.id !== id));
    } catch (err) {
      console.error("Error deleting payment method:", err);
    }
  };

  const setDefault = async (id) => {
    try {
      await supabase.from('saved_payments').update({ is_default: false }).eq('buyer_id', user.id);
      await supabase.from('saved_payments').update({ is_default: true }).eq('id', id);
      setMethods(m => m.map(x => ({ ...x, is_default: x.id === id })));
    } catch (err) {
      console.error("Error setting default payment method:", err);
    }
  };

  if (loading) return <div className="h-20 bg-gray-100 rounded-xl animate-pulse" />;

  return (
    <div className="bg-white rounded-xl p-5" style={{ border: '1px solid #E5E7EB' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-poppins font-semibold" style={{ color: '#111827' }}>{t('settings.savedPayments')}</h3>
        <button onClick={() => setShowAdd(!showAdd)} className="text-xs font-semibold text-[#125C8D] hover:underline cursor-pointer">
          + {t('settings.addPayment')}
        </button>
      </div>

      {showAdd && (
        <div className="mb-4 p-3 rounded-lg bg-gray-50 space-y-2">
          <select value={form.method_type} onChange={e => setForm(f => ({ ...f, method_type: e.target.value }))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none">
            <option value="kkiapay">KkiaPay</option>
            <option value="mtn">MTN Mobile Money</option>
            <option value="moov">Moov Money</option>
            <option value="wave">Wave</option>
          </select>
          <input value={form.identifier} onChange={e => setForm(f => ({ ...f, identifier: e.target.value }))}
            placeholder={t('settings.placeholderIdentifier')}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#125C8D]" />
          <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
            placeholder={t('settings.placeholderLabel')}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-[#125C8D]" />
          <div className="flex gap-2">
            <button onClick={addMethod} disabled={!form.identifier}
              className="flex-1 py-2 text-xs font-semibold text-white rounded-lg disabled:opacity-50 cursor-pointer" style={{ backgroundColor: '#125C8D' }}>
              {t('settings.savePayment')}
            </button>
            <button onClick={() => setShowAdd(false)} className="py-2 px-3 text-xs font-semibold text-gray-500 border border-gray-200 rounded-lg cursor-pointer">
              {t('general.cancel')}
            </button>
          </div>
        </div>
      )}

      {methods.length === 0 && !showAdd ? (
        <p className="text-xs font-inter text-gray-400">{t('settings.noSavedPayments')}</p>
      ) : (
        <div className="space-y-2">
          {methods.map(m => (
            <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div className="flex items-center gap-2">
                <i className={`${METHOD_ICONS[m.method_type] || 'ri-bank-card-line'} text-base`} style={{ color: METHOD_COLORS[m.method_type] || '#6B7280' }}></i>
                <div>
                  <p className="text-sm font-inter font-medium text-gray-800">{m.label}</p>
                  <p className="text-xs text-gray-400">{m.identifier}</p>
                </div>
                {m.is_default && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-50 text-green-600">{t('settings.default')}</span>}
              </div>
              <div className="flex gap-1">
                {!m.is_default && (
                  <button onClick={() => setDefault(m.id)} className="text-[10px] text-[#125C8D] hover:underline cursor-pointer">{t('settings.default')}</button>
                )}
                <button onClick={() => deleteMethod(m.id)} className="text-[10px] text-red-500 hover:underline cursor-pointer">{t('settings.delete')}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
