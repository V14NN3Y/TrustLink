import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { formatDateTime } from '@/components/base/DataTransformer';
import { useSupabaseNotifications } from '@/hooks/useSupabaseNotifications';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/orders': 'Commandes Escrow',
  '/finance': 'Finance & Paiements',
  '/logistics': 'Logistique & Voyages',
  '/moderation': 'Modération Catalogue',
  '/profile': 'Profil & Paramètres',
  '/users': 'Utilisateurs',
  '/products': 'Catalogue Produits',
};

const NOTIF_ICONS = {
  order_update: 'ri-shopping-bag-3-line',
  new_message: 'ri-message-3-line',
  product_approved: 'ri-checkbox-circle-line',
  product_rejected: 'ri-close-circle-line',
  dispute_update: 'ri-error-warning-line',
  new_order: 'ri-shopping-bag-3-line',
  payment_received: 'ri-bank-line',
};

export default function TopHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { rate, setRate } = useExchangeRate();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showRateEdit, setShowRateEdit] = useState(false);
  const [tempRate, setTempRate] = useState(rate);
  const { user } = useAuth();
  const { notifications, markAsRead, markAllAsRead } = useSupabaseNotifications(user?.id);
  const notifRef = useRef(null);
  const rateRef = useRef(null);
  const title = PAGE_TITLES[location.pathname] || 'TrustLink Admin';
  const unread = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
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
    setRate(newRate); // met à jour localStorage
    setShowRateEdit(false);

    // Persister dans Supabase
    const { data: { user: adminUser } } = await supabase.auth.getUser();

    await supabase
      .from('exchange_rates')
      .update({
        rate: newRate,
        updated_by: adminUser.id,
        updated_at: new Date().toISOString()
      })
      .eq('from_currency', 'NGN')
      .eq('to_currency', 'XOF');

    // Admin log
    await supabase.from('admin_logs').insert({
      admin_id: adminUser.id,
      action: 'exchange_rate_updated',
      resource_type: 'exchange_rate',
      old_value: { rate: rate },
      new_value: { rate: newRate },
    });
  }

  return (
    <header className="glass-header sticky top-0 z-20 w-full px-6 py-3 flex items-center justify-between">
      <div>
        <h2 style={{ fontFamily: 'Poppins, sans-serif' }} className="font-semibold text-slate-800 text-lg leading-tight">{title}</h2>
        <p className="text-xs text-slate-500 mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
          {new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
        </p>
      </div>

      <div className="flex items-center gap-4">
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
                  <button onClick={markAllAsRead} className="text-xs text-trustblue hover:underline cursor-pointer">
                    Tout marquer lu
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className={`flex items-start gap-3 px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 cursor-pointer ${!n.is_read ? 'bg-blue-50/30' : ''}`}
                    onClick={() => markAsRead(n.id)}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${!n.is_read ? 'bg-trustblue text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <i className={`${NOTIF_ICONS[n.type]} text-sm`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-relaxed ${!n.is_read ? 'text-slate-800 font-medium' : 'text-slate-600'}`}>{n.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{formatDateTime(n.created_at)}</p>
                    </div>
                    {!n.is_read && <span className="w-2 h-2 rounded-full bg-trustblue flex-shrink-0 mt-1" />}
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
