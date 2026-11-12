import { useRef, useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useI18n } from '@/lib/I18nContext';

const makeTabs = (t) => [
  { id: 'mentions', label: t('legal.tabMentions'), icon: 'ri-file-text-line' },
  { id: 'confidentialite', label: t('legal.tabPrivacy'), icon: 'ri-shield-user-line' },
  { id: 'cgu', label: t('legal.tabCgu'), icon: 'ri-file-list-3-line' },
];

const makeTOC = (t) => ({
  mentions: [
    { id: 'editeur', label: t('legal.editorTitle') },
    { id: 'hebergement', label: t('legal.hostingTitle') },
    { id: 'propriete', label: t('legal.propertyTitle') },
    { id: 'responsabilite', label: t('legal.liabilityTitle') },
    { id: 'droit', label: t('legal.lawTitle') },
  ],
  confidentialite: [
    { id: 'donnees', label: t('legal.dataTitle') },
    { id: 'utilisation', label: t('legal.dataUseTitle') },
    { id: 'droits', label: t('legal.rightsTitle') },
    { id: 'conservation', label: t('legal.retentionTitle') },
  ],
  cgu: [
    { id: 'objet', label: t('legal.cguObjectTitle') },
    { id: 'inscription', label: t('legal.cguRegistrationTitle') },
    { id: 'escrow', label: t('legal.cguEscrowTitle') },
    { id: 'obligations', label: t('legal.cguObligationsTitle') },
    { id: 'litiges', label: t('legal.cguDisputesTitle') },
    { id: 'modification', label: t('legal.cguModificationTitle') },
  ],
});

function useSectionScroll(sections) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id || '');
  const sectionRefs = useRef({});

  const scrollToSection = (id) => {
    setActiveSection(id);
    const el = sectionRefs.current[id];
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 130;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    setActiveSection(sections[0]?.id || '');
  }, [sections.map(s => s.id).join(',')]);

  useEffect(() => {
    const handleScroll = () => {
      let current = sections[0]?.id || '';
      for (const { id } of sections) {
        const el = sectionRefs.current[id];
        if (el && el.getBoundingClientRect().top - 140 <= 0) {
          current = id;
        }
      }
      setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const setRef = (id) => (el) => { sectionRefs.current[id] = el; };

  return { activeSection, scrollToSection, setRef };
}

export default function Legal() {
  const { t } = useI18n();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const active = searchParams.get('tab') || 'mentions';
  const effectiveTab = active === 'escrow' ? 'cgu' : active;
  const TABS = makeTabs(t);
  const TOC = makeTOC(t);
  const sections = TOC[effectiveTab] || [];
  const { activeSection, scrollToSection, setRef } = useSectionScroll(sections);

  useEffect(() => {
    if (active === 'escrow') {
      navigate('/legal?tab=cgu', { replace: true });
    }
  }, [active, navigate]);

  if (active === 'escrow') return null;

  return (
    <div className="pt-28 md:pt-20 min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      {/* Hero */}
      <div style={{ backgroundColor: '#0E3A4F' }} className="text-white py-10">
        <div className="max-w-[1100px] mx-auto px-4 md:px-6">
          <div className="flex items-center gap-2 text-xs font-inter mb-3 text-white/60">
            <Link to="/" className="hover:text-white">{t('footer.shop')}</Link>
            <span>/</span>
            <span className="text-white">{t('legal.breadcrumb')}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-poppins font-bold mb-1">{t('legal.pageTitle')}</h1>
          <p className="text-sm font-inter text-white/70">{t('legal.pageDesc')}</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="bg-white border-b border-gray-100 sticky z-30" style={{ top: '80px' }}>
        <div className="max-w-[1100px] mx-auto px-4 md:px-6">
          <div className="flex gap-1 py-2">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => navigate(`/legal?tab=${t.id}`)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-poppins font-medium transition-all"
                style={active === t.id ? { backgroundColor: '#0E3A4F', color: '#fff' } : { color: '#6B7280' }}>
                <i className={`${t.icon} text-sm`}></i>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* TOC sidebar — sticky */}
          <aside className="md:w-56 flex-shrink-0 sticky" style={{ top: '136px' }}>
            <p className="text-xs font-poppins font-semibold uppercase tracking-wider mb-3" style={{ color: '#9CA3AF' }}>{t('legal.tocTitle')}</p>
            <div className="space-y-0.5">
              {sections.map((s) => (
                <button key={s.id} onClick={() => scrollToSection(s.id)}
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
          <div className="flex-1 bg-white rounded-xl p-6" style={{ border: '1px solid #E5E7EB' }}>
            {active === 'mentions' && <MentionsContent t={t} setRef={setRef} />}
            {active === 'confidentialite' && <ConfidentialiteContent t={t} setRef={setRef} />}
            {active === 'cgu' && <CGUContent t={t} setRef={setRef} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionBlock({ id, title, setRef, children }) {
  return (
    <div ref={setRef(id)} className="mb-6">
      <h2 className="text-base font-poppins font-bold mb-3 pb-2 border-b border-gray-100" style={{ color: '#111827' }}>{title}</h2>
      <div className="text-sm font-inter leading-relaxed" style={{ color: '#6B7280' }}>{children}</div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex gap-3 py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm font-inter w-28 flex-shrink-0" style={{ color: '#9CA3AF' }}>{label}</span>
      <span className="text-sm font-inter" style={{ color: '#374151' }}>{value}</span>
    </div>
  );
}

function MentionsContent({ t, setRef }) {
  return (
    <>
      <SectionBlock id="editeur" title={t('legal.editorTitle')} setRef={setRef}>
        <div className="rounded-xl overflow-hidden mb-4" style={{ border: '1px solid #E5E7EB' }}>
          {[['Société', 'TrustLink SAS'], ['Siège social', 'Quartier Cadjehoun, Cotonou, République du Bénin'], ['Capital social', '50 000 000 FCFA'], ['RCM', 'RC/COT/26/A/01234'], ['Email', 'legal@trustlink.bj'], ['Téléphone', '+229 97 00 00 00']].map(([l, v]) => <InfoRow key={l} label={l} value={v} />)}
        </div>
      </SectionBlock>
      <SectionBlock id="hebergement" title={t('legal.hostingTitle')} setRef={setRef}>
        Le site TrustLink est hébergé par Base44 Cloud Services, entité internationale spécialisée dans les services cloud pour les startups africaines, garantissant la sécurité et la disponibilité de vos données.
      </SectionBlock>
      <SectionBlock id="propriete" title={t('legal.propertyTitle')} setRef={setRef}>
        L'ensemble des contenus présents sur TrustLink (textes, images, logos, icônes) sont la propriété exclusive de TrustLink SAS ou de ses partenaires. Toute reproduction, même partielle, est strictement interdite sans autorisation écrite préalable.
      </SectionBlock>
      <SectionBlock id="responsabilite" title={t('legal.liabilityTitle')} setRef={setRef}>
        TrustLink agit en tant qu'intermédiaire de confiance. La plateforme ne peut être tenue responsable des résultats de faits d'usage, des événements de force majeure, des circonstances indépendantes de sa volonté.
      </SectionBlock>
      <SectionBlock id="droit" title={t('legal.lawTitle')} setRef={setRef}>
        Les présentes mentions légales sont soumises au droit béninois. Tout litige relatif à l'utilisation du site sera soumis à la compétence exclusive des tribunaux de Cotonou, Bénin.
      </SectionBlock>
      <div className="mt-4 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3" style={{ backgroundColor: '#EBF4FB' }}>
        <p className="text-sm font-poppins font-medium" style={{ color: '#0E3A4F' }}>{t('legal.questionLegal')}</p>
        <a href="mailto:legal@trustlink.bj" className="flex items-center gap-2 px-4 py-2 text-white text-xs font-poppins font-semibold rounded-lg" style={{ backgroundColor: '#125C8D' }}>
          <i className="ri-mail-line"></i> legal@trustlink.bj
        </a>
      </div>
    </>
  );
}

function ConfidentialiteContent({ t, setRef }) {
  const dataTypes = [
    { icon: 'ri-user-3-line', label: t('legal.dataIdentity'), desc: 'Nom, prénom, email, téléphone' },
    { icon: 'ri-map-pin-line', label: t('legal.dataAddress'), desc: 'Adresse de livraison' },
    { icon: 'ri-bank-card-line', label: t('legal.dataPayment'), desc: 'Via MTN, Moov, Wave' },
    { icon: 'ri-shopping-bag-line', label: t('legal.dataOrders'), desc: 'Historique des achats' },
    { icon: 'ri-video-line', label: t('legal.dataVideos'), desc: 'Vidéos de déballage pour litige' },
    { icon: 'ri-settings-3-line', label: t('legal.dataTechnical'), desc: 'Logs, données de navigation' },
  ];
  return (
    <>
      <SectionBlock id="donnees" title={t('legal.dataTitle')} setRef={setRef}>
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
      </SectionBlock>
      <SectionBlock id="utilisation" title={t('legal.dataUseTitle')} setRef={setRef}>
        <ul className="space-y-2">
          {['Traitement et suivi de vos commandes', 'Gestion des paiements Escrow et remboursements', 'Résolution des litiges et réclamations', 'Amélioration des services et de l\'expérience utilisateur', 'Communication sur l\'état de vos commandes', 'Prévention de la fraude et sécurité de la plateforme'].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#125C8D' }}></span>
              {item}
            </li>
          ))}
        </ul>
      </SectionBlock>
      <SectionBlock id="droits" title={t('legal.rightsTitle')} setRef={setRef}>
        <p className="mb-3">Conformément à la réglementation applicable, vous disposez des droits suivants sur vos données personnelles :</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {[t('legal.rightAccess'), t('legal.rightRectify'), t('legal.rightDelete'), t('legal.rightPortability'), t('legal.rightOppose'), t('legal.rightLimit')].map((r) => (
            <div key={r} className="text-center py-2 px-3 rounded-lg text-xs font-poppins font-medium" style={{ backgroundColor: '#F1F5F9', color: '#374151' }}>{r}</div>
          ))}
        </div>
        <p>Pour exercer ces droits : <a href="mailto:privacy@trustlink.bj" className="font-medium" style={{ color: '#125C8D' }}>privacy@trustlink.bj</a>.</p>
      </SectionBlock>
      <SectionBlock id="conservation" title={t('legal.retentionTitle')} setRef={setRef}>
        Vos données sont conservées pendant la durée de votre relation avec TrustLink, puis archivées pendant 5 ans conformément aux obligations légales. Les vidéos de déballage sont supprimées 90 jours après la clôture du litige.
      </SectionBlock>
      <div className="mt-4 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3" style={{ backgroundColor: '#EBF4FB' }}>
        <p className="text-sm font-poppins font-medium" style={{ color: '#0E3A4F' }}>{t('legal.questionLegal')}</p>
        <a href="mailto:privacy@trustlink.bj" className="flex items-center gap-2 px-4 py-2 text-white text-xs font-poppins font-semibold rounded-lg" style={{ backgroundColor: '#125C8D' }}>
          <i className="ri-mail-line"></i> privacy@trustlink.bj
        </a>
      </div>
    </>
  );
}

function CGUContent({ t, setRef }) {
  return (
    <>
      <p className="text-xs font-inter mb-4" style={{ color: '#9CA3AF' }}>{t('legal.lastUpdate')}</p>
      <SectionBlock id="objet" title={t('legal.cguObjectTitle')} setRef={setRef}>
        Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme TrustLink. En utilisant nos services, vous acceptez sans réserve ces CGU.
      </SectionBlock>
      <SectionBlock id="inscription" title={t('legal.cguRegistrationTitle')} setRef={setRef}>
        L'inscription est gratuite et réservée aux personnes physiques majeures résidant au Bénin. Vous êtes responsable de la confidentialité de vos identifiants.
      </SectionBlock>
      <SectionBlock id="escrow" title={t('legal.cguEscrowTitle')} setRef={setRef}>
        <div className="space-y-2">
          {['Tout paiement est sécurisé dans un compte tiers géré par TrustLink.', 'Les fonds sont libérés au vendeur uniquement après confirmation de réception par l\'acheteur, ou après 60h sans litige ouvert.', 'En cas de remboursement, la reconversion en FCFA se fait au taux de change en vigueur au moment du remboursement.', 'TrustLink se réserve le droit de bloquer un paiement en cas de suspicion de fraude.'].map((p, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-lg" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E5E7EB' }}>
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5" style={{ backgroundColor: '#125C8D' }}>{i + 1}</span>
              <p className="text-sm font-inter" style={{ color: '#374151' }}>{p}</p>
            </div>
          ))}
        </div>
      </SectionBlock>
      <SectionBlock id="obligations" title={t('legal.cguObligationsTitle')} setRef={setRef}>
        <ul className="space-y-2">
          {['Fournir des informations exactes lors de l\'inscription et du checkout', 'Confirmer la réception des commandes dans les délais impartis', 'Enregistrer la vidéo de déballage avant d\'ouvrir un litige', 'Ne pas tenter de contourner le système Escrow', 'Signaler tout problème via les canaux officiels TrustLink uniquement'].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <i className="ri-checkbox-circle-line text-sm mt-0.5 flex-shrink-0" style={{ color: '#125C8D' }}></i>
              {item}
            </li>
          ))}
        </ul>
      </SectionBlock>
      <SectionBlock id="litiges" title={t('legal.cguDisputesTitle')} setRef={setRef}>
        En cas de litige, TrustLink agit en tant qu'arbitre impartial. La décision de TrustLink est définitive. Pour plus de détails, consultez notre <Link to="/policy/returns" className="font-medium" style={{ color: '#125C8D' }}>Politique de remboursement</Link>.
      </SectionBlock>
      <SectionBlock id="modification" title={t('legal.cguModificationTitle')} setRef={setRef}>
        TrustLink se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés par email de toute modification substantielle.
      </SectionBlock>
      <div className="p-3 rounded-lg flex items-center gap-2 text-xs font-inter" style={{ backgroundColor: '#F1F5F9', color: '#6B7280' }}>
        <i className="ri-calendar-check-line" style={{ color: '#9CA3AF' }}></i>
        {t('legal.lastUpdate')}
      </div>
    </>
  );
}
