import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useLocale } from '@/lib/i18n';

const STEPS = [
  { key: 'profile', labelKey: 'onboarding.stepProfile', descKey: 'onboarding.stepProfileDesc', icon: 'ri-user-line', path: '/settings/profile' },
  { key: 'boutique', labelKey: 'onboarding.stepBoutique', descKey: 'onboarding.stepBoutiqueDesc', icon: 'ri-store-2-line', path: '/settings/boutique' },
  { key: 'kyc', labelKey: 'onboarding.stepKyc', descKey: 'onboarding.stepKycDesc', icon: 'ri-shield-check-line', path: '/support' },
  { key: 'product', labelKey: 'onboarding.stepProduct', descKey: 'onboarding.stepProductDesc', icon: 'ri-archive-line', path: '/catalog/new' },
  { key: 'first_order', labelKey: 'onboarding.stepFirstOrder', descKey: 'onboarding.stepFirstOrderDesc', icon: 'ri-shopping-bag-line', path: '/orders' },
];

export default function OnboardingChecklist() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { t } = useLocale();
  const [done, setDone] = useState({});
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('seller_onboarding_dismissed') === 'true');

  useEffect(() => {
    if (!user?.id) return;
    const checks = {
      profile: !!(profile?.full_name && profile?.phone),
      boutique: !!(profile?.business_name && profile?.business_description),
      kyc: !!(profile?.kyc_identity_verified || profile?.kyc_identity_url),
      product: false,
      first_order: false,
    };
    Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('seller_id', user.id),
      supabase.from('order_items').select('id', { count: 'exact', head: true }).eq('seller_id', user.id),
    ]).then(([{ count: productCount }, { count: orderCount }]) => {
      checks.product = (productCount || 0) > 0;
      checks.first_order = (orderCount || 0) > 0;
      setDone({ ...checks });
    });
  }, [profile, user]);

  const allDone = Object.values(done).every(Boolean);
  const completedCount = Object.values(done).filter(Boolean).length;

  if (dismissed || allDone) return null;

  return (
    <div className="bg-white rounded-xl border border-[#FF6A00]/20 p-5 mb-6" style={{ background: 'linear-gradient(135deg, #FFF8F0, #FFF0E0)' }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>{t('onboarding.welcome')}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{completedCount}/{STEPS.length} {t('onboarding.stepsCompleted')}</p>
        </div>
        <button onClick={() => { setDismissed(true); localStorage.setItem('seller_onboarding_dismissed', 'true'); }}
          className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer">{t('onboarding.dismiss')}</button>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
        <div className="h-1.5 rounded-full bg-[#FF6A00] transition-all" style={{ width: `${(completedCount / STEPS.length) * 100}%` }} />
      </div>
      <div className="space-y-1.5">
        {STEPS.map(s => {
          const isDone = done[s.key];
          return (
            <button key={s.key} onClick={() => navigate(s.path)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/60 transition-all cursor-pointer text-left">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${isDone ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                {isDone ? <i className="ri-check-line text-xs" /> : <i className={`${s.icon} text-xs`} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-semibold ${isDone ? 'text-green-600 line-through' : 'text-gray-700'}`}>{t(s.labelKey)}</p>
                <p className="text-[10px] text-gray-400">{t(s.descKey)}</p>
              </div>
              {!isDone && <i className="ri-arrow-right-s-line text-gray-300" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
