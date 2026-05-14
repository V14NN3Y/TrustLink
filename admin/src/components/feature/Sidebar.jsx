import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

const navItems = [
  { path: '/', label: 'Dashboard', icon: 'ri-dashboard-3-line', exact: true },
  { path: '/orders', label: 'Commandes', icon: 'ri-shopping-bag-line', exact: false },
  { path: '/logistics', label: 'Logistique', icon: 'ri-truck-line', exact: false },
  { path: '/finance', label: 'Finance', icon: 'ri-bank-line', exact: false },
  { path: '/moderation', label: 'Modération', icon: 'ri-shield-check-line', exact: false },
  { path: '/users', label: 'Utilisateurs', icon: 'ri-user-line', exact: false },
  { path: '/products', label: 'Produits', icon: 'ri-archive-line', exact: false },
  { path: '/messages', label: 'Messagerie', icon: 'ri-message-3-line', exact: false },
  { path: '/notifications', label: 'Notifications', icon: 'ri-notification-3-line', exact: false },
  { path: '/admin-logs', label: 'Historique', icon: 'ri-history-line', exact: false },
  { path: '/delivery-videos', label: 'Vidéos réception', icon: 'ri-video-line', exact: false },
];

export default function Sidebar() {
  const { profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  function isActive(path, exact) {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  }

  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-white border-r border-slate-100 z-30 flex flex-col">
      <div className="px-6 py-5 border-b border-slate-100">
        <Link to="/" className="flex items-center gap-3">
          <img src="/TrustLink_Logo_Orange.png" alt="TrustLink" className="h-8 w-auto" />
        </Link>
        <div className="flex items-center gap-1.5 mt-3">
          <span className="live-dot" />
          <span className="text-xs text-slate-500" style={{ fontFamily: 'Inter, sans-serif' }}>Système opérationnel</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-3 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>Navigation</p>
        <ul className="space-y-1">
          {navItems.map(item => {
            const active = isActive(item.path, item.exact);
            return (
              <li key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${active ? 'bg-trustblue text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <i className={`${item.icon} text-base flex-shrink-0`} />
                  <span className="flex-1 text-left">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

      </nav>

      <div className="px-3 pb-4 cursor-pointer" onClick={() => navigate('/profile')}>
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors">
          <div className="w-9 h-9 rounded-full bg-trustblue flex items-center justify-center flex-shrink-0 overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span style={{ fontFamily: 'Poppins, sans-serif' }} className="font-bold text-white text-sm">AD</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-800 text-sm truncate" style={{ fontFamily: 'Inter, sans-serif' }}>{profile?.full_name || 'Admin Principal'}</p>
            <p className="text-xs text-slate-500 truncate" style={{ fontFamily: 'Inter, sans-serif' }}>{profile?.email || 'admin@trustlink.bj'}</p>
          </div>
          <i className="ri-arrow-right-s-line text-slate-400" />
        </div>
      </div>
    </aside>
  );
}
