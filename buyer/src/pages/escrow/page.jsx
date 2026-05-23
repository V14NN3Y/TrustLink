import { Link } from 'react-router-dom';

const STEPS = [
  {
    num: '01',
    icon: 'ri-shopping-cart-line',
    title: 'Tu passes commande',
    desc: 'Tu règles le montant total (produit + livraison). L\'argent ne va PAS chez le vendeur — il est bloqué en sécurité chez TrustLink.',
    color: '#125C8D',
    bg: '#E1F0F9',
  },
  {
    num: '02',
    icon: 'ri-store-2-line',
    title: 'Le vendeur est notifié',
    desc: 'Le vendeur reçoit une confirmation de paiement sécurisé. Il prépare et expédie ta commande, motivé par la garantie de paiement.',
    color: '#7C3AED',
    bg: '#F5F3FF',
  },
  {
    num: '03',
    icon: 'ri-truck-line',
    title: 'Hub TrustLink reçoit',
    desc: 'Ta commande transite par notre hub de vérification au Bénin. Chaque colis est contrôlé avant la dernière étape de livraison.',
    color: '#D97706',
    bg: '#FEF3C7',
  },
  {
    num: '04',
    icon: 'ri-video-line',
    title: 'Tu enregistres le déballage',
    desc: 'À réception, tu filmes l\'ouverture du colis. Cette vidéo te protège en cas de problème et sert de preuve officielle.',
    color: '#FF6A00',
    bg: '#FFF3EC',
  },
  {
    num: '05',
    icon: 'ri-check-double-line',
    title: 'Tu confirmes ou tu contestes',
    desc: 'Tout va bien ? Tu confirmes la réception et le vendeur est payé. Problème ? Tu ouvres un litige avec ta vidéo comme preuve.',
    color: '#15803D',
    bg: '#DCFCE7',
  },
];

const PROTECTIONS = [
  {
    icon: 'ri-shield-check-line',
    title: 'Paiement 100% sécurisé',
    desc: 'Ton argent est protégé jusqu\'à ce que tu confirmes la bonne réception de ta commande. Le vendeur ne touche rien avant.',
  },
  {
    icon: 'ri-video-line',
    title: 'Vidéo de déballage',
    desc: 'L\'enregistrement de l\'ouverture du colis est ta meilleure protection. Elle prouve l\'état du produit à la réception.',
  },
  {
    icon: 'ri-time-line',
    title: 'Délai de confirmation de 60h',
    desc: 'Tu as 60 heures après la livraison pour confirmer ou contester. Passé ce délai, le paiement est libéré automatiquement.',
  },
  {
    icon: 'ri-customer-service-2-line',
    title: 'Médiation TrustLink',
    desc: 'En cas de litige, notre équipe examine les preuves (vidéo, photos, messages) et rend une décision équitable sous 72h.',
  },
  {
    icon: 'ri-refund-2-line',
    title: 'Remboursement garanti',
    desc: 'Si le litige est validé en ta faveur, tu es remboursé intégralement. L\'argent n\'ayant jamais quitté l\'escrow, le retour est immédiat.',
  },
  {
    icon: 'ri-bank-line',
    title: 'Fonds séparés',
    desc: 'Les fonds escrow sont conservés sur un compte dédié, séparé des comptes opérationnels de TrustLink. Ils ne peuvent pas être utilisés autrement.',
  },
];

const FAQS = [
  {
    q: 'Que se passe-t-il si le vendeur n\'expédie pas ?',
    a: 'Si le vendeur ne fournit pas de numéro de suivi dans les délais prévus, tu peux ouvrir un litige. TrustLink annule la commande et te rembourse intégralement.',
  },
  {
    q: 'Et si mon colis est endommagé à l\'arrivée ?',
    a: 'Filme l\'ouverture du colis AVANT de toucher au contenu. Cette vidéo est obligatoire pour ouvrir un litige pour dommage. Sans vidéo, le litige ne peut pas être traité.',
  },
  {
    q: 'Dans quel délai suis-je remboursé ?',
    a: 'Dès que TrustLink valide ton litige, le remboursement est traité sous 24-48h vers ton moyen de paiement initial.',
  },
  {
    q: 'Le vendeur peut-il refuser l\'escrow ?',
    a: 'Non. Tous les vendeurs TrustLink acceptent obligatoirement le système Escrow comme condition de vente sur la plateforme. C\'est non négociable.',
  },
  {
    q: 'Que couvre la commission TrustLink ?',
    a: 'La commission (affichée au checkout) couvre la gestion Escrow, la vérification au hub, la médiation des litiges et le support client.',
  },
];

export default function EscrowPage() {
  return (
    <div className="pt-20 min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>

      {/* Hero */}
      <div style={{ backgroundColor: '#0E3A4F' }} className="text-white py-14">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-poppins font-semibold mb-4"
            style={{ backgroundColor: 'rgba(255,106,0,0.2)', color: '#FF6A00' }}>
            <i className="ri-shield-star-line"></i>
            Protection acheteur
          </div>
          <h1 className="text-3xl md:text-4xl font-poppins font-bold mb-4">
            Ton argent, en sécurité.<br />
            <span style={{ color: '#FF6A00' }}>Toujours.</span>
          </h1>
          <p className="text-base font-inter text-white/75 max-w-xl mx-auto mb-8">
            Le système Escrow TrustLink garantit que tu ne paies que pour ce que tu reçois vraiment — conforme, intact, et dans les délais.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/"
              className="px-6 py-3 rounded-full font-poppins font-semibold text-sm text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#FF6A00' }}>
              Découvrir les produits
            </Link>
            <Link to="/support"
              className="px-6 py-3 rounded-full font-poppins font-semibold text-sm border border-white/30 text-white hover:bg-white/10 transition-colors">
              Contacter le support
            </Link>
          </div>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { val: '100%', label: 'Paiements sécurisés', icon: 'ri-shield-check-line' },
              { val: '60h', label: 'Pour confirmer ou contester', icon: 'ri-time-line' },
              { val: '72h', label: 'Résolution des litiges', icon: 'ri-customer-service-2-line' },
              { val: '0€', label: 'Frais de remboursement', icon: 'ri-refund-2-line' },
            ].map(({ val, label, icon }) => (
              <div key={val} className="py-4">
                <i className={`${icon} text-2xl mb-2 block`} style={{ color: '#125C8D' }}></i>
                <p className="text-2xl font-poppins font-bold" style={{ color: '#111827' }}>{val}</p>
                <p className="text-xs font-inter mt-1" style={{ color: '#6B7280' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-12">

        {/* Comment ça marche */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-poppins font-bold mb-2" style={{ color: '#111827' }}>
              Comment fonctionne l'Escrow ?
            </h2>
            <p className="text-sm font-inter" style={{ color: '#6B7280' }}>
              5 étapes claires pour une transaction 100% sécurisée
            </p>
          </div>

          <div className="relative">
            {/* Ligne connecteur desktop */}
            <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-0.5" style={{ backgroundColor: '#E5E7EB' }} />

            <div className="grid md:grid-cols-5 gap-6">
              {STEPS.map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center relative">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 relative z-10"
                    style={{ backgroundColor: step.bg }}>
                    <i className={`${step.icon} text-2xl`} style={{ color: step.color }}></i>
                  </div>
                  <span className="text-xs font-poppins font-bold mb-1" style={{ color: '#9CA3AF' }}>
                    Étape {step.num}
                  </span>
                  <h3 className="text-sm font-poppins font-bold mb-2" style={{ color: '#111827' }}>
                    {step.title}
                  </h3>
                  <p className="text-xs font-inter leading-relaxed" style={{ color: '#6B7280' }}>
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tes protections */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-poppins font-bold mb-2" style={{ color: '#111827' }}>
              Ce que l'Escrow te garantit
            </h2>
            <p className="text-sm font-inter" style={{ color: '#6B7280' }}>
              Chaque protection est active sur toutes tes commandes, sans exception
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PROTECTIONS.map((p, i) => (
              <div key={i} className="bg-white rounded-xl p-5" style={{ border: '1px solid #F0F0F0' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: '#E1F0F9' }}>
                  <i className={`${p.icon} text-lg`} style={{ color: '#125C8D' }}></i>
                </div>
                <h3 className="text-sm font-poppins font-bold mb-1.5" style={{ color: '#111827' }}>
                  {p.title}
                </h3>
                <p className="text-xs font-inter leading-relaxed" style={{ color: '#6B7280' }}>
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Schéma flux argent */}
        <div className="bg-white rounded-2xl p-6 md:p-8 mb-16" style={{ border: '1px solid #F0F0F0' }}>
          <h2 className="text-xl font-poppins font-bold mb-2 text-center" style={{ color: '#111827' }}>
            Où va ton argent ?
          </h2>
          <p className="text-sm font-inter text-center mb-8" style={{ color: '#6B7280' }}>
            Voici le chemin exact de chaque centime que tu dépenses
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-0">
            {[
              { label: 'Toi', sub: 'Tu paies', icon: 'ri-user-line', color: '#125C8D', bg: '#E1F0F9' },
              null,
              { label: 'Escrow TrustLink', sub: 'Fonds bloqués', icon: 'ri-bank-line', color: '#7C3AED', bg: '#F5F3FF', big: true },
              null,
              { label: 'Vendeur', sub: 'Reçoit après confirmation', icon: 'ri-store-2-line', color: '#15803D', bg: '#DCFCE7' },
            ].map((item, i) => {
              if (item === null) {
                return (
                  <div key={i} className="flex md:flex-col items-center gap-1 px-2">
                    <i className="ri-arrow-right-s-line text-2xl md:rotate-0 rotate-90" style={{ color: '#D1D5DB' }}></i>
                  </div>
                );
              }
              return (
                <div key={i} className={`flex flex-col items-center text-center ${item.big ? 'md:scale-110' : ''}`}>
                  <div className={`${item.big ? 'w-20 h-20' : 'w-16 h-16'} rounded-2xl flex items-center justify-center mb-2`}
                    style={{ backgroundColor: item.bg }}>
                    <i className={`${item.icon} ${item.big ? 'text-3xl' : 'text-2xl'}`} style={{ color: item.color }}></i>
                  </div>
                  <p className="text-sm font-poppins font-bold" style={{ color: '#111827' }}>{item.label}</p>
                  <p className="text-xs font-inter mt-0.5" style={{ color: '#9CA3AF' }}>{item.sub}</p>
                </div>
              );
            })}
          </div>

          <p className="text-center text-xs font-inter mt-6 px-4 py-3 rounded-lg"
            style={{ backgroundColor: '#F0FFF4', color: '#15803D' }}>
            <i className="ri-information-line mr-1"></i>
            Si un litige est validé en ta faveur, l'argent te revient directement depuis l'Escrow — le vendeur ne l'ayant jamais touché.
          </p>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-poppins font-bold mb-2" style={{ color: '#111827' }}>
              Questions fréquentes
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <details key={i}
                className="bg-white rounded-xl overflow-hidden group"
                style={{ border: '1px solid #F0F0F0' }}>
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none">
                  <span className="text-sm font-poppins font-semibold pr-4" style={{ color: '#111827' }}>
                    {faq.q}
                  </span>
                  <i className="ri-add-line text-lg flex-shrink-0 group-open:hidden" style={{ color: '#125C8D' }}></i>
                  <i className="ri-subtract-line text-lg flex-shrink-0 hidden group-open:block" style={{ color: '#125C8D' }}></i>
                </summary>
                <div className="px-5 pb-4">
                  <p className="text-sm font-inter leading-relaxed" style={{ color: '#6B7280' }}>{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* CTA final */}
        <div className="rounded-2xl p-8 text-center text-white" style={{ backgroundColor: '#0E3A4F' }}>
          <i className="ri-shield-star-fill text-4xl mb-4 block" style={{ color: '#FF6A00' }}></i>
          <h2 className="text-xl font-poppins font-bold mb-2">Tu as encore des doutes ?</h2>
          <p className="text-sm font-inter text-white/70 mb-6 max-w-md mx-auto">
            Notre équipe est disponible 7j/7 pour répondre à toutes tes questions sur la sécurité de tes achats.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/support"
              className="px-6 py-2.5 rounded-full font-poppins font-semibold text-sm text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#FF6A00' }}>
              Contacter le support
            </Link>
            <Link to="/legal?tab=cgu"
              className="px-6 py-2.5 rounded-full font-poppins font-semibold text-sm border border-white/30 text-white hover:bg-white/10 transition-colors">
              Lire les CGU complètes
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
