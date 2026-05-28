import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useI18n } from '@/lib/I18nContext';
export default function AuthCallback() {
  const { t } = useI18n();
  const navigate = useNavigate();
  useEffect(() => {
    const handleCallback = async () => {
      let session, error;
      try {
        const res = await supabase.auth.getSession();
        session = res.data?.session;
        error = res.error;
      } catch (err) {
        navigate('/login?error=oauth_failed', { replace: true });
        return;
      }
      if (error) {
        navigate('/login?error=oauth_failed', { replace: true });
        return;
      }
      if (session) {
        navigate('/', { replace: true });
        return;
      }
      // Session pas encore dispo, on attend via onAuthStateChange
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, newSession) => {
        if (newSession) {
          subscription.unsubscribe();
          navigate('/', { replace: true });
        }
      });
      // Timeout de sécurité 5s
      const timeout = setTimeout(() => {
        subscription.unsubscribe();
        navigate('/login?error=timeout', { replace: true });
      }, 5000);
      return () => {
        clearTimeout(timeout);
        subscription.unsubscribe();
      };
    };
    handleCallback();
  }, [navigate]);
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white gap-4">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      <p className="text-sm text-gray-500">{t('auth.callbackLoading')}</p>
    </div>
  );
}
