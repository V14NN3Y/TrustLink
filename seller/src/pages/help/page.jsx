import { useState } from 'react';
import DashboardLayout from '@/components/feature/DashboardLayout';
import { Link } from 'react-router-dom';

const FAQS = [
  { q: 'Comment créer mon premier produit ?', a: 'Rendez-vous dans Catalogue > Nouveau produit. Remplissez les informations, ajoutez une image, et soumettez à validation. Un administrateur approuvera votre produit sous 24-48h.' },
  { q: 'Comment fonctionne le paiement Escrow ?', a: 'L\'acheteur paie sur TrustLink. Les fonds sont bloqués jusqu\'à confirmation de réception. Après confirmation, le paiement est libéré et programmé pour virement.' },
  { q: 'Quand recevrai-je mes paiements ?', a: 'Les virements sont traités par l\'administration chaque semaine. Vous pouvez suivre l\'état de vos paiements dans la rubrique Paiements.' },
  { q: 'Comment suivre mes commandes ?', a: 'Dans Commandes, vous voyez le statut de chaque article. Vous pouvez mettre à jour le statut (traitement, transit, livré) au fur et à mesure.' },
  { q: 'Comment gérer un litige ?', a: 'En cas de litige, l\'administration examine la vidéo de déballage et tranche. Vous serez notifié de la décision.' },
  { q: 'Comment modifier ma boutique ?', a: 'Dans Paramètres > Boutique & Marque, vous pouvez changer le nom, la description, le logo et les réseaux sociaux.' },
];

export default function HelpPage() {
  const [openFAQ, setOpenFAQ] = useState(null);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Centre d'aide</h2>
        <p className="text-sm text-gray-400">Guide et documentation pour bien démarrer sur TrustLink Seller Hub</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-3">
            <i className="ri-rocket-line text-[#125C8D] text-xl" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 mb-1">Premiers pas</h3>
          <p className="text-xs text-gray-500 mb-3">Configurez votre boutique et créez vos produits</p>
          <Link to="/settings/boutique" className="text-xs font-semibold text-[#125C8D] hover:underline">Configurer →</Link>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mx-auto mb-3">
            <i className="ri-question-line text-amber-500 text-xl" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 mb-1">Questions fréquentes</h3>
          <p className="text-xs text-gray-500 mb-3">Réponses aux questions les plus courantes</p>
          <span className="text-xs font-semibold text-[#125C8D]">Consultez ci-dessous →</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 text-center">
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mx-auto mb-3">
            <i className="ri-customer-service-2-line text-green-500 text-xl" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 mb-1">Nous contacter</h3>
          <p className="text-xs text-gray-500 mb-3">Envoyez un message à l'administration</p>
          <Link to="/messages" className="text-xs font-semibold text-[#125C8D] hover:underline">Messagerie →</Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900">Questions fréquentes</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {FAQS.map((faq, i) => (
            <div key={i}>
              <button onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors cursor-pointer">
                <span className="text-sm font-medium text-gray-800">{faq.q}</span>
                <i className={`ri-arrow-${openFAQ === i ? 'up' : 'down'}-s-line text-gray-400 transition-transform`} />
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
