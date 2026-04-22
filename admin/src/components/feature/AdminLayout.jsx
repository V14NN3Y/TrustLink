import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';

export default function AdminLayout({ children }) {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <TopHeader />
        <main key={location.pathname} className="flex-1 p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
