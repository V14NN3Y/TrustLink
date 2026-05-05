import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { formatDateTime } from '@/components/base/DataTransformer';

export default function SecuritySettings() {
  const [sessions, setSessions] = useState([]); // TODO: charger via supabase.auth.admin.listUserSessions()
  const [showPwdForm, setShowPwdForm] = useState(false);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [pwdSaved, setPwdSaved] = useState(false);
  const [twoFA, setTwoFA] = useState(true);

  async function handlePwdSave() {
    if (!next || next.length < 8) { setError('Min 8 caractères'); return; }
    if (next !== confirm) { setError('Mots de passe différents'); return; }
    const { error } = await supabase.auth.updateUser({ password: next });
    if (error) { setError(error.message); return; }
    setPwdSaved(true); setShowPwdForm(false);
    setCurrent(''); setNext(''); setConfirm('');
    setTimeout(() => setPwdSaved(false), 3000);
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800 text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>Mot de passe</h3>
          {!showPwdForm && <button onClick={() => setShowPwdForm(true)} className="text-sm text-trustblue hover:underline cursor-pointer">Modifier</button>}
        </div>
        {pwdSaved && (
          <div className="animate-fade-in bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-emerald-700 text-sm flex items-center gap-2 mb-4">
            <i className="ri-checkbox-circle-line" />Mot de passe modifié
          </div>
        )}
        {showPwdForm && (
          <div className="animate-fade-in space-y-3">
            {[{ label: 'Mot de passe actuel', value: current, setter: setCurrent }, { label: 'Nouveau mot de passe', value: next, setter: setNext }, { label: 'Confirmer', value: confirm, setter: setConfirm }].map(f => (
              <div key={f.label}>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">{f.label}</label>
                <input type="password" value={f.value} onChange={e => { f.setter(e.target.value); setError(''); }} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-trustblue" />
              </div>
            ))}
            {error && <p className="text-xs text-red-500 flex items-center gap-1"><i className="ri-error-warning-line" />{error}</p>}
            <div className="flex gap-3 pt-1">
              <button onClick={() => { setShowPwdForm(false); setError(''); }} className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm cursor-pointer">Annuler</button>
              <button onClick={handlePwdSave} className="px-5 py-2.5 bg-trustblue text-white rounded-xl font-semibold text-sm cursor-pointer">Confirmer</button>
            </div>
          </div>
        )}
        {!showPwdForm && !pwdSaved && <p className="text-sm text-slate-500 px-3 py-2.5 bg-slate-50 rounded-xl">••••••••••••</p>}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-800 text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>Authentification à 2 facteurs</h3>
            <p className="text-xs text-slate-500 mt-0.5">Renforcez la sécurité de votre compte</p>
          </div>
          <button onClick={() => setTwoFA(v => !v)} className={`relative rounded-full cursor-pointer w-12 h-6 transition-colors ${twoFA ? 'bg-trustblue' : 'bg-slate-200'}`}>
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${twoFA ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800 text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>Sessions actives</h3>
          {sessions.filter(s => !s.current).length > 0 && (
            <button onClick={() => setSessions(prev => prev.filter(s => s.current))} className="text-xs text-red-500 hover:underline cursor-pointer">Déconnecter tout</button>
          )}
        </div>
        <div className="space-y-3">
          {sessions.map(s => (
            <div key={s.id} className={`flex items-center gap-3 p-3 rounded-xl ${s.current ? 'bg-blue-50 border border-blue-100' : 'bg-slate-50'}`}>
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center flex-shrink-0">
                <i className={s.device.includes('iOS') || s.device.includes('Safari') ? 'ri-smartphone-line text-slate-500' : 'ri-computer-line text-slate-500'} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{s.device}</p>
                <p className="text-xs text-slate-500">{s.location} · {formatDateTime(s.last_active)}</p>
              </div>
              {s.current
                ? <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex-shrink-0">Actuelle</span>
                : <button onClick={() => setSessions(prev => prev.filter(x => x.id !== s.id))} className="text-xs text-red-500 hover:underline cursor-pointer flex-shrink-0">Révoquer</button>
              }
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
