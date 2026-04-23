import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const SLIDES = [
  {
    image: 'https://readdy.ai/api/search-image?query=vibrant%20african%20fashion%20clothing%20collection%20colorful%20fabrics%20and%20modern%20outfits%2C%20dark%20moody%20background%20with%20warm%20orange%20and%20blue%20tones%2C%20stylish%20lifestyle%20photography&width=1200&height=600&seq=hero1&orientation=landscape',
    badge: '⚡ VENTES FLASH',
    title: 'Jusqu\'à -50%\nsur la Mode',
    desc: 'Les meilleures marques nigérianes livrées chez vous en 2 à 7 jours. Paiement 100% en FCFA.',
    cta1: { label: 'Découvrir les offres →', to: '/?category=mode' },
    cta2: { label: 'Protection Escrow', to: '/legal?tab=escrow', icon: 'ri-shield-check-line' },
  },
  {
    image: 'https://readdy.ai/api/search-image?query=modern%20smartphones%20and%20tech%20gadgets%20on%20dark%20background%20with%20blue%20and%20teal%20lighting%2C%20futuristic%20technology%20product%20display%2C%20premium%20electronics&width=1200&height=600&seq=hero2&orientation=landscape',
    badge: '⚡ HIGH-TECH',
    title: 'Smartphones &\nAccessoires',
    desc: 'Dernières technologies nigérianes certifiées. Garantie incluse, livraison express.',
    cta1: { label: 'Explorer le High-Tech →', to: '/?category=hightech' },
    cta2: { label: 'Protection Escrow', to: '/legal?tab=escrow', icon: 'ri-shield-check-line' },
  },
  {
    image: 'https://readdy.ai/api/search-image?query=luxury%20natural%20beauty%20skincare%20products%20with%20shea%20butter%20coconut%20oil%20on%20elegant%20dark%20background%20with%20warm%20golden%20lighting%2C%20african%20beauty%20cosmetics&width=1200&height=600&seq=hero3&orientation=landscape',
    badge: '✨ BEAUTÉ',
    title: 'Soins Naturels\nAfricains',
    desc: 'Cosmétiques formulés pour les peaux africaines. 100% naturels, certifiés premium.',
    cta1: { label: 'Voir la Beauté →', to: '/?category=beaute' },
    cta2: { label: 'Protection Escrow', to: '/legal?tab=escrow', icon: 'ri-shield-check-line' },
  },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length);
  const next = () => setCurrent((c) => (c + 1) % SLIDES.length);

  return (
    <div className="relative w-full overflow-hidden" style={{ height: '520px' }}>
      {SLIDES.map((slide, idx) => (
        <div
          key={idx}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: idx === current ? 1 : 0, zIndex: idx === current ? 1 : 0 }}
        >
          <img src={slide.image} alt={slide.title} className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(14,58,79,0.90) 0%, rgba(14,58,79,0.70) 45%, rgba(14,58,79,0.20) 100%)' }} />
          <div className="absolute inset-0 flex items-center" style={{ zIndex: 2 }}>
            <div className="max-w-[1200px] mx-auto px-8 md:px-12 w-full">
              <div className="max-w-xl">
                <span className="inline-block text-white text-xs font-poppins font-bold uppercase rounded-lg px-3 py-1.5 mb-5" style={{ backgroundColor: '#FF6A00' }}>
                  {slide.badge}
                </span>
                <h2 className="text-4xl md:text-5xl font-poppins font-bold text-white whitespace-pre-line mb-4 leading-tight">
                  {slide.title}
                </h2>
                <p className="text-sm md:text-base font-inter mb-8 max-w-md" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  {slide.desc}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to={slide.cta1.to}
                    className="px-7 py-3 text-white font-poppins font-semibold rounded-lg text-sm transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#FF6A00' }}
                  >
                    {slide.cta1.label}
                  </Link>
                  <Link
                    to={slide.cta2.to}
                    className="px-7 py-3 font-poppins font-semibold rounded-lg text-sm border border-white/50 text-white transition-colors hover:bg-white/10 flex items-center gap-2"
                  >
                    {slide.cta2.icon && <i className={slide.cta2.icon}></i>}
                    {slide.cta2.label}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors z-10"
        style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}
      >
        <i className="ri-arrow-left-s-line text-xl"></i>
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors z-10"
        style={{ backgroundColor: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)' }}
      >
        <i className="ri-arrow-right-s-line text-xl"></i>
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className="rounded-full transition-all duration-300"
            style={{
              width: idx === current ? '28px' : '8px',
              height: '8px',
              backgroundColor: idx === current ? '#FF6A00' : 'rgba(255,255,255,0.5)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
