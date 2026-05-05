import { useState, useRef } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';

export default function ProfileInfo() {
  const { profile, user } = useAuth();
  const [draft, setDraft] = useState({
    name: profile?.full_name || '',
    email: profile?.email || user?.email || '',
    phone: profile?.phone || '',
    role: profile?.role || 'admin',
  });
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef(null);

  async function handleSave() {
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: draft.name, phone: draft.phone })
      .eq('id', user.id);
    if (!error) { setEditing(false); setSaved(true); setTimeout(() => setSaved(false), 3000); }
  }

  const fields = [
    { label: 'Nom complet', key: 'full_name' },
    { label: 'Email', key: 'email' },
    { label: 'Téléphone', key: 'phone' },
    { label: 'Rôle', key: 'role' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6">
      <div className="flex items-start justify-between mb-6">
        <h3 className="font-semibold text-slate-800 text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>Informations du profil</h3>
        {!editing && (
          <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50 cursor-pointer">
            <i className="ri-edit-line" />Modifier
          </button>
        )}
      </div>

      <div className="flex items-center gap-5 mb-8">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-trustblue flex items-center justify-center">
            {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" /> : <span className="font-bold text-white text-2xl" style={{ fontFamily: 'Poppins, sans-serif' }}>AD</span>}
          </div>
          {editing && (
            <button onClick={() => fileRef.current?.click()} className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-100 border-2 border-white rounded-full flex items-center justify-center cursor-pointer">
              <i className="ri-camera-line text-trustblue text-xs" />
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => {
          const f = e.target.files?.[0];
          if (f) setDraft(d => ({ ...d, avatar: URL.createObjectURL(f) }));
        }} />
        <div>
          <p className="font-bold text-slate-800 text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>{profile.full_name}</p>
          <p className="text-sm text-slate-500">{profile.role}</p>
          <p className="text-xs text-slate-400 mt-0.5">Membre depuis {new Date(profile.created_at).getFullYear()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {fields.map(f => (
          <div key={f.key}>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">{f.label}</label>
            {editing
              ? <input value={String(draft[f.key] ?? '')} onChange={e => setDraft(d => ({ ...d, [f.key]: e.target.value }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-trustblue" />
              : <p className="text-sm text-slate-700 px-3 py-2.5 bg-slate-50 rounded-xl">{String(profile?.[f.key] ?? '—')}</p>
            }
          </div>
        ))}
      </div>

      {saved && (
        <div className="animate-fade-in bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-emerald-700 text-sm flex items-center gap-2 mb-4">
          <i className="ri-checkbox-circle-line" />Profil mis à jour avec succès
        </div>
      )}
      {editing && (
        <div className="flex gap-3">
          <button onClick={() => { setDraft({ full_name: profile?.full_name || '', email: profile?.email || user?.email || '', phone: profile?.phone || '', role: profile?.role || 'admin' }); setEditing(false); }} className="px-6 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold text-sm cursor-pointer">Annuler</button>
          <button onClick={handleSave} className="px-6 py-2.5 bg-trustblue text-white rounded-xl font-semibold text-sm cursor-pointer">Sauvegarder</button>
        </div>
      )}
    </div>
  );
}
