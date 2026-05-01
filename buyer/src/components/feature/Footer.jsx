import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer>
      {/* Reassurance bar */}
      <div style={{ backgroundColor: '#125C8D' }} className="text-white py-3">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            {[
              { icon: 'ri-shield-check-line', text: 'Paiement en FCFA sécurisé' },
              { icon: 'ri-truck-line', text: 'Livraison express 2–7 jours' },
              { icon: 'ri-shield-star-line', text: 'Protection Escrow garantie' },
              { icon: 'ri-customer-service-2-line', text: 'Support 7j/7' },
            ].map((item) => (
              <div key={item.text} className="flex items-center justify-center gap-2">
                <i className={`${item.icon} text-base`}></i>
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
                La marketplace de confiance entre le Bénin et le Nigeria. Achetez en FCFA, recevez en toute sécurité.
              </p>
              <div className="flex gap-3">
                {[
                  { icon: 'ri-facebook-fill', href: '#' },
                  { icon: 'ri-instagram-line', href: '#' },
                  { icon: 'ri-twitter-x-line', href: '#' },
                  { icon: 'ri-whatsapp-line', href: '#' },
                ].map((s) => (
                  <a key={s.icon} href={s.href} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                  >
                    <i className={`${s.icon} text-sm`}></i>
                  </a>
                ))}
              </div>
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
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#125C8D' }}>
                  <i className="ri-links-line text-white text-sm"></i>
                </div>
                <span className="font-poppins font-bold text-xl">
                  <span className="text-white">Trust</span><span style={{ color: '#FF6A00' }}>Link</span>
                </span>
              </Link>
              <p className="text-sm font-inter text-white/70 mb-5 leading-relaxed">
                La marketplace de confiance entre le Bénin et le Nigeria. Achetez en FCFA, recevez en toute sécurité.
              </p>
              <div className="flex gap-3">
                {[
                  { icon: 'ri-facebook-fill', href: '#' },
                  { icon: 'ri-instagram-line', href: '#' },
                  { icon: 'ri-twitter-x-line', href: '#' },
                  { icon: 'ri-whatsapp-line', href: '#' },
                ].map((s) => (
                  <a key={s.icon} href={s.href} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}>
                    <i className={`${s.icon} text-sm text-white`}></i>
                  </a>
                ))}
              </div>
            </div>

            {/* Marketplace */}
            <div>
              <h3 className="font-poppins font-semibold text-sm mb-4 text-white uppercase tracking-wide">Marketplace</h3>
              <ul className="space-y-2.5">
                {[
                  { to: '/', label: 'Boutique' },
                  { to: '/wishlist', label: 'Ma Wishlist' },
                  { to: '/cart', label: 'Mon Panier' },
                  { to: '/account', label: 'Mes Commandes' },
                ].map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-sm font-inter text-white/70 hover:text-white transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-poppins font-semibold text-sm mb-4 text-white uppercase tracking-wide">Support</h3>
              <ul className="space-y-2.5">
                {[
                  { to: '/faq', label: 'Centre d\'aide / FAQ' },
                  { to: '/support', label: 'Messagerie Support' },
                  { to: '/policy/returns', label: 'Politique de retour' },
                  { to: '/account', label: 'Suivi de commande' },
                ].map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-sm font-inter text-white/70 hover:text-white transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-poppins font-semibold text-sm mb-4 text-white uppercase tracking-wide">Légal</h3>
              <ul className="space-y-2.5">
                {[
                  { to: '/legal?tab=mentions', label: 'Mentions légales' },
                  { to: '/legal?tab=confidentialite', label: 'Politique de confidentialité' },
                  { to: '/legal?tab=cgu', label: 'Conditions d\'utilisation' },
                  { to: '/legal?tab=escrow', label: 'Protection Escrow' },
                ].map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-sm font-inter text-white/70 hover:text-white transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs font-inter text-white/50">© 2026 TrustLink. Tous droits réservés. Cotonou, Bénin.</p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-inter text-white/50 mr-2">Paiements acceptés :</span>
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
