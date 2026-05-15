import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', body: '', target_role: '', expires_at: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('system_announcements').select('*').order('created_at', { ascending: false });
    setAnnouncements(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) return;
    setSaving(true);
    await supabase.from('system_announcements').insert({
      title: form.title, body: form.body || null, target_role: form.target_role || null, created_by: user?.id,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
    });
    setSaving(false);
    setForm({ title: '', body: '', target_role: '', expires_at: '' });
    load();
  };

  const toggleActive = async (a) => {
    await supabase.from('system_announcements').update({ is_active: !a.is_active }).eq('id', a.id);
    load();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Poppins, sans-serif' }}>Annonces système</h1>
        <p className="text-sm text-slate-500 mt-0.5">{announcements.filter(a => a.is_active).length} annonce(s) active(s)</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 h-fit sticky top-6">
          <h3 className="font-semibold text-slate-800 mb-4">Nouvelle annonce</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Titre *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-trustblue" placeholder="Maintenance prévue..." required />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Message</label>
              <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} rows={3} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-trustblue resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Cible</label>
                <select value={form.target_role} onChange={e => setForm(f => ({ ...f, target_role: e.target.value }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-trustblue">
                  <option value="">Tous les utilisateurs</option>
                  <option value="buyer">Acheteurs</option>
                  <option value="seller">Vendeurs</option>
                  <option value="admin">Administrateurs</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Expire le</label>
                <input type="datetime-local" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-trustblue" />
              </div>
            </div>
            <button type="submit" disabled={saving} className="w-full py-2.5 bg-trustblue text-white rounded-xl font-semibold text-sm cursor-pointer disabled:opacity-50">
              {saving ? 'Publication...' : "Publier l'annonce"}
            </button>
          </form>
        </div>
        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-12"><div className="w-6 h-6 border-4 border-slate-200 border-t-trustblue rounded-full animate-spin" /></div>
          ) : announcements.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400">
              <i className="ri-megaphone-line text-3xl mb-2 block" /><p className="text-sm">Aucune annonce</p>
            </div>
          ) : announcements.map(a => (
            <div key={a.id} className="bg-white rounded-2xl border border-slate-100 p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">{a.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(a.created_at).toLocaleDateString('fr-FR')}
                    {a.target_role && <> · Cible : {a.target_role}s</>}
                    {a.expires_at && <> · Expire le {new Date(a.expires_at).toLocaleDateString('fr-FR')}</>}
                  </p>
                </div>
                <button onClick={() => toggleActive(a)}
                  className={`text-[10px] font-bold px-2 py-1 rounded-full cursor-pointer ${a.is_active ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'}`}>
                  {a.is_active ? 'Active' : 'Inactive'}
                </button>
              </div>
              {a.body && <p className="text-sm text-slate-600">{a.body}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
