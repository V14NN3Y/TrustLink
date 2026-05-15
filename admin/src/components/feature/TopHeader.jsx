import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import NotificationBadge from './NotificationBadge';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/orders': 'Commandes Escrow',
  '/finance': 'Finance & Paiements',
  '/logistics': 'Logistique & Voyages',
  '/moderation': 'Modération Catalogue',
  '/profile': 'Profil & Paramètres',
  '/users': 'Utilisateurs',
  '/products': 'Catalogue Produits',
  '/messages': 'Messagerie',
  '/notifications': 'Notifications',
  '/admin-logs': 'Historique',
  '/delivery-videos': 'Vidéos réception',
  '/coupons': 'Coupons',
  '/questions': 'Questions',
  '/stock-notifications': 'Stock Alertes',
  '/reports': 'Rapports',
  '/analytics': 'Analytiques',
  '/maintenance': 'Maintenance',
  '/announcements': 'Annonces Système',
  '/activity-calendar': 'Calendrier d\'activité',
};

export default function TopHeader({ onSearchOpen, onMenuToggle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { rate, setRate } = useExchangeRate();
  const [showRateEdit, setShowRateEdit] = useState(false);
  const [tempRate, setTempRate] = useState(rate);
  const { user, profile } = useAuth();
  const rateRef = useRef(null);
  const title = PAGE_TITLES[location.pathname] || 'TrustLink Admin';

  useEffect(() => {
    function handleClick(e) {
      if (rateRef.current && !rateRef.current.contains(e.target)) setShowRateEdit(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    setTempRate(rate);
  }, [rate]);

  async function handleRateSave() {
    const newRate = parseFloat(tempRate);
    setRate(newRate);
    setShowRateEdit(false);

    const { data: { user: adminUser } } = await supabase.auth.getUser();
    await supabase.from('admin_logs').insert({
      admin_id: adminUser.id,
      action: 'exchange_rate_updated',
      resource_type: 'exchange_rate',
      old_value: { rate },
      new_value: { rate: newRate },
    });
  }

  return (
    <header className="glass-header sticky top-0 z-20 w-full px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button onClick={onMenuToggle} className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-50 cursor-pointer">
          <i className="ri-menu-line text-lg text-slate-600" />
        </button>
        <h2 style={{ fontFamily: 'Poppins, sans-serif' }} className="font-semibold text-slate-800 text-lg leading-tight">{title}</h2>
        <p className="text-xs text-slate-500 mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
          {new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={onSearchOpen} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-slate-100 cursor-pointer gap-1.5" title="Rechercher (⌘K)">
          <i className="ri-search-line text-lg text-slate-600" />
          <span className="hidden sm:inline text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">⌘K</span>
        </button>

        <NotificationBadge />

        <div className="relative" ref={rateRef}>
          <button
            onClick={() => setShowRateEdit(v => !v)}
            className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 hover:bg-blue-100/50 transition-colors cursor-pointer group"
          >
            <span className="live-dot" />
            <span className="text-xs text-slate-500" style={{ fontFamily: 'Inter, sans-serif' }}>NGN/XOF</span>
            <span className="font-bold text-trustblue text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>{rate.toFixed(4)}</span>
            <i className="ri-edit-line text-slate-400 group-hover:text-trustblue ml-1 transition-colors" />
          </button>

          {showRateEdit && (
            <div className="absolute top-12 left-0 w-64 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 p-4 animate-fade-in">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Modifier le taux live</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">TAUX 1 ₦ = ... FCFA</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={tempRate}
                    onChange={e => setTempRate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-semibold outline-none focus:border-trustblue focus:ring-1 focus:ring-trustblue"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowRateEdit(false)}
                    className="flex-1 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 rounded-lg cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleRateSave}
                    className="flex-1 py-2 text-xs font-semibold bg-trustblue text-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  >
                    Appliquer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <button onClick={() => navigate('/profile')} className="w-10 h-10 rounded-full bg-trustblue flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span style={{ fontFamily: 'Poppins, sans-serif' }} className="font-bold text-white text-sm">AD</span>
          )}
        </button>
      </div>
    </header>
  );
}
