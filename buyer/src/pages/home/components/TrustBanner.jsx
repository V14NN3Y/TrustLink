const ITEMS = [
  { icon: 'ri-shield-check-line', title: 'Paiement Escrow', desc: 'Votre argent est sécurisé jusqu\'à réception de votre commande.' },
  { icon: 'ri-truck-line', title: 'Livraison Express', desc: 'Réception en 2 à 7 jours depuis Lagos jusqu\'à Cotonou.' },
  { icon: 'ri-arrow-go-back-line', title: 'Retours Faciles', desc: 'Retour sous 7 jours si le produit ne correspond pas.' },
  { icon: 'ri-customer-service-2-line', title: 'Support 7j/7', desc: 'Notre équipe est disponible pour vous aider à tout moment.' },
];

export default function TrustBanner() {
  return (
    <div className="bg-white border-b border-gray-100 py-5">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {ITEMS.map((item, idx) => (
            <div key={item.title} className="flex items-start gap-3">
              {idx > 0 && <div className="hidden md:block w-px self-stretch" style={{ backgroundColor: '#E5E7EB' }}></div>}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#EBF4FB' }}>
                <i className={`${item.icon} text-lg`} style={{ color: '#125C8D' }}></i>
              </div>
              <div>
                <p className="text-sm font-poppins font-semibold mb-0.5" style={{ color: '#111827' }}>{item.title}</p>
                <p className="text-xs font-inter leading-relaxed" style={{ color: '#9CA3AF' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
