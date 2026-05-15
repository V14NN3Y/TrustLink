import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/lib/supabaseClient';

const STEPS = [
  { key: 'profile', label: 'Compléter mon profil', desc: 'Ajoutez votre nom et vos coordonnées', icon: 'ri-user-line', path: '/settings/profile' },
  { key: 'boutique', label: 'Configurer ma boutique', desc: 'Nom, description et logo de votre boutique', icon: 'ri-store-2-line', path: '/settings/boutique' },
  { key: 'kyc', label: 'Vérification KYC', desc: 'Soumettez vos documents d\'identité', icon: 'ri-shield-check-line', path: '/support' },
  { key: 'product', label: 'Ajouter un produit', desc: 'Créez votre premier produit en vente', icon: 'ri-archive-line', path: '/catalog/new' },
  { key: 'first_order', label: 'Première commande', desc: 'En attente de votre première vente', icon: 'ri-shopping-bag-line', path: '/orders' },
];

export default function OnboardingChecklist() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
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
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('seller_id', user.id).then(({ count }) => { checks.product = (count || 0) > 0; });
    supabase.from('order_items').select('id', { count: 'exact', head: true }).eq('seller_id', user.id).then(({ count }) => { checks.first_order = (count || 0) > 0; });
    setDone(checks);
  }, [profile, user]);

  const allDone = Object.values(done).every(Boolean);
  const completedCount = Object.values(done).filter(Boolean).length;

  if (dismissed || allDone) return null;

  return (
    <div className="bg-white rounded-xl border border-[#FF6A00]/20 p-5 mb-6" style={{ background: 'linear-gradient(135deg, #FFF8F0, #FFF0E0)' }}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Bienvenue sur TrustLink ! 🎉</h3>
          <p className="text-xs text-gray-500 mt-0.5">{completedCount}/{STEPS.length} étapes complétées</p>
        </div>
        <button onClick={() => { setDismissed(true); localStorage.setItem('seller_onboarding_dismissed', 'true'); }}
          className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer">Ignorer</button>
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
                <p className={`text-xs font-semibold ${isDone ? 'text-green-600 line-through' : 'text-gray-700'}`}>{s.label}</p>
                <p className="text-[10px] text-gray-400">{s.desc}</p>
              </div>
              {!isDone && <i className="ri-arrow-right-s-line text-gray-300" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
