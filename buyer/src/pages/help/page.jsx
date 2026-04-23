import { useState } from 'react';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  {
    id: 'orders', label: 'Commandes', icon: 'ri-shopping-bag-line',
    items: [
      { q: 'Comment passer une commande sur TrustLink ?', a: 'Parcourez notre catalogue, ajoutez des produits au panier, puis validez votre commande en renseignant votre adresse et en choisissant votre méthode de paiement Mobile Money.' },
      { q: 'Puis-je modifier ou annuler ma commande ?', a: 'Vous pouvez annuler dans les 30 minutes suivant la commande depuis Mon Compte → Mes Commandes. Après ce délai, contactez notre support.' },
      { q: 'Comment suivre ma commande ?', a: 'Rendez-vous dans Mon Compte → Mes Commandes. Vous trouverez le statut en temps réel et le numéro de suivi au format TL-XXXXXXXX.' },
      { q: 'Quels sont les délais de livraison ?', a: 'La livraison prend entre 2 et 7 jours ouvrables depuis Lagos jusqu\'à Cotonou. Les délais varient selon votre ville au Bénin.' },
    ],
  },
  {
    id: 'escrow', label: 'Paiement & Escrow', icon: 'ri-shield-check-line',
    items: [
      { q: 'Comment fonctionne le système Escrow ?', a: 'Vous payez TrustLink qui sécurise vos fonds. Le vendeur prépare et expédie votre commande. Une fois livrée et confirmée, le paiement est libéré au vendeur.' },
      { q: 'Quelles méthodes de paiement acceptez-vous ?', a: 'MTN Mobile Money, Moov Money et Wave sont acceptés. Ces paiements sont chiffrés et sécurisés.' },
      { q: 'Quand suis-je débité ?', a: 'Le débit intervient au moment de la validation de commande. Les fonds sont retenus sur un compte Escrow sécurisé jusqu\'à votre confirmation.' },
      { q: 'Comment ouvrir un litige Escrow ?', a: 'Dans les 48h après livraison, soumettez une vidéo de déballage dans Mon Compte → Mes Commandes → Ouvrir un litige.' },
    ],
  },
  {
    id: 'returns', label: 'Litiges & Remboursements', icon: 'ri-arrow-go-back-line',
    items: [
      { q: 'Quelle est la politique de retour ?', a: 'Vous disposez de 30 jours pour retourner un article non conforme, défectueux ou endommagé. Les articles utilisés ou personnalisés ne sont pas éligibles.' },
      { q: 'Comment initier un retour ?', a: 'Ouvrez un litige dans Mon Compte → Mes Commandes et soumettez une vidéo de déballage. Notre équipe traite le dossier sous 48h.' },
      { q: 'Combien de temps pour être remboursé ?', a: '3 à 5 jours ouvrables après validation du retour. Le remboursement est effectué sur votre compte Mobile Money.' },
      { q: 'Qui prend en charge les frais de retour ?', a: 'TrustLink prend en charge les frais si l\'article est défectueux ou non conforme. Dans les autres cas, les frais sont à la charge du client.' },
    ],
  },
  {
    id: 'account', label: 'Mon Compte', icon: 'ri-user-3-line',
    items: [
      { q: 'Comment créer un compte TrustLink ?', a: 'Cliquez sur l\'icône Compte en haut à droite, puis Inscription. Renseignez vos informations et vérifiez votre numéro de téléphone par SMS.' },
      { q: 'J\'ai oublié mon mot de passe', a: 'Sur la page de connexion, cliquez sur "Mot de passe oublié". Un lien de réinitialisation valable 24h vous sera envoyé.' },
      { q: 'Comment modifier mes informations ?', a: 'Allez dans Mon Compte → Paramètres. Vous pouvez modifier votre adresse, numéro de téléphone et préférences de notification.' },
      { q: 'Comment supprimer mon compte ?', a: 'Dans Mon Compte → Paramètres → Zone de danger → Supprimer mon compte. Cette action est irréversible.' },
    ],
  },
];

export default function Help() {
  const [activeTab, setActiveTab] = useState('orders');
  const [activeSidebar, setActiveSidebar] = useState('orders');
  const [open, setOpen] = useState(null);
  const [search, setSearch] = useState('');

  const activeCategory = CATEGORIES.find((c) => c.id === activeSidebar);

  return (
    <div className="pt-20 min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      {/* Hero */}
      <div style={{ backgroundColor: '#0E3A4F' }} className="text-white py-14">
        <div className="max-w-[860px] mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-5">
            <i className="ri-customer-service-2-line text-sm"></i>
            <span className="text-sm font-poppins font-medium">Centre d'aide TrustLink</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-poppins font-bold mb-3">Comment pouvons-nous vous aider ?</h1>
          <p className="text-base font-inter text-white/70 mb-8">Trouvez rapidement des réponses à vos questions sur les commandes, paiements et litiges.</p>
          <div className="max-w-xl mx-auto">
            <div className="flex items-center bg-white rounded-xl overflow-hidden px-4 py-3 gap-3">
              <i className="ri-search-line text-lg" style={{ color: '#9CA3AF' }}></i>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher une question..."
                className="flex-1 text-sm font-inter outline-none"
                style={{ color: '#111827' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tab bar */}
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
          {/* Sidebar */}
          <aside className="md:w-56 flex-shrink-0">
            <p className="text-xs font-poppins font-semibold uppercase tracking-wider mb-3" style={{ color: '#9CA3AF' }}>Catégories</p>
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
              <p className="text-xs font-poppins font-semibold mb-3" style={{ color: '#9CA3AF' }}>Besoin d'aide directe ?</p>
              <Link to="/support"
                className="flex items-center justify-center gap-2 w-full py-2.5 text-white text-sm font-poppins font-semibold rounded-lg transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#FF6A00' }}>
                <i className="ri-customer-service-2-line text-sm"></i>
                Contacter le support
              </Link>
            </div>
          </aside>

          {/* Content */}
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

            {/* CTA */}
            <div className="bg-white rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ border: '1px solid #E5E7EB' }}>
              <div>
                <p className="text-sm font-poppins font-semibold mb-0.5" style={{ color: '#111827' }}>Vous n'avez pas trouvé votre réponse ?</p>
                <p className="text-xs font-inter" style={{ color: '#9CA3AF' }}>Notre équipe répond en moins de 5 minutes.</p>
              </div>
              <Link to="/support"
                className="flex items-center gap-2 px-5 py-2.5 text-white text-sm font-poppins font-semibold rounded-lg flex-shrink-0 transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#FF6A00' }}>
                <i className="ri-customer-service-2-line text-sm"></i>
                Contacter le support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
