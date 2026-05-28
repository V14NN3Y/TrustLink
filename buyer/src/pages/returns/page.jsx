import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '@/lib/I18nContext';

function getSections(t) {
  return {
    toc: [
      { id: 'intro', label: t('returns.tocIntro') },
      { id: 'escrow', label: t('returns.tocEscrow') },
      { id: 'fcfa', label: t('returns.tocFcfa') },
      { id: 'vendeur', label: t('returns.tocVendeur') },
      { id: 'preuves', label: t('returns.tocPreuves') },
      { id: 'matrice', label: t('returns.tocMatrice') },
      { id: 'traitement', label: t('returns.tocTraitement') },
      { id: 'exclusions', label: t('returns.tocExclusions') },
    ],
    heroBadge: t('returns.heroBadge'),
    heroTitle: t('returns.heroTitle'),
    heroDesc: t('returns.heroDesc'),
    stats: [
      [t('returns.stat1Val'), t('returns.stat1Label')],
      [t('returns.stat2Val'), t('returns.stat2Label')],
      [t('returns.stat3Val'), t('returns.stat3Label')],
    ],
    breadcrumbShop: t('returns.breadcrumbShop'),
    breadcrumbPolicy: t('returns.breadcrumbPolicy'),
    tocTitle: t('returns.tocTitle'),
    intro: {
      title: t('returns.introTitle'),
      content: t('returns.introContent'),
      cards: [
        { icon: 'ri-shield-check-line', label: t('returns.introCard1Label'), desc: t('returns.introCard1Desc') },
        { icon: 'ri-map-pin-line', label: t('returns.introCard2Label'), desc: t('returns.introCard2Desc') },
        { icon: 'ri-customer-service-2-line', label: t('returns.introCard3Label'), desc: t('returns.introCard3Desc') },
      ],
    },
    escrow: {
      title: t('returns.escrowTitle'),
      content: t('returns.escrowContent'),
      items: [
        { icon: 'ri-lock-line', label: t('returns.escrowItem1Label'), desc: t('returns.escrowItem1Desc') },
        { icon: 'ri-check-double-line', label: t('returns.escrowItem2Label'), desc: t('returns.escrowItem2Desc') },
        { icon: 'ri-time-line', label: t('returns.escrowItem3Label'), desc: t('returns.escrowItem3Desc') },
        { icon: 'ri-refund-2-line', label: t('returns.escrowItem4Label'), desc: t('returns.escrowItem4Desc') },
      ],
    },
    fcfa: {
      title: t('returns.fcfaTitle'),
      content: t('returns.fcfaContent'),
      steps: [
        t('returns.fcfaStep1'),
        t('returns.fcfaStep2'),
        t('returns.fcfaStep3'),
      ],
      alertTitle: t('returns.fcfaAlertTitle'),
      alertDesc: t('returns.fcfaAlertDesc'),
    },
    vendeur: {
      title: t('returns.vendeurTitle'),
      content: t('returns.vendeurContent'),
      items: [
        { icon: 'ri-vidicon-line', label: t('returns.vendeurItem1Label'), desc: t('returns.vendeurItem1Desc') },
        { icon: 'ri-checkbox-circle-line', label: t('returns.vendeurItem2Label'), desc: t('returns.vendeurItem2Desc') },
        { icon: 'ri-money-dollar-circle-line', label: t('returns.vendeurItem3Label'), desc: t('returns.vendeurItem3Desc') },
        { icon: 'ri-shield-check-line', label: t('returns.vendeurItem4Label'), desc: t('returns.vendeurItem4Desc') },
      ],
    },
    preuves: {
      title: t('returns.preuvesTitle'),
      content: t('returns.preuvesContent'),
      steps: [
        { n: 1, label: t('returns.preuvesStep1Label'), desc: t('returns.preuvesStep1Desc') },
        { n: 2, label: t('returns.preuvesStep2Label'), desc: t('returns.preuvesStep2Desc') },
        { n: 3, label: t('returns.preuvesStep3Label'), desc: t('returns.preuvesStep3Desc') },
        { n: 4, label: t('returns.preuvesStep4Label'), desc: t('returns.preuvesStep4Desc') },
      ],
    },
    matrice: {
      title: t('returns.matriceTitle'),
      cases: [
        { icon: 'ri-shield-flash-line', case: t('returns.matriceCase1'), badge: t('returns.matriceBadge1'), badgeColor: '#16A34A', badgeBg: '#DCFCE7', result: t('returns.matriceResult1'), desc: t('returns.matriceDesc1') },
        { icon: 'ri-close-circle-line', case: t('returns.matriceCase2'), badge: t('returns.matriceBadge2'), badgeColor: '#DC2626', badgeBg: '#FEE2E2', result: t('returns.matriceResult2'), desc: t('returns.matriceDesc2') },
        { icon: 'ri-hammer-line', case: t('returns.matriceCase3'), badge: t('returns.matriceBadge3'), badgeColor: '#D97706', badgeBg: '#FEF3C7', result: t('returns.matriceResult3'), desc: t('returns.matriceDesc3') },
        { icon: 'ri-user-star-line', case: t('returns.matriceCase4'), badge: t('returns.matriceBadge4'), badgeColor: '#6B7280', badgeBg: '#F1F5F9', result: t('returns.matriceResult4'), desc: t('returns.matriceDesc4') },
      ],
    },
    traitement: {
      title: t('returns.traitementTitle'),
      content: t('returns.traitementContent'),
      items: [
        { icon: 'ri-time-line', label: t('returns.traitementItem1Label'), desc: t('returns.traitementItem1Desc') },
        { icon: 'ri-smartphone-line', label: t('returns.traitementItem2Label'), desc: t('returns.traitementItem2Desc') },
        { icon: 'ri-user-line', label: t('returns.traitementItem3Label'), desc: t('returns.traitementItem3Desc') },
      ],
    },
    exclusions: {
      title: t('returns.exclusionsTitle'),
      content: t('returns.exclusionsContent'),
      items: [
        { n: 1, label: t('returns.exclusion1'), color: '#FEF3C7', border: '#FCD34D', text: '#92400E' },
        { n: 2, label: t('returns.exclusion2'), color: '#FFF1F2', border: '#FECDD3', text: '#991B1B' },
        { n: 3, label: t('returns.exclusion3'), color: '#FFF1F2', border: '#FECDD3', text: '#991B1B' },
        { n: 4, label: t('returns.exclusion4'), color: '#FFF1F2', border: '#FECDD3', text: '#991B1B' },
      ],
      hubNote: t('returns.exclusionsHubNote'),
    },
    ctaTitle: t('returns.ctaTitle'),
    ctaDesc: t('returns.ctaDesc'),
    ctaButton: t('returns.ctaButton'),
  };
}

export default function Returns() {
  const { t } = useI18n();
  const [activeSection, setActiveSection] = useState('intro');
  const sectionRefs = useRef({});
  const content = getSections(t);
  const TOC_SECTIONS = content.toc;

  const scrollToSection = (id) => {
    setActiveSection(id);
    const el = sectionRefs.current[id];
    if (el) {
      const offset = 120;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const offset = 140;
      let current = 'intro';
      for (const { id } of TOC_SECTIONS) {
        const el = sectionRefs.current[id];
        if (el && el.getBoundingClientRect().top - offset <= 0) {
          current = id;
        }
      }
      setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const setRef = (id) => (el) => { sectionRefs.current[id] = el; };

  return (
    <div className="pt-20 min-h-screen" style={{ backgroundColor: '#F8FAFC' }}>
      <div style={{ backgroundColor: '#0E3A4F' }} className="text-white py-12">
        <div className="max-w-[1100px] mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-5">
            <i className="ri-time-line text-sm"></i>
            <span className="text-sm font-poppins font-medium">{content.heroBadge}</span>
          </div>
          <h1 className="text-3xl font-poppins font-bold mb-3">{content.heroTitle}</h1>
          <p className="text-sm font-inter text-white/70 max-w-xl mx-auto mb-8">
            {content.heroDesc}
          </p>
          <div className="flex justify-center gap-8 flex-wrap">
            {content.stats.map(([val, label]) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-poppins font-bold">{val}</div>
                <div className="text-xs font-inter text-white/70">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center gap-2 text-xs font-inter mb-6" style={{ color: '#9CA3AF' }}>
          <Link to="/" className="hover:underline">{content.breadcrumbShop}</Link>
          <span>/</span>
          <span style={{ color: '#374151' }}>{content.breadcrumbPolicy}</span>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          <aside className="md:w-56 flex-shrink-0 sticky" style={{ top: '96px' }}>
            <p className="text-xs font-poppins font-semibold uppercase tracking-wider mb-3" style={{ color: '#9CA3AF' }}>{content.tocTitle}</p>
            <div className="space-y-0.5">
              {TOC_SECTIONS.map((s) => (
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

          <div className="flex-1 space-y-5">
            <div ref={setRef('intro')} className="bg-white rounded-xl p-6" style={{ border: '1px solid #E5E7EB' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#EBF4FB' }}>
                  <i className="ri-information-line text-sm" style={{ color: '#125C8D' }}></i>
                </div>
                <h2 className="text-base font-poppins font-semibold" style={{ color: '#111827' }}>{content.intro.title}</h2>
              </div>
              <p className="text-sm font-inter leading-relaxed mb-5" style={{ color: '#6B7280' }}>
                {content.intro.content}
              </p>
              <div className="grid grid-cols-3 gap-4">
                {content.intro.cards.map((item) => (
                  <div key={item.label} className="text-center p-3 rounded-xl" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E5E7EB' }}>
                    <i className={`${item.icon} text-xl mb-2 block`} style={{ color: '#125C8D' }}></i>
                    <p className="text-xs font-poppins font-semibold mb-1" style={{ color: '#111827' }}>{item.label}</p>
                    <p className="text-xs font-inter" style={{ color: '#9CA3AF' }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div ref={setRef('escrow')} className="bg-white rounded-xl p-6" style={{ border: '1px solid #E5E7EB', borderLeft: '4px solid #FF6A00' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FFF3EC' }}>
                  <i className="ri-shield-star-line text-sm" style={{ color: '#FF6A00' }}></i>
                </div>
                <h2 className="text-base font-poppins font-semibold" style={{ color: '#111827' }}>{content.escrow.title}</h2>
              </div>
              <p className="text-sm font-inter leading-relaxed mb-4" style={{ color: '#6B7280' }}>
                {content.escrow.content}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {content.escrow.items.map((item) => (
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

            <div ref={setRef('fcfa')} className="bg-white rounded-xl p-6" style={{ border: '1px solid #E5E7EB' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#EBF4FB' }}>
                  <i className="ri-exchange-funds-line text-sm" style={{ color: '#125C8D' }}></i>
                </div>
                <h2 className="text-base font-poppins font-semibold" style={{ color: '#111827' }}>{content.fcfa.title}</h2>
              </div>
              <p className="text-sm font-inter leading-relaxed mb-4" style={{ color: '#6B7280' }}>
                {content.fcfa.content}
              </p>
              <div className="flex items-center justify-between mb-4">
                {content.fcfa.steps.map((label, i) => (
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
                  <i className="ri-information-line mr-1"></i>{content.fcfa.alertTitle}
                </p>
                <p className="text-xs font-inter" style={{ color: '#92400E' }}>
                  {content.fcfa.alertDesc}
                </p>
              </div>
            </div>

            <div ref={setRef('vendeur')} className="bg-white rounded-xl p-6" style={{ border: '1px solid #E5E7EB' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#EBF4FB' }}>
                  <i className="ri-store-2-line text-sm" style={{ color: '#125C8D' }}></i>
                </div>
                <h2 className="text-base font-poppins font-semibold" style={{ color: '#111827' }}>{content.vendeur.title}</h2>
              </div>
              <p className="text-sm font-inter leading-relaxed mb-4" style={{ color: '#6B7280' }}>
                {content.vendeur.content}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {content.vendeur.items.map((item) => (
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

            <div ref={setRef('preuves')} className="bg-white rounded-xl p-6" style={{ border: '1px solid #E5E7EB' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#EBF4FB' }}>
                  <i className="ri-vidicon-line text-sm" style={{ color: '#125C8D' }}></i>
                </div>
                <h2 className="text-base font-poppins font-semibold" style={{ color: '#111827' }}>{content.preuves.title}</h2>
              </div>
              <p className="text-sm font-inter leading-relaxed mb-4" style={{ color: '#6B7280' }}>
                {content.preuves.content}
              </p>
              <div className="space-y-3">
                {content.preuves.steps.map((step) => (
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

            <div ref={setRef('matrice')} className="bg-white rounded-xl p-6" style={{ border: '1px solid #E5E7EB' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#EBF4FB' }}>
                  <i className="ri-git-branch-line text-sm" style={{ color: '#125C8D' }}></i>
                </div>
                <h2 className="text-base font-poppins font-semibold" style={{ color: '#111827' }}>{content.matrice.title}</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {content.matrice.cases.map((item) => (
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

            <div ref={setRef('traitement')} className="bg-white rounded-xl p-6" style={{ border: '1px solid #E5E7EB' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#EBF4FB' }}>
                  <i className="ri-refund-2-line text-sm" style={{ color: '#125C8D' }}></i>
                </div>
                <h2 className="text-base font-poppins font-semibold" style={{ color: '#111827' }}>{content.traitement.title}</h2>
              </div>
              <p className="text-sm font-inter leading-relaxed mb-5" style={{ color: '#6B7280' }}>
                {content.traitement.content}
              </p>
              <div className="grid grid-cols-3 gap-4">
                {content.traitement.items.map((item) => (
                  <div key={item.label} className="text-center p-3 rounded-xl" style={{ backgroundColor: '#F8FAFC' }}>
                    <i className={`${item.icon} text-xl mb-2 block`} style={{ color: '#125C8D' }}></i>
                    <p className="text-xs font-poppins font-semibold mb-1" style={{ color: '#111827' }}>{item.label}</p>
                    <p className="text-xs font-inter" style={{ color: '#9CA3AF' }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div ref={setRef('exclusions')} className="bg-white rounded-xl p-6" style={{ border: '1px solid #E5E7EB' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FFF1F2' }}>
                  <i className="ri-close-circle-line text-sm text-red-500"></i>
                </div>
                <h2 className="text-base font-poppins font-semibold" style={{ color: '#111827' }}>{content.exclusions.title}</h2>
              </div>
              <p className="text-sm font-inter leading-relaxed mb-4" style={{ color: '#6B7280' }}>
                {content.exclusions.content}
              </p>
              <div className="space-y-2 mb-5">
                {content.exclusions.items.map((item) => (
                  <div key={item.n} className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: item.color, border: `1px solid ${item.border}` }}>
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: item.text }}>{item.n}</span>
                    <p className="text-sm font-inter" style={{ color: item.text }}>{item.label}</p>
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#EBF4FB', border: '1px solid #BFDBFE' }}>
                <p className="text-xs font-inter" style={{ color: '#1E40AF' }}>
                  <i className="ri-information-line mr-1"></i>
                  {content.exclusions.hubNote}
                </p>
              </div>
            </div>

            <div className="rounded-xl p-8 text-center" style={{ backgroundColor: '#0E3A4F' }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <i className="ri-customer-service-2-line text-xl text-white"></i>
              </div>
              <h3 className="text-lg font-poppins font-semibold text-white mb-2">{content.ctaTitle}</h3>
              <p className="text-sm font-inter text-white/70 mb-5">{content.ctaDesc}</p>
              <Link to="/support"
                className="inline-flex items-center gap-2 px-6 py-2.5 text-white font-poppins font-semibold rounded-lg transition-opacity hover:opacity-90 text-sm"
                style={{ backgroundColor: '#FF6A00' }}>
                <i className="ri-chat-3-line"></i>
                {content.ctaButton}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}