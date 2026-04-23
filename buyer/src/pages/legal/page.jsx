import { useSearchParams, useNavigate, Link } from 'react-router-dom';

const TABS = [
  { id: 'mentions', label: 'Mentions légales', icon: 'ri-file-text-line' },
  { id: 'confidentialite', label: 'Confidentialité', icon: 'ri-shield-user-line' },
  { id: 'cgu', label: 'Conditions d\'utilisation', icon: 'ri-file-list-3-line' },
];

const TOC = {
  mentions: ['Éditeur du site', 'Hébergement', 'Propriété intellectuelle', 'Responsabilité', 'Droit applicable'],
  confidentialite: ['Données collectées', 'Utilisation des données', 'Vos droits', 'Conservation des données', 'Une question légale ?'],
  cgu: ['Objet et acceptation', 'Inscription et compte utilisateur', 'Système Escrow et paiements', 'Obligations de l\'acheteur', 'Litiges et résolution', 'Modification des CGU'],
};

export default function Legal() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const active = searchParams.get('tab') || 'mentions';

  return (
    <div className="pt-20 min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      {/* Hero */}
      <div style={{ backgroundColor: '#0E3A4F' }} className="text-white py-10">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6">
          <div className="flex items-center gap-2 text-xs font-inter mb-3 text-white/60">
            <Link to="/" className="hover:text-white">Boutique</Link>
            <span>/</span>
            <span className="text-white">Documents légaux</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-poppins font-bold mb-1">Documents légaux</h1>
          <p className="text-sm font-inter text-white/70">Transparence et conformité — tout ce que vous devez savoir sur TrustLink.</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="bg-white border-b border-gray-100 sticky z-30" style={{ top: '80px' }}>
        <div className="max-w-[1100px] mx-auto px-4 md:px-6">
          <div className="flex gap-1 py-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => navigate(`/legal?tab=${t.id}`)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-poppins font-medium transition-all"
                style={active === t.id
                  ? { backgroundColor: '#0E3A4F', color: '#fff' }
                  : { color: '#6B7280', backgroundColor: 'transparent' }}
              >
                <i className={`${t.icon} text-sm`}></i>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* TOC sidebar */}
          <aside className="md:w-56 flex-shrink-0">
            <p className="text-xs font-poppins font-semibold uppercase tracking-wider mb-3" style={{ color: '#9CA3AF' }}>Sommaire</p>
            <div className="space-y-1">
              {(TOC[active] || []).map((section) => (
                <button key={section} className="w-full text-left px-3 py-2 rounded-lg text-xs font-inter transition-colors hover:bg-gray-100" style={{ color: '#374151' }}>
                  {section}
                </button>
              ))}
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1 bg-white rounded-xl p-6" style={{ border: '1px solid #E5E7EB' }}>
            {active === 'mentions' && <MentionsContent />}
            {active === 'confidentialite' && <ConfidentialiteContent />}
            {active === 'cgu' && <CGUContent />}
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h2 className="text-base font-poppins font-bold mb-3 pb-2 border-b border-gray-100" style={{ color: '#111827' }}>{title}</h2>
      <div className="text-sm font-inter leading-relaxed" style={{ color: '#6B7280' }}>{children}</div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex gap-3 py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm font-inter w-24 flex-shrink-0" style={{ color: '#9CA3AF' }}>{label}</span>
      <span className="text-sm font-inter" style={{ color: '#374151' }}>{value}</span>
    </div>
  );
}

function MentionsContent() {
  return (
    <>
      <Section title="Éditeur du site">
        <div className="rounded-xl overflow-hidden mb-4" style={{ border: '1px solid #E5E7EB' }}>
          {[
            ['Société', 'TrustLink SAS'],
            ['Siège social', 'Quartier Cadjehoun, Cotonou, République du Bénin'],
            ['Capital social', '50 000 000 FCFA'],
            ['RCM', 'RC/COT/26/A/01234'],
            ['Email', 'legal@trustlink.bj'],
            ['Téléphone', '+229 97 00 00 00'],
          ].map(([l, v]) => <InfoRow key={l} label={l} value={v} />)}
        </div>
      </Section>
      <Section title="Hébergement">
        Le site TrustLink est hébergé par Base44 Cloud Services, entité internationale spécialisée dans les services cloud pour les startups africaines, garantissant la sécurité et la disponibilité de vos données.
      </Section>
      <Section title="Propriété intellectuelle">
        L'ensemble des contenus présents sur TrustLink (textes, images, logos, icônes) sont la propriété exclusive de TrustLink SAS ou de ses partenaires. Toute reproduction, même partielle, est strictement interdite sans autorisation écrite préalable.
      </Section>
      <Section title="Responsabilité">
        TrustLink agit en tant qu'intermédiaire de confiance. La plateforme ne peut être tenue responsable des résultats de faits d'usage, des événements de force majeure, des circonstances indépendantes de sa volonté.
      </Section>
      <Section title="Droit applicable">
        Les présentes mentions légales sont soumises au droit béninois. Tout litige relatif à l'utilisation du site sera soumis à la compétence exclusive des tribunaux de Cotonou, Bénin.
      </Section>
      <div className="mt-6 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3" style={{ backgroundColor: '#EBF4FB' }}>
        <div className="flex items-center gap-2">
          <i className="ri-question-line" style={{ color: '#125C8D' }}></i>
          <p className="text-sm font-poppins font-medium" style={{ color: '#0E3A4F' }}>Une question légale ?</p>
          <p className="text-xs font-inter" style={{ color: '#6B7280' }}>Notre équipe juridique répond sous 48h.</p>
        </div>
        <a href="mailto:legal@trustlink.bj" className="flex items-center gap-2 px-4 py-2 text-white text-xs font-poppins font-semibold rounded-lg flex-shrink-0" style={{ backgroundColor: '#125C8D' }}>
          <i className="ri-mail-line"></i> legal@trustlink.bj
        </a>
      </div>
    </>
  );
}

function ConfidentialiteContent() {
  const dataTypes = [
    { icon: 'ri-user-3-line', label: 'Identité', desc: 'Nom, prénom, email, téléphone' },
    { icon: 'ri-map-pin-line', label: 'Adresse', desc: 'Adresse de livraison' },
    { icon: 'ri-bank-card-line', label: 'Paiement', desc: 'Via MTN, Moov, Wave' },
    { icon: 'ri-shopping-bag-line', label: 'Commandes', desc: 'Historique des achats' },
    { icon: 'ri-video-line', label: 'Vidéos', desc: 'Vidéos de déballage pour litige' },
    { icon: 'ri-settings-3-line', label: 'Technique', desc: 'Logs, données de navigation' },
  ];
  return (
    <>
      <Section title="Données collectées">
        <p className="mb-4">TrustLink collecte uniquement les données nécessaires au bon fonctionnement de la plateforme.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {dataTypes.map((d) => (
            <div key={d.label} className="flex items-start gap-2.5 p-3 rounded-lg" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E5E7EB' }}>
              <i className={`${d.icon} text-sm mt-0.5`} style={{ color: '#125C8D' }}></i>
              <div>
                <p className="text-xs font-poppins font-semibold" style={{ color: '#111827' }}>{d.label}</p>
                <p className="text-xs font-inter" style={{ color: '#9CA3AF' }}>{d.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>
      <Section title="Utilisation des données">
        <ul className="space-y-2">
          {['Traitement et suivi de vos commandes', 'Gestion des paiements Escrow et remboursements', 'Résolution des litiges et réclamations', 'Amélioration des services et de l\'expérience utilisateur', 'Communication sur l\'état de vos commandes', 'Prévention de la fraude et sécurité de la plateforme'].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#125C8D' }}></span>
              {item}
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Vos droits">
        <p className="mb-3">Conformément à la réglementation applicable, vous disposez des droits suivants sur vos données personnelles :</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {['Accès', 'Rectification', 'Suppression', 'Portabilité', 'Opposition', 'Limitation'].map((r) => (
            <div key={r} className="text-center py-2 px-3 rounded-lg text-xs font-poppins font-medium" style={{ backgroundColor: '#F1F5F9', color: '#374151' }}>{r}</div>
          ))}
        </div>
        <p>Pour exercer ces droits, contactez-nous à <a href="mailto:privacy@trustlink.bj" className="font-medium" style={{ color: '#125C8D' }}>privacy@trustlink.bj</a>.</p>
      </Section>
      <Section title="Conservation des données">
        Vos données sont conservées pendant la durée de votre relation commerciale avec TrustLink, puis archivées pendant 5 ans conformément aux obligations légales. Les vidéos de déballage sont supprimées 90 jours après la clôture du litige.
      </Section>
      <div className="mt-6 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3" style={{ backgroundColor: '#EBF4FB' }}>
        <p className="text-sm font-poppins font-medium" style={{ color: '#0E3A4F' }}>Une question légale ?</p>
        <a href="mailto:privacy@trustlink.bj" className="flex items-center gap-2 px-4 py-2 text-white text-xs font-poppins font-semibold rounded-lg flex-shrink-0" style={{ backgroundColor: '#125C8D' }}>
          <i className="ri-mail-line"></i> privacy@trustlink.bj
        </a>
      </div>
    </>
  );
}

function CGUContent() {
  const escrowPoints = [
    'Tout paiement est sécurisé dans un compte tiers géré par TrustLink.',
    'Les fonds sont libérés au vendeur uniquement après confirmation de réception par l\'acheteur, ou après 60h sans litige ouvert.',
    'En cas de remboursement, la reconversion en FCFA se fait au taux de change en vigueur au moment du remboursement.',
    'TrustLink se réserve le droit de bloquer un paiement en cas de suspicion de fraude.',
  ];
  return (
    <>
      <p className="text-xs font-inter mb-1" style={{ color: '#9CA3AF' }}>Dernière mise à jour : Avril 2026 · Version 2.1</p>
      <div className="mb-6 mt-4">
        <h2 className="text-base font-poppins font-bold mb-3 pb-2 border-b border-gray-100" style={{ color: '#111827' }}>1. Objet et acceptation</h2>
        <p className="text-sm font-inter leading-relaxed" style={{ color: '#6B7280' }}>Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme TrustLink. En utilisant nos services, vous acceptez sans réserve ces CGU. TrustLink se réserve le droit de les modifier avec notification préalable par email.</p>
      </div>
      <div className="mb-6">
        <h2 className="text-base font-poppins font-bold mb-3 pb-2 border-b border-gray-100" style={{ color: '#111827' }}>2. Inscription et compte utilisateur</h2>
        <p className="text-sm font-inter leading-relaxed" style={{ color: '#6B7280' }}>L'inscription est gratuite et réservée aux personnes physiques majeures résidant au Bénin. Vous êtes responsable de la confidentialité de vos identifiants. Tout compte frauduleux peut être immédiatement suspendu.</p>
      </div>
      <div className="mb-6">
        <h2 className="text-base font-poppins font-bold mb-3 pb-2 border-b border-gray-100" style={{ color: '#111827' }}>3. Système Escrow et paiements</h2>
        <div className="space-y-2">
          {escrowPoints.map((p, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-lg" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E5E7EB' }}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5" style={{ backgroundColor: '#125C8D' }}>{i + 1}</span>
              <p className="text-sm font-inter" style={{ color: '#374151' }}>{p}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mb-6">
        <h2 className="text-base font-poppins font-bold mb-3 pb-2 border-b border-gray-100" style={{ color: '#111827' }}>4. Obligations de l'acheteur</h2>
        <ul className="space-y-2">
          {['Fournir des informations exactes lors de l\'inscription et du checkout', 'Confirmer la réception des commandes dans les délais impartis', 'Enregistrer la vidéo de déballage avant d\'ouvrir un litige', 'Ne pas tenter de contourner le système Escrow', 'Signaler tout problème via les canaux officiels TrustLink uniquement'].map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm font-inter" style={{ color: '#6B7280' }}>
              <i className="ri-checkbox-circle-line text-sm mt-0.5 flex-shrink-0" style={{ color: '#125C8D' }}></i>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="mb-6">
        <h2 className="text-base font-poppins font-bold mb-3 pb-2 border-b border-gray-100" style={{ color: '#111827' }}>5. Litiges et résolution</h2>
        <p className="text-sm font-inter leading-relaxed mb-2" style={{ color: '#6B7280' }}>En cas de litige, TrustLink agit en tant qu'arbitre impartial. La décision de TrustLink est définitive et s'impose aux deux parties. Pour plus de détails, consultez notre <Link to="/policy/returns" className="font-medium" style={{ color: '#125C8D' }}>Politique de remboursement</Link>.</p>
      </div>
      <div className="mb-4">
        <h2 className="text-base font-poppins font-bold mb-3 pb-2 border-b border-gray-100" style={{ color: '#111827' }}>6. Modification des CGU</h2>
        <p className="text-sm font-inter leading-relaxed" style={{ color: '#6B7280' }}>TrustLink se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés par email de toute modification substantielle. La poursuite de l'utilisation de la plateforme après notification vaut acceptation des nouvelles CGU.</p>
      </div>
      <div className="p-3 rounded-lg flex items-center gap-2 text-xs font-inter" style={{ backgroundColor: '#F1F5F9', color: '#6B7280' }}>
        <i className="ri-calendar-check-line" style={{ color: '#9CA3AF' }}></i>
        Dernière mise à jour : Avril 2026 · Version 2.1
      </div>
    </>
  );
}
