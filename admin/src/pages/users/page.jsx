import UsersTable from './components/UsersTable';
export default function UsersPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-bold text-slate-800 text-2xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
        Gestion des Utilisateurs
      </h1>
      <UsersTable />
    </div>
  );
}
