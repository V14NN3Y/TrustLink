import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/lib/AuthContext';
const TYPE_CONFIG = {
    order_update: { icon: 'ri-shopping-bag-line', color: '#125C8D', bg: '#EBF4FB' },
    new_message: { icon: 'ri-message-3-line', color: '#7C3AED', bg: '#F5F3FF' },
    product_approved: { icon: 'ri-checkbox-circle-line', color: '#15803D', bg: '#DCFCE7' },
    product_rejected: { icon: 'ri-close-circle-line', color: '#DC2626', bg: '#FEE2E2' },
    dispute_update: { icon: 'ri-shield-check-line', color: '#D97706', bg: '#FEF3C7' },
    new_order: { icon: 'ri-store-2-line', color: '#FF6A00', bg: '#FFF3EC' },
};
function formatRelative(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'À l\'instant';
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
export default function NotificationBell() {
    const { isAuthenticated } = useAuth();
    const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);
    if (!isAuthenticated) return null;
    const preview = notifications.slice(0, 5);
    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
                <i className="ri-notification-3-line text-xl" style={{ color: '#6B7280' }}></i>
                {unreadCount > 0 && (
                    <span
                        className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] text-white rounded-full flex items-center justify-center font-poppins font-bold"
                        style={{ backgroundColor: '#FF6A00', fontSize: '10px', padding: '0 4px' }}
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>
            {open && (
                <div
                    className="absolute right-0 top-12 w-80 bg-white rounded-xl overflow-hidden z-50"
                    style={{ border: '1px solid #E5E7EB', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
                >
                    {/* Header dropdown */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-poppins font-semibold" style={{ color: '#111827' }}>
                                Notifications
                            </span>
                            {unreadCount > 0 && (
                                <span
                                    className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white"
                                    style={{ backgroundColor: '#FF6A00' }}
                                >
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="text-xs font-poppins font-medium cursor-pointer hover:underline"
                                style={{ color: '#125C8D' }}
                            >
                                Tout lire
                            </button>
                        )}
                    </div>
                    {/* Liste preview */}
                    <div className="max-h-72 overflow-y-auto">
                        {preview.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                                <i className="ri-notification-off-line text-2xl mb-2" style={{ color: '#D1D5DB' }}></i>
                                <p className="text-xs font-inter" style={{ color: '#9CA3AF' }}>Aucune notification</p>
                            </div>
                        ) : (
                            preview.map((notif) => {
                                const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.order_update;
                                return (
                                    <div
                                        key={notif.id}
                                        onClick={() => { markRead(notif.id); setOpen(false); }}
                                        className="flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 transition-colors"
                                        style={{ backgroundColor: notif.is_read ? 'transparent' : '#F0F7FF' }}
                                    >
                                        <div
                                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                            style={{ backgroundColor: cfg.bg }}
                                        >
                                            <i className={`${cfg.icon} text-sm`} style={{ color: cfg.color }}></i>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-poppins font-semibold truncate" style={{ color: '#111827' }}>
                                                {notif.title}
                                            </p>
                                            {notif.body && (
                                                <p className="text-xs font-inter mt-0.5 line-clamp-1" style={{ color: '#6B7280' }}>
                                                    {notif.body}
                                                </p>
                                            )}
                                            <p className="text-xs font-inter mt-0.5" style={{ color: '#9CA3AF' }}>
                                                {formatRelative(notif.created_at)}
                                            </p>
                                        </div>
                                        {!notif.is_read && (
                                            <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: '#125C8D' }} />
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                    {/* Footer */}
                    <div className="border-t border-gray-100 px-4 py-2.5">
                        <Link
                            to="/notifications"
                            onClick={() => setOpen(false)}
                            className="text-xs font-poppins font-semibold flex items-center justify-center gap-1 hover:underline"
                            style={{ color: '#125C8D' }}
                        >
                            Voir toutes les notifications <i className="ri-arrow-right-s-line"></i>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
