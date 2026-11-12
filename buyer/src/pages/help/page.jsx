import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/lib/I18nContext';

function getCategories(t) {
  return [
    {
      id: 'orders', label: t('help.catOrders'), icon: 'ri-shopping-bag-line',
      items: [
        { q: t('help.orders_q0'), a: t('help.orders_a0') },
        { q: t('help.orders_q1'), a: t('help.orders_a1') },
        { q: t('help.orders_q2'), a: t('help.orders_a2') },
        { q: t('help.orders_q3'), a: t('help.orders_a3') },
      ],
    },
    {
      id: 'escrow', label: t('help.catEscrow'), icon: 'ri-shield-check-line',
      items: [
        { q: t('help.escrow_q0'), a: t('help.escrow_a0') },
        { q: t('help.escrow_q1'), a: t('help.escrow_a1') },
        { q: t('help.escrow_q2'), a: t('help.escrow_a2') },
        { q: t('help.escrow_q3'), a: t('help.escrow_a3') },
      ],
    },
    {
      id: 'returns', label: t('help.catReturns'), icon: 'ri-arrow-go-back-line',
      items: [
        { q: t('help.returns_q0'), a: t('help.returns_a0') },
        { q: t('help.returns_q1'), a: t('help.returns_a1') },
        { q: t('help.returns_q2'), a: t('help.returns_a2') },
        { q: t('help.returns_q3'), a: t('help.returns_a3') },
      ],
    },
    {
      id: 'account', label: t('help.catAccount'), icon: 'ri-user-3-line',
      items: [
        { q: t('help.account_q0'), a: t('help.account_a0') },
        { q: t('help.account_q1'), a: t('help.account_a1') },
        { q: t('help.account_q2'), a: t('help.account_a2') },
        { q: t('help.account_q3'), a: t('help.account_a3') },
      ],
    },
  ];
}

export default function Help() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('orders');
  const [activeSidebar, setActiveSidebar] = useState('orders');
  const [open, setOpen] = useState(null);
  const [search, setSearch] = useState('');

  const CATEGORIES = getCategories(t);
  const activeCategory = CATEGORIES.find((c) => c.id === activeSidebar);

  return (
    <div className="pt-28 md:pt-20 min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      <div style={{ backgroundColor: '#0E3A4F' }} className="text-white py-14">
        <div className="max-w-[860px] mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-5">
            <i className="ri-customer-service-2-line text-sm"></i>
            <span className="text-sm font-poppins font-medium">{t('help.heroBadge')}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-poppins font-bold mb-3">{t('help.heroTitle')}</h1>
          <p className="text-base font-inter text-white/70 mb-8">{t('help.heroDesc')}</p>
          <div className="max-w-xl mx-auto">
            <div className="flex items-center bg-white rounded-xl overflow-hidden px-4 py-3 gap-3">
              <i className="ri-search-line text-lg" style={{ color: '#9CA3AF' }}></i>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('help.searchPlaceholder')}
                className="flex-1 text-sm font-inter outline-none"
                style={{ color: '#111827' }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-100 sticky z-30" style={{ top: '80px' }}>
        <div className="max-w-[1100px] mx-auto px-4 md:px-6">
          <div className="flex gap-1 overflow-x-auto py-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setActiveTab(cat.id); setActiveSidebar(cat.id); setOpen(null); }}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-poppins font-medium transition-all"
                style={activeTab === cat.id
                  ? { backgroundColor: '#0E3A4F', color: '#fff' }
                  : { color: '#6B7280', backgroundColor: 'transparent' }}
              >
                <i className={`${cat.icon} text-sm`}></i>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          <aside className="md:w-56 flex-shrink-0">
            <p className="text-xs font-poppins font-semibold uppercase tracking-wider mb-3" style={{ color: '#9CA3AF' }}>{t('help.sidebarTitle')}</p>
            <div className="space-y-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveSidebar(cat.id); setOpen(null); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-poppins transition-all text-left"
                  style={activeSidebar === cat.id
                    ? { backgroundColor: '#EBF4FB', color: '#125C8D', fontWeight: '600' }
                    : { color: '#374151' }}
                >
                  <i className={`${cat.icon} text-sm`}></i>
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-gray-200">
              <p className="text-xs font-poppins font-semibold mb-3" style={{ color: '#9CA3AF' }}>{t('help.sidebarCtaTitle')}</p>
              <Link to="/support"
                className="flex items-center justify-center gap-2 w-full py-2.5 text-white text-sm font-poppins font-semibold rounded-lg transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#FF6A00' }}>
                <i className="ri-customer-service-2-line text-sm"></i>
                {t('help.sidebarCta')}
              </Link>
            </div>
          </aside>

          <div className="flex-1">
            <div className="bg-white rounded-xl overflow-hidden mb-4" style={{ border: '1px solid #E5E7EB' }}>
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                <i className={`${activeCategory.icon} text-base`} style={{ color: '#125C8D' }}></i>
                <h2 className="text-base font-poppins font-semibold" style={{ color: '#111827' }}>{activeCategory.label}</h2>
              </div>
              {activeCategory.items.map((item, idx) => {
                const isOpen = open === idx;
                return (
                  <div key={idx} className="border-b border-gray-50 last:border-0">
                    <button onClick={() => setOpen(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors">
                      <span className="text-sm font-poppins font-medium pr-4" style={{ color: '#111827' }}>{item.q}</span>
                      <i className={`flex-shrink-0 text-lg ${isOpen ? 'ri-subtract-line' : 'ri-add-line'}`} style={{ color: '#125C8D' }}></i>
                    </button>
                    <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: isOpen ? '300px' : '0' }}>
                      <p className="px-5 pb-4 text-sm font-inter leading-relaxed" style={{ color: '#6B7280' }}>{item.a}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ border: '1px solid #E5E7EB' }}>
              <div>
                <p className="text-sm font-poppins font-semibold mb-0.5" style={{ color: '#111827' }}>{t('help.ctaTitle')}</p>
                <p className="text-xs font-inter" style={{ color: '#9CA3AF' }}>{t('help.ctaDesc')}</p>
              </div>
              <Link to="/support"
                className="flex items-center gap-2 px-5 py-2.5 text-white text-sm font-poppins font-semibold rounded-lg flex-shrink-0 transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#FF6A00' }}>
                <i className="ri-customer-service-2-line text-sm"></i>
                {t('help.ctaButton')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}