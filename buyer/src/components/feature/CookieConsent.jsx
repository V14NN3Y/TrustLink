import { useState, useEffect } from 'react';
import { t } from '@/lib/i18n';

const COOKIE_KEY = 'trustlink_cookie_consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_KEY, 'accepted');
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem(COOKIE_KEY, 'declined');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-up" style={{ backgroundColor: 'rgba(14,58,79,0.97)' }}>
      <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4 flex-wrap">
        <p className="text-white text-sm font-inter flex-1">{t('general.cookieConsent')}</p>
        <div className="flex gap-2">
          <button onClick={decline} className="px-4 py-2 text-xs font-poppins font-semibold rounded-lg border border-white/30 text-white/80 hover:bg-white/10 cursor-pointer">
            {t('general.cookieDecline')}
          </button>
          <button onClick={accept} className="px-4 py-2 text-xs font-poppins font-semibold rounded-lg text-white cursor-pointer" style={{ backgroundColor: '#FF6A00' }}>
            {t('general.cookieAccept')}
          </button>
        </div>
      </div>
    </div>
  );
}
