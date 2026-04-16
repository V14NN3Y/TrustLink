import AdminLayout from '@/components/AdminLayout';

const MOCK_USERS = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Buyer', location: 'Cotonou, BJ', joins: '2 Mars 2026', status: 'Vérifié' },
  { id: '2', name: 'Agent #04', email: 'lagos-hub-4@trustlink.bj', role: 'Agent', location: 'Lagos, NG', joins: '15 Jan 2026', status: 'Vérifié' },
  { id: '3', name: 'Ade Johnson', email: 'ade@shop.ng', role: 'Seller', location: 'Ibadan, NG', joins: '10 Avr 2026', status: 'En attente' },
];

export default function UsersPage() {
  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Gestion des Utilisateurs</h1>
          <p className="text-gray-500 mt-1 font-medium italic">Vérification des KYC et rôles plateforme.</p>
        </div>
        <button className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all flex items-center gap-2 group">
          Exporter la liste
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-border text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Utilisateur</th>
                <th className="px-8 py-5">Rôle</th>
                <th className="px-8 py-5">Localisation</th>
                <th className="px-8 py-5">Membre depuis</th>
                <th className="px-8 py-5">Statut KYC</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MOCK_USERS.map((u) => (
                <tr key={u.id} className="hover:bg-primary/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${u.role === 'Buyer' ? 'bg-accent' : 'bg-primary'}`}>
                          {u.name.charAt(0)}
                       </div>
                       <div>
                          <p className="font-bold text-foreground group-hover:text-primary transition-colors">{u.name}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-wider">{u.role}</span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-medium text-gray-600 underline underline-offset-4 decoration-primary/20">{u.location}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{u.joins}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-2.5 py-1 ${u.status === 'Vérifié' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'} rounded-lg text-[10px] font-black uppercase tracking-wider`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="text-xs font-black text-primary hover:underline uppercase tracking-widest">Détails →</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
