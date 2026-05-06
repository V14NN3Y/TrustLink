import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { formatDateTime } from '@/components/base/DataTransformer';
import { NOTIFICATION_ICONS, NOTIFICATION_COLORS } from '@/constants/notifications';

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  async function fetchNotifications() {
    setLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (!error && data) setNotifications(data);
    setLoading(false);
  }

  useEffect(() => {
    fetchNotifications();
    const channel = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications' },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function markAsRead(notifId) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', notifId);
    setNotifications((prev) => prev.map(n => n.id === notifId ? { ...n, is_read: true } : n));
  }

  async function markAllRead() {
    const unread = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unread.length === 0) return;
    await supabase.from('notifications').update({ is_read: true }).in('id', unread);
    setNotifications((prev) => prev.map(n => ({ ...n, is_read: true })));
  }

  const filtered = filter === 'unread' ? notifications.filter(n => !n.is_read) : notifications;
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-slate-800 text-2xl" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Notifications
          </h1>
          <p className="text-sm text-slate-500 mt-1">{unreadCount} non lue{unreadCount !== 1 ? 's' : ''}</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs font-semibold text-trustblue hover:underline cursor-pointer"
          >
            Tout marquer comme lu
          </button>
        )}
      </div>

      <div className="flex gap-2">
        {[
          { key: 'all', label: 'Toutes' },
          { key: 'unread', label: 'Non lues' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer border transition-all ${
              filter === f.key
                ? 'bg-trustblue text-white border-trustblue'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-trustblue/20 border-t-trustblue rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-slate-400">Chargement...</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.map(notif => {
              const Icon = NOTIFICATION_ICONS[notif.type] || 'ri-notification-3-line';
              const colorClass = NOTIFICATION_COLORS[notif.type] || 'text-slate-500';
              return (
                <div
                  key={notif.id}
                  className={`flex items-start gap-3 px-5 py-4 hover:bg-slate-50 ${!notif.is_read ? 'bg-blue-50/30' : ''}`}
                  onClick={() => { if (!notif.is_read) markAsRead(notif.id); }}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${notif.is_read ? 'bg-slate-100' : 'bg-blue-100'}`}>
                    <i className={`${Icon} text-sm ${notif.is_read ? 'text-slate-400' : colorClass}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${notif.is_read ? 'text-slate-600' : 'text-slate-800 font-semibold'}`}>{notif.title}</p>
                    {notif.body && (
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.body}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">{formatDateTime(notif.created_at)}</p>
                  </div>
                  {!notif.is_read && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5"></div>
                  )}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="py-12 text-center text-sm text-slate-400">Aucune notification</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
