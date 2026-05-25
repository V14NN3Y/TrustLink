import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useLocale } from '@/lib/i18n';
import DashboardLayout from '@/components/feature/DashboardLayout';

const ACTION_ICONS = {
  order_status_changed: 'ri-truck-line',
  product_created: 'ri-archive-line',
  product_updated: 'ri-edit-line',
  product_deleted: 'ri-delete-bin-line',
  variant_added: 'ri-stack-line',
  variant_deleted: 'ri-close-line',
  kyc_uploaded: 'ri-shield-check-line',
  profile_updated: 'ri-user-line',
  login: 'ri-login-circle-line',
  password_changed: 'ri-lock-password-line',
  image_uploaded: 'ri-image-line',
  order_dispatched: 'ri-send-plane-line',
};

const ACTION_COLORS = {
  product_created: '#10B981',
  product_updated: '#125C8D',
  product_deleted: '#EF4444',
  order_status_changed: '#FF6A00',
  order_dispatched: '#10B981',
  kyc_uploaded: '#8B5CF6',
  login: '#6B7280',
  profile_updated: '#125C8D',
  variant_added: '#10B981',
  variant_deleted: '#EF4444',
};

function parseDetails(details) {
  if (!details) return null;
  try {
    return typeof details === 'string' ? JSON.parse(details) : details;
  } catch {
    return null;
  }
}

function DetailChip({ label, value }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
      <span className="text-gray-400">{label}:</span> {String(value).slice(0, 30)}
    </span>
  );
}

export default function ActivityPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, locale } = useLocale();

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('seller_logs')
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data }) => { setLogs(data || []); setLoading(false); });
  }, [user]);

  const getActionLabel = (action) => {
    const key = `activity.actions.${action}`;
    const translated = t(key);
    return translated !== key ? translated : action.replace(/_/g, ' ');
  };

  const getActionColor = (action) => ACTION_COLORS[action] || '#125C8D';

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
          {t('activity.title')}
        </h2>
        <p className="text-sm text-gray-400">{t('activity.subtitle')}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-[#125C8D] rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <i className="ri-history-line text-3xl mb-2 block" />
            <p className="text-sm">{t('activity.noActivity')}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {logs.map(l => {
              const details = parseDetails(l.details);
              const color = getActionColor(l.action);
              return (
                <div key={l.id} className="flex items-start gap-3 px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: `${color}15` }}
                  >
                    <i className={`${ACTION_ICONS[l.action] || 'ri-file-list-line'} text-sm`} style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{getActionLabel(l.action)}</p>
                    {details && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {details.product_name && <DetailChip label={locale === "en" ? "Product" : "Produit"} value={details.product_name} />}
                        {details.order_id && <DetailChip label={locale === "en" ? "Order" : "Commande"} value={details.order_id?.slice(0, 8)} />}
                        {details.status && <DetailChip label={locale === "en" ? "Status" : "Statut"} value={details.status} />}
                        {details.name && !details.product_name && <DetailChip label={locale === "en" ? "Name" : "Nom"} value={details.name} />}
                        {details.field && <DetailChip label={locale === "en" ? "Field" : "Champ"} value={details.field} />}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 flex-shrink-0 mt-1 whitespace-nowrap">
                    {new Date(l.created_at).toLocaleDateString(locale === "en" ? "en-GB" : "fr-FR", {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
