import { useState } from 'react';
import { TEAM_MEMBERS } from '@/mocks/profile';
import StatusBadge from '@/components/base/StatusBadge';

const ROLES = ['Super Admin', 'Modérateur', 'Support', 'Analyste', 'Lecture seule'];

export default function TeamManagement() {
  const [members, setMembers] = useState(TEAM_MEMBERS);
  const [editingId, setEditingId] = useState(null);
  const [editRole, setEditRole] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Support');
  const [inviteDone, setInviteDone] = useState(false);

  function handleInvite() {
    if (!inviteEmail) return;
    const newMember = {
      id: `admin-${Date.now()}`, name: inviteEmail.split('@')[0],
      email: inviteEmail, role: inviteRole,
      initials: inviteEmail.slice(0, 2).toUpperCase(),
      status: 'pending', joined_at: new Date().toISOString(),
    };
    setMembers(prev => [...prev, newMember]);
    setInviteDone(true);
    setTimeout(() => { setInviteDone(false); setShowModal(false); setInviteEmail(''); setInviteRole('Support'); }, 2000);
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-slate-800 text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>Gestion de l'équipe</h3>
            <p className="text-xs text-slate-500 mt-0.5">{members.length} membre{members.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-trustblue text-white rounded-xl text-sm font-semibold cursor-pointer">
            <i className="ri-user-add-line" />Inviter
          </button>
        </div>
        <div className="space-y-2">
          {members.map(m => (
            <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-trustblue text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>{m.initials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{m.name}</p>
                <p className="text-xs text-slate-500 truncate">{m.email}</p>
              </div>
              {editingId === m.id ? (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <select value={editRole} onChange={e => setEditRole(e.target.value)} className="px-2 py-1.5 border border-trustblue rounded-lg text-xs outline-none cursor-pointer bg-white">
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <button onClick={() => { setMembers(prev => prev.map(x => x.id === m.id ? { ...x, role: editRole } : x)); setEditingId(null); }} className="w-7 h-7 bg-trustblue text-white rounded-lg flex items-center justify-center cursor-pointer"><i className="ri-check-line text-xs" /></button>
                  <button onClick={() => setEditingId(null)} className="w-7 h-7 border border-slate-200 rounded-lg flex items-center justify-center cursor-pointer"><i className="ri-close-line text-xs text-slate-500" /></button>
                </div>
              ) : (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">{m.role}</span>
                  <StatusBadge status={m.status} />
                  <button onClick={() => { setEditingId(m.id); setEditRole(m.role); }} className="w-7 h-7 border border-slate-200 rounded-lg flex items-center justify-center cursor-pointer"><i className="ri-edit-line text-xs text-slate-500" /></button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => !inviteDone && setShowModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md p-6" style={{ animation: 'fadeIn 0.18s ease' }} onClick={e => e.stopPropagation()}>
            {inviteDone ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4"><i className="ri-checkbox-circle-line text-emerald-500 text-3xl" /></div>
                <h3 className="font-bold text-slate-800 text-lg mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>Invitation envoyée !</h3>
                <p className="text-sm text-slate-500">{inviteEmail}</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-slate-800 text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>Inviter un membre</h3>
                  <button onClick={() => setShowModal(false)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-50 cursor-pointer"><i className="ri-close-line text-slate-500" /></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Email</label>
                    <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="prenom@trustlink.bj" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-trustblue" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Rôle</label>
                    <select value={inviteRole} onChange={e => setInviteRole(e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none cursor-pointer bg-white">
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <button onClick={handleInvite} disabled={!inviteEmail} className={`w-full py-2.5 rounded-xl font-semibold text-sm ${inviteEmail ? 'bg-trustblue text-white cursor-pointer' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                    Envoyer l'invitation
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
