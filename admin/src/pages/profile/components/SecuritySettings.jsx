import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';

export default function SecuritySettings() {
  const { logout } = useAuth();
  const [showPwdForm, setShowPwdForm] = useState(false);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [pwdSaved, setPwdSaved] = useState(false);

  async function handlePwdSave() {
    if (!next || next.length < 8) { setError('Min 8 caractères'); return; }
    if (next !== confirm) { setError('Mots de passe différents'); return; }
    const { error } = await supabase.auth.updateUser({ password: next });
    if (error) { setError(error.message); return; }
    setPwdSaved(true); setShowPwdForm(false);
    setCurrent(''); setNext(''); setConfirm('');
    setTimeout(() => setPwdSaved(false), 3000);
  }

  async function handleLogout() {
    await logout();
    window.location.href = '/login';
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
        <h3 className="font-semibold text-slate-800 text-base mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Session</h3>
        <button onClick={handleLogout} className="w-full py-3 bg-red-50 border border-red-200 text-red-600 rounded-xl font-semibold text-sm cursor-pointer hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
          <i className="ri-logout-box-line" />Me déconnecter
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-red-100 p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <i className="ri-user-unfollow-line text-red-600 text-lg" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-red-800 text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>Supprimer le compte</h3>
            <p className="text-xs text-red-600/80 mt-1">Cette action est irréversible. Toutes les données associées seront définitivement supprimées.</p>
            <p className="text-xs text-slate-500 mt-2">Contacte le super administrateur pour demander la suppression de ton compte.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
