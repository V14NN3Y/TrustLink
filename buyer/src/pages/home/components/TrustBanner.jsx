const ITEMS = [
  { icon: 'ri-shield-check-line', title: 'Paiement Escrow', desc: 'Votre argent est sécurisé jusqu\'à réception de votre commande.' },
  { icon: 'ri-truck-line', title: 'Livraison Express', desc: 'Réception en 2 à 7 jours depuis Lagos jusqu\'à Cotonou.' },
  { icon: 'ri-arrow-go-back-line', title: 'Retours Faciles', desc: 'Retour sous 7 jours si le produit ne correspond pas.' },
  { icon: 'ri-customer-service-2-line', title: 'Support 7j/7', desc: 'Notre équipe est disponible pour vous aider à tout moment.' },
];

export default function TrustBanner() {
  return (
    <div style={{ backgroundColor: '#F1F8FD' }} className="py-6">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ITEMS.map((item) => (
            <div key={item.title} className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: '#125C8D' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                <i className={`${item.icon} text-lg text-white`}></i>
              </div>
              <div>
                <p className="text-sm font-poppins font-semibold text-white mb-0.5">{item.title}</p>
                <p className="text-xs font-inter leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
