import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/lib/AuthContext';
// Mapping type → icône + couleur
const TYPE_CONFIG = {
    order_update: { icon: 'ri-shopping-bag-line', color: '#125C8D', bg: '#EBF4FB', label: 'Commande' },
    new_message: { icon: 'ri-message-3-line', color: '#7C3AED', bg: '#F5F3FF', label: 'Message' },
    product_approved: { icon: 'ri-checkbox-circle-line', color: '#15803D', bg: '#DCFCE7', label: 'Produit approuvé' },
    product_rejected: { icon: 'ri-close-circle-line', color: '#DC2626', bg: '#FEE2E2', label: 'Produit refusé' },
    dispute_update: { icon: 'ri-shield-check-line', color: '#D97706', bg: '#FEF3C7', label: 'Litige' },
    new_order: { icon: 'ri-store-2-line', color: '#FF6A00', bg: '#FFF3EC', label: 'Nouvelle commande' },
};
function formatRelative(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'À l\'instant';
    if (mins < 60) return `Il y a ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `Il y a ${days}j`;
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
function getResourceLink(resourceType, resourceId) {
    if (!resourceType || !resourceId) return null;
    switch (resourceType) {
        case 'order': return `/account`;
        case 'product': return `/product/${resourceId}`;
        case 'message': return `/support`;
        case 'dispute': return `/account`;
        default: return null;
    }
}
export default function Notifications() {
    const { isAuthenticated } = useAuth();
    const { notifications, loading, unreadCount, markRead, markAllRead } = useNotifications();
    const navigate = useNavigate();
    const handleClick = async (notif) => {
        if (!notif.is_read) await markRead(notif.id);
        const link = getResourceLink(notif.resource_type, notif.resource_id);
        if (link) navigate(link);
    };
    // Grouper par date
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const grouped = notifications.reduce((acc, notif) => {
        const d = new Date(notif.created_at).toDateString();
        const key = d === today ? 'Aujourd\'hui' : d === yesterday ? 'Hier' : new Date(notif.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
        if (!acc[key]) acc[key] = [];
        acc[key].push(notif);
        return acc;
    }, {});
    return (
        <div className="pt-20 min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
            {/* Hero */}
            <div style={{ backgroundColor: '#0E3A4F' }} className="text-white py-8">
                <div className="max-w-[760px] mx-auto px-4 md:px-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-poppins font-bold">Notifications</h1>
                            {unreadCount > 0 && (
                                <p className="text-sm font-inter text-white/70 mt-0.5">
                                    {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                                </p>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="flex items-center gap-2 px-4 py-2 text-xs font-poppins font-semibold rounded-lg transition-colors cursor-pointer"
                                style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff' }}
                            >
                                <i className="ri-check-double-line"></i>
                                Tout marquer comme lu
                            </button>
                        )}
                    </div>
                </div>
            </div>
            <div className="max-w-[760px] mx-auto px-4 md:px-6 py-6">
                {/* Non connecté */}
                {!isAuthenticated && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#EBF4FB' }}>
                            <i className="ri-lock-line text-2xl" style={{ color: '#125C8D' }}></i>
                        </div>
                        <p className="text-base font-poppins font-semibold mb-2" style={{ color: '#111827' }}>
                            Connectez-vous pour voir vos notifications
                        </p>
                    </div>
                )}
                {/* Chargement */}
                {isAuthenticated && loading && (
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white rounded-xl h-20 animate-pulse" style={{ border: '1px solid #E5E7EB' }} />
                        ))}
                    </div>
                )}
                {/* Vide */}
                {isAuthenticated && !loading && notifications.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#EBF4FB' }}>
                            <i className="ri-notification-off-line text-2xl" style={{ color: '#125C8D' }}></i>
                        </div>
                        <p className="text-base font-poppins font-semibold mb-1" style={{ color: '#111827' }}>
                            Aucune notification
                        </p>
                        <p className="text-sm font-inter" style={{ color: '#9CA3AF' }}>
                            Vous serez notifié ici pour vos commandes, messages et litiges.
                        </p>
                    </div>
                )}
                {/* Liste groupée */}
                {isAuthenticated && !loading && notifications.length > 0 && (
                    <div className="space-y-6">
                        {Object.entries(grouped).map(([dateLabel, items]) => (
                            <div key={dateLabel}>
                                <p className="text-xs font-poppins font-semibold uppercase tracking-wider mb-3" style={{ color: '#9CA3AF' }}>
                                    {dateLabel}
                                </p>
                                <div className="space-y-2">
                                    {items.map((notif) => {
                                        const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.order_update;
                                        const link = getResourceLink(notif.resource_type, notif.resource_id);
                                        return (
                                            <div
                                                key={notif.id}
                                                onClick={() => handleClick(notif)}
                                                className="flex items-start gap-4 p-4 rounded-xl transition-all"
                                                style={{
                                                    backgroundColor: notif.is_read ? '#fff' : '#F0F7FF',
                                                    border: `1px solid ${notif.is_read ? '#E5E7EB' : '#BFDBFE'}`,
                                                    cursor: link ? 'pointer' : 'default',
                                                }}
                                            >
                                                {/* Icône */}
                                                <div
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                                    style={{ backgroundColor: cfg.bg }}
                                                >
                                                    <i className={`${cfg.icon} text-base`} style={{ color: cfg.color }}></i>
                                                </div>
                                                {/* Contenu */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div>
                                                            <span
                                                                className="text-xs font-poppins font-bold px-2 py-0.5 rounded-full mb-1 inline-block"
                                                                style={{ backgroundColor: cfg.bg, color: cfg.color }}
                                                            >
                                                                {cfg.label}
                                                            </span>
                                                            <p className="text-sm font-poppins font-semibold" style={{ color: '#111827' }}>
                                                                {notif.title}
                                                            </p>
                                                            {notif.body && (
                                                                <p className="text-xs font-inter mt-0.5 leading-relaxed" style={{ color: '#6B7280' }}>
                                                                    {notif.body}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                                            <span className="text-xs font-inter whitespace-nowrap" style={{ color: '#9CA3AF' }}>
                                                                {formatRelative(notif.created_at)}
                                                            </span>
                                                            {!notif.is_read && (
                                                                <span
                                                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                                                    style={{ backgroundColor: '#125C8D' }}
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                    {link && (
                                                        <p className="text-xs font-poppins font-medium mt-1.5 flex items-center gap-1" style={{ color: cfg.color }}>
                                                            Voir les détails <i className="ri-arrow-right-s-line"></i>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
