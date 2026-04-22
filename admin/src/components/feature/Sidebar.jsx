import { useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Dashboard', icon: 'ri-dashboard-3-line', badge: null, exact: true },
  { path: '/orders', label: 'Commandes', icon: 'ri-shopping-bag-line', badge: 12, exact: false },
  { path: '/logistics', label: 'Logistique', icon: 'ri-truck-line', badge: 3, exact: false },
  { path: '/finance', label: 'Finance', icon: 'ri-bank-line', badge: 4, exact: false },
  { path: '/moderation', label: 'Modération', icon: 'ri-shield-check-line', badge: 5, exact: false },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  function isActive(path, exact) {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  }

  return (
    <aside className="fixed left-0 top-0 w-64 h-screen bg-white border-r border-slate-100 z-30 flex flex-col">
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-trustblue flex items-center justify-center flex-shrink-0">
            <i className="ri-links-line text-white text-lg" />
          </div>
          <div>
            <h1 style={{ fontFamily: 'Poppins, sans-serif' }} className="font-bold text-trustblue text-base leading-tight">TrustLink</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="live-dot" />
              <span className="text-xs text-slate-500" style={{ fontFamily: 'Inter, sans-serif' }}>Système opérationnel</span>
            </div>
          </div>
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
                  {item.badge && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      active ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

      </nav>

      <div className="px-3 pb-4 cursor-pointer" onClick={() => navigate('/profile')}>
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 transition-colors">
          <div className="w-9 h-9 rounded-full bg-trustblue flex items-center justify-center flex-shrink-0">
            <span style={{ fontFamily: 'Poppins, sans-serif' }} className="font-bold text-white text-sm">AD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-800 text-sm truncate" style={{ fontFamily: 'Inter, sans-serif' }}>Admin Principal</p>
            <p className="text-xs text-slate-500 truncate" style={{ fontFamily: 'Inter, sans-serif' }}>admin@trustlink.bj</p>
          </div>
          <i className="ri-arrow-right-s-line text-slate-400" />
        </div>
      </div>
    </aside>
  );
}
