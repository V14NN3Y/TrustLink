import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { formatDateTime } from '@/components/base/DataTransformer';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/orders': 'Commandes Escrow',
  '/finance': 'Finance & Paiements',
  '/logistics': 'Logistique & Voyages',
  '/moderation': 'Modération Catalogue',
  '/profile': 'Profil & Paramètres',
};

const NOTIFICATIONS = [
  { id: 1, type: 'order', message: 'Commande TL-2024-0912 en litige', time: new Date(Date.now() - 300000).toISOString(), read: false },
  { id: 2, type: 'finance', message: 'Payout SLR-0042 en attente de validation', time: new Date(Date.now() - 900000).toISOString(), read: false },
  { id: 3, type: 'logistics', message: 'Voyage VY-2024-041 arrivé à la douane', time: new Date(Date.now() - 1800000).toISOString(), read: true },
  { id: 4, type: 'moderation', message: '5 nouveaux produits en attente', time: new Date(Date.now() - 3600000).toISOString(), read: true },
];

const NOTIF_ICONS = {
  order: 'ri-shopping-bag-3-line', finance: 'ri-bank-line',
  logistics: 'ri-truck-line', moderation: 'ri-shield-star-line',
};

export default function TopHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { rate } = useExchangeRate();
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const notifRef = useRef(null);
  const title = PAGE_TITLES[location.pathname] || 'TrustLink Admin';
  const unread = notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="glass-header sticky top-0 z-20 w-full px-6 py-3 flex items-center justify-between">
      <div>
        <h2 style={{ fontFamily: 'Poppins, sans-serif' }} className="font-semibold text-slate-800 text-lg leading-tight">{title}</h2>
        <p className="text-xs text-slate-500 mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
          {new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2">
          <span className="live-dot" />
          <span className="text-xs text-slate-500" style={{ fontFamily: 'Inter, sans-serif' }}>NGN/XOF</span>
          <span className="font-bold text-trustblue text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>{rate.toFixed(4)}</span>
        </div>

        <div className="relative" ref={notifRef}>
          <button onClick={() => setShowNotifs(v => !v)} className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 cursor-pointer">
            <i className="ri-notification-3-line text-slate-600 text-xl" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{unread}</span>
            )}
          </button>
          {showNotifs && (
            <div className="absolute right-0 top-12 w-80 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 animate-fade-in overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>Notifications</h3>
                {unread > 0 && (
                  <button onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))} className="text-xs text-trustblue hover:underline cursor-pointer">
                    Tout marquer lu
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className={`flex items-start gap-3 px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 cursor-pointer ${!n.read ? 'bg-blue-50/30' : ''}`}
                    onClick={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${!n.read ? 'bg-trustblue text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <i className={`${NOTIF_ICONS[n.type]} text-sm`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-relaxed ${!n.read ? 'text-slate-800 font-medium' : 'text-slate-600'}`}>{n.message}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{formatDateTime(n.time)}</p>
                    </div>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-trustblue flex-shrink-0 mt-1" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button onClick={() => navigate('/profile')} className="w-10 h-10 rounded-full bg-trustblue flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity">
          <span style={{ fontFamily: 'Poppins, sans-serif' }} className="font-bold text-white text-sm">AD</span>
        </button>
      </div>
    </header>
  );
}
