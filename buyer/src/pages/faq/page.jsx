import { useState } from 'react';

const FAQ_DATA = [
  {
    category: 'Livraison',
    icon: 'ri-truck-line',
    items: [
      { q: 'Combien de temps prend la livraison ?', a: 'La livraison prend généralement entre 2 et 7 jours ouvrables depuis Lagos jusqu\'à Cotonou. Les délais peuvent varier selon la disponibilité du produit et la destination finale au Bénin.' },
      { q: 'Livrez-vous dans toutes les villes du Bénin ?', a: 'Nous livrons actuellement à Cotonou, Porto-Novo, Parakou, Abomey-Calavi et Bohicon. D\'autres villes seront ajoutées progressivement.' },
      { q: 'Comment puis-je suivre ma commande ?', a: 'Après confirmation de votre commande, vous recevez un numéro de suivi au format TL-XXXXXXXX. Rendez-vous dans "Mon Compte > Mes Commandes" pour suivre l\'état en temps réel.' },
      { q: 'Quels sont les frais de livraison ?', a: 'Les frais de livraison sont fixés à 2 500 FCFA par commande, quelle que soit la quantité d\'articles commandés. La livraison est incluse dans le prix affiché à la caisse.' },
      { q: 'Que se passe-t-il si je ne suis pas disponible à la livraison ?', a: 'Notre livreur vous contactera 30 minutes avant la livraison. En cas d\'absence, il repassera le lendemain. Après 3 tentatives infructueuses, la commande est retournée au hub.' },
    ],
  },
  {
    category: 'Paiement Escrow',
    icon: 'ri-shield-check-line',
    items: [
      { q: 'Comment fonctionne le système Escrow ?', a: 'L\'Escrow est un mécanisme de paiement sécurisé : vous payez d\'abord TrustLink qui sécurise vos fonds. Le vendeur est ensuite notifié et prépare votre commande. Une fois que vous confirmez la réception, TrustLink verse le paiement au vendeur.' },
      { q: 'Quelles méthodes de paiement acceptez-vous ?', a: 'Nous acceptons MTN Mobile Money, Moov Money et Wave. Ces options sont sécurisées et disponibles 24h/24. D\'autres méthodes de paiement seront ajoutées prochainement.' },
      { q: 'Mes données de paiement sont-elles sécurisées ?', a: 'Absolument. Toutes les transactions sont chiffrées selon les normes PCI-DSS. TrustLink ne stocke jamais vos numéros de compte ou données bancaires sensibles.' },
      { q: 'Quand le vendeur reçoit-il son paiement ?', a: 'Le vendeur reçoit son paiement uniquement après que vous confirmez la bonne réception de votre commande, ou automatiquement après 7 jours si vous n\'émettez aucune réclamation.' },
      { q: 'Que se passe-t-il si je refuse la commande à la livraison ?', a: 'Si vous refusez la commande pour une raison valable (article non conforme, endommagé...), TrustLink ouvre une procédure de résolution et vous rembourse intégralement.' },
    ],
  },
  {
    category: 'Retours & Remboursements',
    icon: 'ri-arrow-go-back-line',
    items: [
      { q: 'Quelle est la politique de retour de TrustLink ?', a: 'Vous avez 30 jours à compter de la réception pour retourner un article non conforme, endommagé ou défectueux. Les articles personnalisés ou ayant été utilisés ne sont pas éligibles au retour.' },
      { q: 'Comment initier un retour ?', a: 'Connectez-vous à votre compte, accédez à "Mes Commandes", sélectionnez la commande concernée et cliquez sur "Retourner un article". Notre service client vous guidera dans la procédure.' },
      { q: 'Combien de temps prend le remboursement ?', a: 'Une fois le retour validé par notre équipe, le remboursement est effectué dans les 3 à 5 jours ouvrables sur votre moyen de paiement initial.' },
      { q: 'Qui prend en charge les frais de retour ?', a: 'TrustLink prend en charge les frais de retour si l\'article est défectueux ou non conforme à la description. Dans les autres cas, les frais de retour sont à la charge du client.' },
    ],
  },
  {
    category: 'Mon Compte',
    icon: 'ri-user-3-line',
    items: [
      { q: 'Comment créer un compte TrustLink ?', a: 'Cliquez sur l\'icône "Compte" en haut à droite de la page, puis sur "S\'inscrire". Renseignez votre nom, email et numéro de téléphone. Une vérification par SMS sera envoyée.' },
      { q: 'J\'ai oublié mon mot de passe, que faire ?', a: 'Sur la page de connexion, cliquez sur "Mot de passe oublié". Entrez votre adresse email, vous recevrez un lien de réinitialisation valable 24 heures.' },
      { q: 'Puis-je avoir plusieurs adresses de livraison ?', a: 'Oui, vous pouvez enregistrer jusqu\'à 5 adresses de livraison dans votre compte. Lors du checkout, sélectionnez l\'adresse souhaitée ou ajoutez-en une nouvelle.' },
      { q: 'Comment supprimer mon compte ?', a: 'Allez dans Compte > Paramètres > Zone de danger > Supprimer mon compte. Attention, cette action est irréversible et toutes vos données seront effacées définitivement.' },
    ],
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(null);

  return (
    <div className="pt-20">
      {/* Hero */}
      <div style={{ backgroundColor: '#0E3A4F' }} className="text-white py-14">
        <div className="max-w-[860px] mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-poppins font-bold mb-3">Questions Fréquentes</h1>
          <p className="text-base font-inter text-white/70">Tout ce que vous devez savoir sur TrustLink, l'Escrow et la livraison transfrontalière.</p>
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
