import { Link } from 'react-router-dom';
import { useI18n } from '@/lib/I18nContext';

export default function EscrowPage() {
  const { t } = useI18n();

const STEPS = [
  {
    num: '01',
    icon: 'ri-shopping-cart-line',
    title: t('escrow.step1Title'),
    desc: t('escrow.step1Desc'),
    color: '#125C8D',
    bg: '#E1F0F9',
  },
  {
    num: '02',
    icon: 'ri-store-2-line',
    title: t('escrow.step2Title'),
    desc: t('escrow.step2Desc'),
    color: '#7C3AED',
    bg: '#F5F3FF',
  },
  {
    num: '03',
    icon: 'ri-truck-line',
    title: t('escrow.step3Title'),
    desc: t('escrow.step3Desc'),
    color: '#D97706',
    bg: '#FEF3C7',
  },
  {
    num: '04',
    icon: 'ri-video-line',
    title: t('escrow.step4Title'),
    desc: t('escrow.step4Desc'),
    color: '#FF6A00',
    bg: '#FFF3EC',
  },
  {
    num: '05',
    icon: 'ri-check-double-line',
    title: t('escrow.step5Title'),
    desc: t('escrow.step5Desc'),
    color: '#15803D',
    bg: '#DCFCE7',
  },
];

const PROTECTIONS = [
  {
    icon: 'ri-shield-check-line',
    title: t('escrow.protectSecurePayment'),
    desc: t('escrow.protectSecurePaymentDesc'),
  },
  {
    icon: 'ri-video-line',
    title: t('escrow.protectUnboxing'),
    desc: t('escrow.protectUnboxingDesc'),
  },
  {
    icon: 'ri-time-line',
    title: t('escrow.protectTime'),
    desc: t('escrow.protectTimeDesc'),
  },
  {
    icon: 'ri-customer-service-2-line',
    title: t('escrow.protectMediation'),
    desc: t('escrow.protectMediationDesc'),
  },
  {
    icon: 'ri-refund-2-line',
    title: t('escrow.protectRefund'),
    desc: t('escrow.protectRefundDesc'),
  },
  {
    icon: 'ri-bank-line',
    title: t('escrow.protectFunds'),
    desc: t('escrow.protectFundsDesc'),
  },
];

const FAQS = [
  {
    q: t('escrow.faqShip'),
    a: t('escrow.faqShipA'),
  },
  {
    q: t('escrow.faqDamage'),
    a: t('escrow.faqDamageA'),
  },
  {
    q: t('escrow.faqRefundTime'),
    a: t('escrow.faqRefundTimeA'),
  },
  {
    q: t('escrow.faqCommission'),
    a: t('escrow.faqCommissionA'),
  },
];
  return (
    <div className="pt-20 min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>

      {/* Hero */}
      <div style={{ backgroundColor: '#0E3A4F' }} className="text-white py-14">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-poppins font-semibold mb-4"
            style={{ backgroundColor: 'rgba(255,106,0,0.2)', color: '#FF6A00' }}>
            <i className="ri-shield-star-line"></i>
            {t('escrow.heroBadge')}
          </div>
          <h1 className="text-3xl md:text-4xl font-poppins font-bold mb-4"
            dangerouslySetInnerHTML={{ __html: t('escrow.heroTitle') }}>
          </h1>
          <p className="text-base font-inter text-white/75 max-w-xl mx-auto mb-8">
            {t('escrow.heroDesc')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/"
              className="px-6 py-3 rounded-full font-poppins font-semibold text-sm text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#FF6A00' }}>
              {t('escrow.ctaDiscover')}
            </Link>
            <Link to="/support"
              className="px-6 py-3 rounded-full font-poppins font-semibold text-sm border border-white/30 text-white hover:bg-white/10 transition-colors">
              {t('escrow.ctaSupport')}
            </Link>
          </div>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { val: '100%', label: t('escrow.statPayments'), icon: 'ri-shield-check-line' },
              { val: '60h', label: t('escrow.statConfirm'), icon: 'ri-time-line' },
              { val: '72h', label: t('escrow.statResolution'), icon: 'ri-customer-service-2-line' },
              { val: '0€', label: t('escrow.statRefund'), icon: 'ri-refund-2-line' },
            ].map(({ val, label, icon }) => (
              <div key={val} className="py-4">
                <i className={`${icon} text-2xl mb-2 block`} style={{ color: '#125C8D' }}></i>
                <p className="text-2xl font-poppins font-bold" style={{ color: '#111827' }}>{val}</p>
                <p className="text-xs font-inter mt-1" style={{ color: '#6B7280' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-12">

        {/* How it works */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-poppins font-bold mb-2" style={{ color: '#111827' }}>
              {t('escrow.howItWorks')}
            </h2>
            <p className="text-sm font-inter" style={{ color: '#6B7280' }}>
              {t('escrow.howItWorksDesc')}
            </p>
          </div>

          <div className="relative">
            {/* Ligne connecteur desktop */}
            <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-0.5" style={{ backgroundColor: '#E5E7EB' }} />

            <div className="grid md:grid-cols-5 gap-6">
              {STEPS.map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center relative">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 relative z-10"
                    style={{ backgroundColor: step.bg }}>
                    <i className={`${step.icon} text-2xl`} style={{ color: step.color }}></i>
                  </div>
                  <span className="text-xs font-poppins font-bold mb-1" style={{ color: '#9CA3AF' }}>
                    {t('escrow.stepLabel').replace('{num}', step.num)}
                  </span>
                  <h3 className="text-sm font-poppins font-bold mb-2" style={{ color: '#111827' }}>
                    {step.title}
                  </h3>
                  <p className="text-xs font-inter leading-relaxed" style={{ color: '#6B7280' }}>
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tes protections */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-poppins font-bold mb-2" style={{ color: '#111827' }}>
              {t('escrow.protections')}
            </h2>
            <p className="text-sm font-inter" style={{ color: '#6B7280' }}>
              {t('escrow.protectionsDesc')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PROTECTIONS.map((p, i) => (
              <div key={i} className="bg-white rounded-xl p-5" style={{ border: '1px solid #F0F0F0' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: '#E1F0F9' }}>
                  <i className={`${p.icon} text-lg`} style={{ color: '#125C8D' }}></i>
                </div>
                <h3 className="text-sm font-poppins font-bold mb-1.5" style={{ color: '#111827' }}>
                  {p.title}
                </h3>
                <p className="text-xs font-inter leading-relaxed" style={{ color: '#6B7280' }}>
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Money flow diagram */}
        <div className="bg-white rounded-2xl p-6 md:p-8 mb-16" style={{ border: '1px solid #F0F0F0' }}>
          <h2 className="text-xl font-poppins font-bold mb-2 text-center" style={{ color: '#111827' }}>
            {t('escrow.moneyFlow')}
          </h2>
          <p className="text-sm font-inter text-center mb-8" style={{ color: '#6B7280' }}>
            {t('escrow.moneyFlowDesc')}
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-0">
            {[
              { label: t('escrow.flowYou'), sub: t('escrow.flowYouPay'), icon: 'ri-user-line', color: '#125C8D', bg: '#E1F0F9' },
              null,
              { label: t('escrow.flowEscrow'), sub: t('escrow.flowEscrowHold'), icon: 'ri-bank-line', color: '#7C3AED', bg: '#F5F3FF', big: true },
              null,
              { label: t('escrow.flowSeller'), sub: t('escrow.flowSellerReceive'), icon: 'ri-store-2-line', color: '#15803D', bg: '#DCFCE7' },
            ].map((item, i) => {
              if (item === null) {
                return (
                  <div key={i} className="flex md:flex-col items-center gap-1 px-2">
                    <i className="ri-arrow-right-s-line text-2xl md:rotate-0 rotate-90" style={{ color: '#D1D5DB' }}></i>
                  </div>
                );
              }
              return (
                <div key={i} className={`flex flex-col items-center text-center ${item.big ? 'md:scale-110' : ''}`}>
                  <div className={`${item.big ? 'w-20 h-20' : 'w-16 h-16'} rounded-2xl flex items-center justify-center mb-2`}
                    style={{ backgroundColor: item.bg }}>
                    <i className={`${item.icon} ${item.big ? 'text-3xl' : 'text-2xl'}`} style={{ color: item.color }}></i>
                  </div>
                  <p className="text-sm font-poppins font-bold" style={{ color: '#111827' }}>{item.label}</p>
                  <p className="text-xs font-inter mt-0.5" style={{ color: '#9CA3AF' }}>{item.sub}</p>
                </div>
              );
            })}
          </div>

          <p className="text-center text-xs font-inter mt-6 px-4 py-3 rounded-lg"
            style={{ backgroundColor: '#F0FFF4', color: '#15803D' }}>
            <i className="ri-information-line mr-1"></i>
            {t('escrow.flowNote')}
          </p>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-poppins font-bold mb-2" style={{ color: '#111827' }}>
              {t('escrow.faq')}
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <details key={i}
                className="bg-white rounded-xl overflow-hidden group"
                style={{ border: '1px solid #F0F0F0' }}>
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none">
                  <span className="text-sm font-poppins font-semibold pr-4" style={{ color: '#111827' }}>
                    {faq.q}
                  </span>
                  <i className="ri-add-line text-lg flex-shrink-0 group-open:hidden" style={{ color: '#125C8D' }}></i>
                  <i className="ri-subtract-line text-lg flex-shrink-0 hidden group-open:block" style={{ color: '#125C8D' }}></i>
                </summary>
                <div className="px-5 pb-4">
                  <p className="text-sm font-inter leading-relaxed" style={{ color: '#6B7280' }}>{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* CTA final */}
        <div className="rounded-2xl p-8 text-center text-white" style={{ backgroundColor: '#0E3A4F' }}>
          <i className="ri-shield-star-fill text-4xl mb-4 block" style={{ color: '#FF6A00' }}></i>
          <h2 className="text-xl font-poppins font-bold mb-2">{t('escrow.ctaFinal')}</h2>
          <p className="text-sm font-inter text-white/70 mb-6 max-w-md mx-auto">
            {t('escrow.ctaFinalDesc')}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/support"
              className="px-6 py-2.5 rounded-full font-poppins font-semibold text-sm text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#FF6A00' }}>
              {t('escrow.ctaSupport')}
            </Link>
            <Link to="/legal?tab=cgu"
              className="px-6 py-2.5 rounded-full font-poppins font-semibold text-sm border border-white/30 text-white hover:bg-white/10 transition-colors">
              {t('escrow.ctaCgu')}
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
