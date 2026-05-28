import { useState } from 'react';
import { useI18n } from '@/lib/I18nContext';

function getFaqData(t) {
  return [
    {
      category: t('faq.catDelivery'),
      icon: 'ri-truck-line',
      items: [
        { q: t('faq.delivery_q0'), a: t('faq.delivery_a0') },
        { q: t('faq.delivery_q1'), a: t('faq.delivery_a1') },
        { q: t('faq.delivery_q2'), a: t('faq.delivery_a2') },
        { q: t('faq.delivery_q3'), a: t('faq.delivery_a3') },
        { q: t('faq.delivery_q4'), a: t('faq.delivery_a4') },
      ],
    },
    {
      category: t('faq.catEscrow'),
      icon: 'ri-shield-check-line',
      items: [
        { q: t('faq.escrow_q0'), a: t('faq.escrow_a0') },
        { q: t('faq.escrow_q1'), a: t('faq.escrow_a1') },
        { q: t('faq.escrow_q2'), a: t('faq.escrow_a2') },
        { q: t('faq.escrow_q3'), a: t('faq.escrow_a3') },
        { q: t('faq.escrow_q4'), a: t('faq.escrow_a4') },
      ],
    },
    {
      category: t('faq.catReturns'),
      icon: 'ri-arrow-go-back-line',
      items: [
        { q: t('faq.returns_q0'), a: t('faq.returns_a0') },
        { q: t('faq.returns_q1'), a: t('faq.returns_a1') },
        { q: t('faq.returns_q2'), a: t('faq.returns_a2') },
        { q: t('faq.returns_q3'), a: t('faq.returns_a3') },
      ],
    },
    {
      category: t('faq.catAccount'),
      icon: 'ri-user-3-line',
      items: [
        { q: t('faq.account_q0'), a: t('faq.account_a0') },
        { q: t('faq.account_q1'), a: t('faq.account_a1') },
        { q: t('faq.account_q2'), a: t('faq.account_a2') },
        { q: t('faq.account_q3'), a: t('faq.account_a3') },
      ],
    },
  ];
}

export default function FAQ() {
  const { t } = useI18n();
  const [open, setOpen] = useState(null);

  const FAQ_DATA = getFaqData(t);

  return (
    <div className="pt-20">
      <div style={{ backgroundColor: '#0E3A4F' }} className="text-white py-14">
        <div className="max-w-[860px] mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-poppins font-bold mb-3">{t('faq.heroTitle')}</h1>
          <p className="text-base font-inter text-white/70">{t('faq.heroDesc')}</p>
        </div>
      </div>

      <div className="max-w-[860px] mx-auto px-4 py-10">
        {FAQ_DATA.map((section) => (
          <section key={section.category} className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <i className={`${section.icon} text-lg`} style={{ color: '#125C8D' }}></i>
              <h2 className="text-lg font-poppins font-semibold" style={{ color: '#111827' }}>{section.category}</h2>
            </div>
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              {section.items.map((item, idx) => {
                const key = `${section.category}-${idx}`;
                const isOpen = open === key;
                return (
                  <div key={key} className="border-b border-gray-50 last:border-0">
                    <button
                      onClick={() => setOpen(isOpen ? null : key)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                    >
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
          </section>
        ))}
      </div>
    </div>
  );
}