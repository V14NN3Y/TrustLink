import { useState } from 'react';
import { useSupabaseUsers } from '@/hooks/useSupabaseUsers';
import { formatDate } from '@/components/base/DataTransformer';
import StatusBadge from '@/components/base/StatusBadge';
const ROLES = [
  { key: '', label: 'Tous' },
  { key: 'buyer', label: 'Acheteurs' },
  { key: 'seller', label: 'Vendeurs' },
  { key: 'admin', label: 'Admins' },
];
function KycBadge({ verified }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${
      verified
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : 'bg-slate-50 text-slate-400 border-slate-200'
    }`}>
      <i className={verified ? 'ri-checkbox-circle-line' : 'ri-close-circle-line'} />
      {verified ? 'OK' : 'Non'}
    </span>
  );
}
export default function UsersTable() {
  const { users, loading, updateUser } = useSupabaseUsers();
  const [roleFilter, setRoleFilter] = useState('');
  const [kycFilter, setKycFilter] = useState('all'); // all | incomplete
  const [search, setSearch] = useState('');
  const filtered = users.filter(u => {
    const matchRole = !roleFilter || u.role === roleFilter;
    const matchSearch = !search || (u.full_name || '').toLowerCase().includes(search.toLowerCase()) || (u.email || '').toLowerCase().includes(search.toLowerCase());
    const matchKyc = kycFilter === 'all' || !(u.kyc_identity_verified && u.kyc_address_verified && u.kyc_business_verified);
    return matchRole && matchSearch && matchKyc;
  });
  const toggleKyc = async (id, field, current) => {
    await updateUser(id, { [field]: !current });
  };
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
          <select value={kycFilter} onChange={e => setKycFilter(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none cursor-pointer bg-white">
            <option value="all">Tous KYC</option>
            <option value="incomplete">KYC incomplet</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              {['Utilisateur', 'Rôle', 'Contact', 'KYC Identité', 'KYC Adresse', 'KYC Business', 'Inscription', ''].map(h => (
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
                <td className="px-4 py-3">
                  <button onClick={() => toggleKyc(u.id, 'kyc_identity_verified', u.kyc_identity_verified)} className="cursor-pointer">
                    <KycBadge verified={u.kyc_identity_verified} />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleKyc(u.id, 'kyc_address_verified', u.kyc_address_verified)} className="cursor-pointer">
                    <KycBadge verified={u.kyc_address_verified} />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleKyc(u.id, 'kyc_business_verified', u.kyc_business_verified)} className="cursor-pointer">
                    <KycBadge verified={u.kyc_business_verified} />
                  </button>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">{formatDate(u.created_at)}</td>
                <td className="px-4 py-3">
                  {u.role === 'seller' && (
                    <span className="text-xs text-slate-400">{u.business_name || 'Sans boutique'}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
