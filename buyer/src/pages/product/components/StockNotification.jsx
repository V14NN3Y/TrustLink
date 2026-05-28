import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/I18nContext';

export default function StockNotification({ productId }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const subscribe = async () => {
    if (!email.trim() || loading) return;
    setLoading(true);
    try {
      await supabase.from('stock_notifications').insert({
        product_id: productId,
        email: email.trim(),
      });
      setSubscribed(true);
    } catch (err) {
      console.error("Error subscribing to stock notification:", err);
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <div className="text-xs font-inter text-green-600 flex items-center gap-1">
        <i className="ri-checkbox-circle-line"></i> {t('product.stockNotificationSubscribed')}
      </div>
    );
  }

  return (
    <div className="flex gap-2 items-center">
      <input type="email" value={email} onChange={e => setEmail(e.target.value)}
        placeholder={t('product.stockNotificationPlaceholder')}
        className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#125C8D]" />
      <button onClick={subscribe} disabled={loading || !email.trim()}
        className="text-xs font-poppins font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-50 cursor-pointer whitespace-nowrap"
        style={{ backgroundColor: '#125C8D' }}>
        {loading ? '...' : t('product.notifyMe')}
      </button>
    </div>
  );
}
