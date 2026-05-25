import { useState } from 'react';
import DashboardLayout from '@/components/feature/DashboardLayout';
import { Link } from 'react-router-dom';
import { useLocale } from '@/lib/i18n';

export default function HelpPage() {
  const [openFAQ, setOpenFAQ] = useState(null);
  const { t } = useLocale();
  const faqs = t('help.faqs');

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>{t('help.title')}</h2>
        <p className="text-sm text-gray-400">{t('help.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
            <i className="ri-rocket-line text-[#125C8D] text-xl" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 mb-1">{t('help.gettingStarted')}</h3>
          <p className="text-xs text-gray-500 mb-3">{t('help.gettingStartedDesc')}</p>
          <Link to="/settings/boutique" className="text-xs font-semibold text-[#125C8D] hover:underline">{t('help.configure')}</Link>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mx-auto mb-3">
            <i className="ri-question-line text-amber-500 text-xl" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 mb-1">{t('help.faqTitle')}</h3>
          <p className="text-xs text-gray-500 mb-3">{t('help.faqDesc')}</p>
          <span className="text-xs font-semibold text-[#125C8D]">{t('help.consultBelow')}</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mx-auto mb-3">
            <i className="ri-customer-service-2-line text-green-500 text-xl" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 mb-1">{t('help.contact')}</h3>
          <p className="text-xs text-gray-500 mb-3">{t('help.contactDesc')}</p>
          <Link to="/messages" className="text-xs font-semibold text-[#125C8D] hover:underline">{t('help.messaging')}</Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900">{t('help.faqSection')}</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {Array.isArray(faqs) && faqs.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <span className="text-sm font-medium text-gray-800">{faq.q}</span>
                <i className={`ri-arrow-${openFAQ === i ? 'up' : 'down'}-s-line text-gray-400 transition-transform flex-shrink-0 ml-3`} />
              </button>
              {openFAQ === i && (
                <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
