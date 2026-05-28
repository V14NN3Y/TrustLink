import { Link } from 'react-router-dom';
import { useI18n } from '@/lib/I18nContext';

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer>
      {/* Reassurance bar */}
      <div style={{ backgroundColor: '#125C8D' }} className="text-white py-3">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            {[
              { icon: 'ri-shield-check-line', text: t('footer.securePayment') },
              { icon: 'ri-truck-line', text: t('footer.expressDelivery') },
              { icon: 'ri-shield-star-line', text: t('footer.escrowProtection') },
              { icon: 'ri-customer-service-2-line', text: t('footer.support247') },
            ].map((item) => (
              <div key={item.text} className="flex items-center justify-center gap-2">
                <i className={`${item.icon} text-base`} />
                <span className="text-xs font-poppins font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div style={{ backgroundColor: '#0E3A4F' }} className="text-white py-12">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <Link to="/" className="inline-flex items-center gap-2 mb-4">
                <img src="/TrustLink_Logo_Bleu-Fonce.png" alt="TrustLink" className="h-8 w-auto" />
              </Link>
              <p className="text-sm font-inter text-white/70 mb-5 leading-relaxed">
                {t('footer.brandDesc')}
              </p>
              <div className="flex gap-3">
                {[
                  { icon: 'ri-facebook-fill', href: '#' },
                  { icon: 'ri-instagram-line', href: '#' },
                  { icon: 'ri-twitter-x-line', href: '#' },
                  { icon: 'ri-whatsapp-line', href: '#' },
                ].map((s) => (
                  <a
                    key={s.icon}
                    href={s.href}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)')}
                  >
                    <i className={`${s.icon} text-sm text-white`} />
                  </a>
                ))}
              </div>
            </div>

            {/* Marketplace */}
            <div>
              <h3 className="font-poppins font-semibold text-sm mb-4 text-white uppercase tracking-wide">{t('footer.marketplace')}</h3>
              <ul className="space-y-2.5">
                {[
                  { to: '/', label: t('footer.shop') },
                  { to: '/wishlist', label: t('footer.myWishlist') },
                  { to: '/cart', label: t('footer.myCart') },
                  { to: '/account', label: t('footer.myOrders') },
                ].map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-sm font-inter text-white/70 hover:text-white transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-poppins font-semibold text-sm mb-4 text-white uppercase tracking-wide">{t('footer.support')}</h3>
              <ul className="space-y-2.5">
                {[
                  { to: '/faq', label: t('footer.helpCenter') },
                  { to: '/support', label: t('footer.supportMessaging') },
                  { to: '/policy/returns', label: t('footer.returnPolicy') },
                  { to: '/account', label: t('footer.orderTracking') },
                ].map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-sm font-inter text-white/70 hover:text-white transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-poppins font-semibold text-sm mb-4 text-white uppercase tracking-wide">{t('footer.legal')}</h3>
              <ul className="space-y-2.5">
                {[
                  { to: '/legal?tab=mentions', label: t('footer.legalMentions') },
                  { to: '/legal?tab=confidentialite', label: t('footer.privacy') },
                  { to: '/legal?tab=cgu', label: t('footer.terms') },
                  { to: '/escrow', label: t('footer.escrow') },
                ].map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-sm font-inter text-white/70 hover:text-white transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs font-inter text-white/50">{t('footer.rights')}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-inter text-white/50 mr-2">{t('footer.acceptedPayments')}</span>
              {['MTN', 'Moov', 'Wave'].map((m) => (
                <span key={m} className="text-xs font-poppins font-bold px-2 py-1 rounded" style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}>{m}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
