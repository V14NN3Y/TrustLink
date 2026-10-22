import { useState } from 'react';
import { useSupabaseUsers } from '@/hooks/useSupabaseUsers';
import { formatDate } from '@/components/base/DataTransformer';
import StatusBadge from '@/components/base/StatusBadge';
const ROLES = [
  { key: '', label: 'Tous' },
  { key: 'buyer', label: 'Acheteurs' },
  { key: 'admin', label: 'Admins' },
];
export default function UsersTable() {
  const { users, loading } = useSupabaseUsers();
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const filtered = users.filter(u => {
    const matchRole = !roleFilter || u.role === roleFilter;
    const matchSearch = !search || (u.full_name || '').toLowerCase().includes(search.toLowerCase()) || (u.email || '').toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });
  if (loading) return <div className="py-20 text-center text-sm text-slate-400">Chargement...</div>;
  return (
    <div className="bg-white rounded-2xl border border-slate-100">
      <div className="p-5 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-trustblue" />
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none cursor-pointer bg-white">
            {ROLES.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              {['Utilisateur', 'Rôle', 'Contact', 'Inscription'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="font-bold text-trustblue text-xs">{(u.full_name || '??').slice(0,2).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{u.full_name || '—'}</p>
                      <p className="text-xs text-slate-400">{u.id.slice(0,8)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-700 uppercase">{u.role}</span></td>
                <td className="px-4 py-3 text-sm text-slate-600">{u.email}<br/><span className="text-xs text-slate-400">{u.phone || '—'}</span></td>
                <td className="px-4 py-3 text-xs text-slate-500">{formatDate(u.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
