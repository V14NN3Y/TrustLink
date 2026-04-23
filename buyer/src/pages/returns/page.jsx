import { useState } from 'react';
import { Link } from 'react-router-dom';

const TOC_SECTIONS = [
  { id: 'intro', label: 'Introduction' },
  { id: 'escrow', label: 'Le Pilier Escrow' },
  { id: 'fcfa', label: 'Conversion FCFA / Naira' },
  { id: 'vendeur', label: 'Responsabilité du Vendeur' },
  { id: 'preuves', label: 'Collecte de Preuves (48h)' },
  { id: 'matrice', label: 'Matrice de Résolution' },
  { id: 'traitement', label: 'Traitement et cas Remboursements' },
  { id: 'exclusions', label: 'Exclusions' },
];

export default function Returns() {
  const [activeSection, setActiveSection] = useState('intro');
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="pt-20 min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      {/* Hero */}
      <div style={{ backgroundColor: '#0E3A4F' }} className="text-white py-12">
        <div className="max-w-[1100px] mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-5">
            <i className="ri-time-line text-sm"></i>
            <span className="text-sm font-poppins font-medium">Il y a plus de 5 min · Mise à jour Avril 2026</span>
          </div>
          <h1 className="text-3xl font-poppins font-bold mb-3">Politique Unifiée de Remboursement & Retours</h1>
          <p className="text-sm font-inter text-white/70 max-w-xl mx-auto mb-8">
            Gouvernance opérationnelle Nigéro-Béninoise. TrustLink exploite la proximité commerciale entre le Nigéria et le Bénin pour offrir une sécurité d'achat sur ces plateformes analogiques.
          </p>
          <div className="flex justify-center gap-6 flex-wrap">
            {[['48h', 'Fenêtre de réclamation'], ['100%', 'Remboursement garanti'], ['72h', 'Traitement']].map(([val, label]) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-poppins font-bold">{val}</div>
                <div className="text-xs font-inter text-white/70">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-inter mb-6" style={{ color: '#9CA3AF' }}>
          <Link to="/" className="hover:underline">Boutique</Link>
          <span>/</span>
          <span style={{ color: '#374151' }}>Politique de Remboursement</span>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* TOC */}
          <aside className="md:w-56 flex-shrink-0">
            <p className="text-xs font-poppins font-semibold uppercase tracking-wider mb-3" style={{ color: '#9CA3AF' }}>Sommaire</p>
            <div className="space-y-0.5">
              {TOC_SECTIONS.map((s) => (
                <button key={s.id} onClick={() => setActiveSection(s.id)}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-poppins transition-all"
                  style={activeSection === s.id
                    ? { backgroundColor: '#EBF4FB', color: '#125C8D', fontWeight: '600' }
                    : { color: '#6B7280' }}>
                  {s.label}
                </button>
              ))}
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1 space-y-5">
            {/* Introduction */}
            <div className="bg-white rounded-xl p-6" style={{ border: '1px solid #E5E7EB' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#EBF4FB' }}>
                  <i className="ri-information-line text-sm" style={{ color: '#125C8D' }}></i>
                </div>
                <h2 className="text-base font-poppins font-semibold" style={{ color: '#111827' }}>Introduction</h2>
              </div>
              <p className="text-sm font-inter leading-relaxed mb-5" style={{ color: '#6B7280' }}>
                TrustLink exploite la proximité commerciale entre le Nigéria et le Bénin pour offrir une sécurité d'achat qui surpasse les plateformes analogiques. En faisant confiance à ces mécanismes d'assurance, nous fournissons à nos acheteurs un système de commerce transfrontalier en une expérience sécurisée, similaire à un achat local.
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: 'ri-shield-check-line', label: 'Escrow Sécurisé', desc: 'Fonds bloqués jusqu\'à confirmation de la livraison' },
                  { icon: 'ri-map-pin-line', label: 'Proximité Régionale', desc: 'Lagos → Cotonou, voilà votre matière' },
                  { icon: 'ri-customer-service-2-line', label: 'Support Dédié', desc: 'Équipe TrustLink disponible 7j/7' },
                ].map((item) => (
                  <div key={item.label} className="text-center p-3 rounded-xl" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E5E7EB' }}>
                    <i className={`${item.icon} text-xl mb-2 block`} style={{ color: '#125C8D' }}></i>
                    <p className="text-xs font-poppins font-semibold mb-1" style={{ color: '#111827' }}>{item.label}</p>
                    <p className="text-xs font-inter" style={{ color: '#9CA3AF' }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Le Pilier Escrow */}
            <div className="bg-white rounded-xl p-6" style={{ border: '1px solid #E5E7EB', borderLeft: '4px solid #FF6A00' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FFF3EC' }}>
                  <i className="ri-shield-star-line text-sm" style={{ color: '#FF6A00' }}></i>
                </div>
                <h2 className="text-base font-poppins font-semibold" style={{ color: '#111827' }}>Le Pilier Escrow</h2>
              </div>
              <p className="text-sm font-inter leading-relaxed mb-4" style={{ color: '#6B7280' }}>
                Tous les paiements sont conservés dans un compte escrow sécurisé. Les fonds ne sont libérés au vendeur que lorsque le client confirme la réception à l'app, ou à l'app de réclamation de 10 heures après la livraison sans litige ouvert.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: 'ri-lock-line', label: 'Fonds Bloqués', desc: 'Sécurisé dès le paiement lors de la commande' },
                  { icon: 'ri-check-double-line', label: 'Libération conditionnelle', desc: 'Uniquement après confirmation de réception' },
                  { icon: 'ri-time-line', label: 'Fenêtre 48h', desc: 'Délai pour signaler toute réclamation' },
                  { icon: 'ri-refund-2-line', label: 'Remboursement garanti', desc: 'En cas de litige valide correctement ouvert' },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-2.5 p-3 rounded-lg" style={{ backgroundColor: '#F8FAFC' }}>
                    <i className={`${item.icon} text-sm mt-0.5 flex-shrink-0`} style={{ color: '#125C8D' }}></i>
                    <div>
                      <p className="text-xs font-poppins font-semibold" style={{ color: '#111827' }}>{item.label}</p>
                      <p className="text-xs font-inter" style={{ color: '#9CA3AF' }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FCFA / Naira */}
            <div className="bg-white rounded-xl p-6" style={{ border: '1px solid #E5E7EB' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#EBF4FB' }}>
                  <i className="ri-exchange-funds-line text-sm" style={{ color: '#125C8D' }}></i>
                </div>
                <h2 className="text-base font-poppins font-semibold" style={{ color: '#111827' }}>Conversion Automatique FCFA / Naira</h2>
              </div>
              <p className="text-sm font-inter leading-relaxed mb-4" style={{ color: '#6B7280' }}>
                Dès que l'acheteur effectue son paiement en FCFA, les fonds sont automatiquement convertis en Naira pour éviter les erreurs de taux de change lors de la transaction.
              </p>
              <div className="flex items-center justify-between mb-4">
                {['Paiement FCFA', 'Cours Naira', 'Vendeur Nigéria'].map((label, i) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className="text-center">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-1 mx-auto" style={{ backgroundColor: '#EBF4FB' }}>
                        <i className={`${i === 0 ? 'ri-money-cny-circle-line' : i === 1 ? 'ri-exchange-line' : 'ri-store-2-line'} text-base`} style={{ color: '#125C8D' }}></i>
                      </div>
                      <p className="text-xs font-poppins font-medium" style={{ color: '#374151' }}>{label}</p>
                    </div>
                    {i < 2 && <i className="ri-arrow-right-s-line text-gray-300 mx-1"></i>}
                  </div>
                ))}
              </div>
              <div className="rounded-lg p-3" style={{ backgroundColor: '#FFF3EC', border: '1px solid #FFD0B0' }}>
                <p className="text-xs font-poppins font-semibold mb-1" style={{ color: '#FF6A00' }}>
                  <i className="ri-information-line mr-1"></i>Important — Blocage de change en cas de remboursement
                </p>
                <p className="text-xs font-inter" style={{ color: '#92400E' }}>
                  En cas de remboursement suite à un litige justifié, la reconversion (Naira → FCFA) sera effectuée au taux de change en vigueur au moment du remboursement. L'acheteur reconnaît et accepte que le montant remboursé puisse différer au moment immédiatement payé en fin des fluctuations du taux de change.
                </p>
              </div>
            </div>

            {/* Vendor responsibility */}
            <div className="bg-white rounded-xl p-6" style={{ border: '1px solid #E5E7EB' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#EBF4FB' }}>
                  <i className="ri-store-2-line text-sm" style={{ color: '#125C8D' }}></i>
                </div>
                <h2 className="text-base font-poppins font-semibold" style={{ color: '#111827' }}>Responsabilité du Vendeur</h2>
              </div>
              <p className="text-sm font-inter leading-relaxed mb-4" style={{ color: '#6B7280' }}>
                La conformité est la responsabilité ultime du vendeur. Il doit télécharger une photo ou vidéo détaillée du produit prêt à l'expédition avant qu'il ne quitte la boutique. En cas de non-conformité majeure, le vendeur supporte les frais d'envoi, de retour et de retour.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: 'ri-vidicon-line', label: 'Preuve d\'expédition obligatoire', desc: 'Photo ou vidéo du produit avant dépôt à la boutique' },
                  { icon: 'ri-checkbox-circle-line', label: 'Conformité produit', desc: 'Le produit doit correspondre exactement à la description et photo' },
                  { icon: 'ri-money-dollar-circle-line', label: 'Frais de retour', desc: 'En cas de non-conformité majeure, à la charge du vendeur' },
                  { icon: 'ri-shield-check-line', label: 'Vérification TrustLink', desc: 'Contrôle qualité au Hub Lagos avant expédition' },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-2.5 p-3 rounded-lg" style={{ backgroundColor: '#F8FAFC' }}>
                    <i className={`${item.icon} text-sm mt-0.5 flex-shrink-0`} style={{ color: '#125C8D' }}></i>
                    <div>
                      <p className="text-xs font-poppins font-semibold" style={{ color: '#111827' }}>{item.label}</p>
                      <p className="text-xs font-inter" style={{ color: '#9CA3AF' }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Collecte de preuves */}
            <div className="bg-white rounded-xl p-6" style={{ border: '1px solid #E5E7EB' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#EBF4FB' }}>
                  <i className="ri-vidicon-line text-sm" style={{ color: '#125C8D' }}></i>
                </div>
                <h2 className="text-base font-poppins font-semibold" style={{ color: '#111827' }}>Collecte de Preuves — Fenêtre 48h</h2>
              </div>
              <p className="text-sm font-inter leading-relaxed mb-4" style={{ color: '#6B7280' }}>
                Pour ouvrir un litige, le client doit soumettre une vidéo de déballage continue dans les 48 heures suivant la livraison, via l'app ou l'option un paiement. Les preuves soumises en dehors de l'application (ex. WhatsApp) ne sont pas recevables.
              </p>
              <div className="space-y-3">
                {[
                  { n: 1, label: 'Réception du colis', desc: 'Vous recevez votre commande et avez 48h pour agir' },
                  { n: 2, label: 'Vidéo de déballage continue', desc: 'Filmer l\'ouverture du colis, sans coupure, du début à la fin' },
                  { n: 3, label: 'Soumission via l\'app uniquement', desc: 'Télécharger la vidéo directement dans l\'application TrustLink. Les preuves WhatsApp ne sont pas acceptées.' },
                  { n: 4, label: 'Ouverture du litige', desc: 'Notre équipe examine votre cas sous 48-72h ouvrables' },
                ].map((step) => (
                  <div key={step.n} className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: '#F8FAFC' }}>
                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: '#125C8D' }}>{step.n}</span>
                    <div>
                      <p className="text-sm font-poppins font-semibold mb-0.5" style={{ color: '#111827' }}>{step.label}</p>
                      <p className="text-xs font-inter" style={{ color: '#9CA3AF' }}>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Matrice de résolution */}
            <div className="bg-white rounded-xl p-6" style={{ border: '1px solid #E5E7EB' }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#EBF4FB' }}>
                  <i className="ri-git-branch-line text-sm" style={{ color: '#125C8D' }}></i>
                </div>
                <h2 className="text-base font-poppins font-semibold" style={{ color: '#111827' }}>Matrice de Résolution des Litiges</h2>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <i className="ri-error-warning-line text-sm" style={{ color: '#FF6A00' }}></i>
                <p className="text-xs font-inter" style={{ color: '#9CA3AF' }}>Attention : Toute sur-réclamation au Registre TrustLink (WhatsApp, email, SMS) sera automatiquement répertoriée et ce compte pas être utilisée pour ce litige.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: 'ri-shield-flash-line', case: 'Accident / Perte', badge: 'Assurance', badgeColor: '#16A34A', badgeBg: '#DCFCE7', result: 'Remboursement 100%', desc: 'Prix + frais de livraison en assurance' },
                  { icon: 'ri-close-circle-line', case: 'Non-Conformité', badge: 'Grave', badgeColor: '#DC2626', badgeBg: '#FEE2E2', result: 'Remboursement 100%', desc: 'Prix + frais de livraison ou échange · Frais inca.' },
                  { icon: 'ri-hammer-line', case: 'Dommage Mineur', badge: 'Négociation', badgeColor: '#D97706', badgeBg: '#FEF3C7', result: 'Crédit partiel', desc: 'Pas de retrait réel — le client conserve le produit' },
                  { icon: 'ri-user-star-line', case: 'Changement d\'Avis', badge: 'Forfait', badgeColor: '#6B7280', badgeBg: '#F1F5F9', result: 'Non remboursé', desc: 'Frais d\'état de rééchange — retour à la charge du client pour 15€' },
                ].map((item) => (
                  <div key={item.case} className="p-4 rounded-xl" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E5E7EB' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <i className={`${item.icon} text-sm`} style={{ color: '#125C8D' }}></i>
                      <span className="text-sm font-poppins font-semibold" style={{ color: '#111827' }}>{item.case}</span>
                    </div>
                    <span className="text-xs font-poppins font-bold rounded-full px-2 py-0.5 mb-2 inline-block" style={{ backgroundColor: item.badgeBg, color: item.badgeColor }}>{item.badge}</span>
                    <p className="text-xs font-poppins font-bold mb-1" style={{ color: '#125C8D' }}>{item.result}</p>
                    <p className="text-xs font-inter" style={{ color: '#9CA3AF' }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Traitement remboursements */}
            <div className="bg-white rounded-xl p-6" style={{ border: '1px solid #E5E7EB' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#EBF4FB' }}>
                  <i className="ri-refund-2-line text-sm" style={{ color: '#125C8D' }}></i>
                </div>
                <h2 className="text-base font-poppins font-semibold" style={{ color: '#111827' }}>Traitement des Remboursements</h2>
              </div>
              <p className="text-sm font-inter leading-relaxed mb-5" style={{ color: '#6B7280' }}>
                Les preuves sont examinées dans un délai de 48 à 72 heures ouvrées. Le remboursement est émis directement sur le compte Mobile Money du profil de l'utilisateur.
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: 'ri-time-line', label: '48 – 72h ouvrées', desc: 'Délai d\'examen des preuves soumises' },
                  { icon: 'ri-smartphone-line', label: 'Mobile Money', desc: 'Remboursement sur MTN MoMo, Moov ou Wave' },
                  { icon: 'ri-user-line', label: 'Compte lié', desc: 'Versé sur la compte Mobile Money au profil utilisateur' },
                ].map((item) => (
                  <div key={item.label} className="text-center p-3 rounded-xl" style={{ backgroundColor: '#F8FAFC' }}>
                    <i className={`${item.icon} text-xl mb-2 block`} style={{ color: '#125C8D' }}></i>
                    <p className="text-xs font-poppins font-semibold mb-1" style={{ color: '#111827' }}>{item.label}</p>
                    <p className="text-xs font-inter" style={{ color: '#9CA3AF' }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Exclusions */}
            <div className="bg-white rounded-xl p-6" style={{ border: '1px solid #E5E7EB' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FFF1F2' }}>
                  <i className="ri-close-circle-line text-sm text-red-500"></i>
                </div>
                <h2 className="text-base font-poppins font-semibold" style={{ color: '#111827' }}>Exclusions</h2>
              </div>
              <p className="text-sm font-inter leading-relaxed mb-4" style={{ color: '#6B7280' }}>
                Les remboursements sont refusés dans les cas suivants. Les retours sont consolidés au hub TrustLink Cotonou puis réexpédiés au Nigéria.
              </p>
              <div className="space-y-2 mb-5">
                {[
                  { n: 1, label: 'Vidéo de déballage manquante ou incomplète', color: '#FEF3C7', border: '#FCD34D', text: '#92400E' },
                  { n: 2, label: 'Plainte de 48h dépassée après la livraison', color: '#FFF1F2', border: '#FECDD3', text: '#991B1B' },
                  { n: 3, label: 'Dommage causé par une mauvaise utilisation du client', color: '#FFF1F2', border: '#FECDD3', text: '#991B1B' },
                  { n: 4, label: 'Preuves soumises en dehors de l\'application (WhatsApp, email, SMS)', color: '#FFF1F2', border: '#FECDD3', text: '#991B1B' },
                ].map((item) => (
                  <div key={item.n} className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: item.color, border: `1px solid ${item.border}` }}>
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: item.text }}>{item.n}</span>
                    <p className="text-sm font-inter" style={{ color: item.text }}>{item.label}</p>
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#EBF4FB', border: '1px solid #BFDBFE' }}>
                <p className="text-xs font-inter" style={{ color: '#1E40AF' }}>
                  <i className="ri-information-line mr-1"></i>
                  <strong>Hub TrustLink Cotonou</strong> : Tous les retours sont d'abord consolidés dans notre entrepôt à Cotonou avant d'être réexpédiés groupés vers le Nigéria, réduisant ainsi les coûts logistiques pour toutes les parties.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="rounded-xl p-8 text-center" style={{ backgroundColor: '#0E3A4F' }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <i className="ri-customer-service-2-line text-xl text-white"></i>
              </div>
              <h3 className="text-lg font-poppins font-semibold text-white mb-2">Une question sur cette politique ?</h3>
              <p className="text-sm font-inter text-white/70 mb-5">Notre équipe support est disponible 7j/7. Utilisez le chat ou liez à droite de l'écran.</p>
              <Link to="/support"
                className="inline-flex items-center gap-2 px-6 py-2.5 text-white font-poppins font-semibold rounded-lg transition-opacity hover:opacity-90 text-sm"
                style={{ backgroundColor: '#FF6A00' }}>
                <i className="ri-chat-3-line"></i>
                Utiliser le chat ou liez à droite de l'écran
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
