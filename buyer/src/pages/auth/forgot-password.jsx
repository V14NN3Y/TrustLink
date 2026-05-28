import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useI18n } from '@/lib/I18nContext';
export default function ForgotPassword() {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (resetError) {
        setError(resetError.message || t('support.sendError'));
        setLoading(false);
        return;
      }
      setSuccess(true);
    } catch (err) {
      setError(t('general.error'));
    } finally {
      setLoading(false);
    }
  };
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white rounded-xl p-8 text-center border border-gray-100">
          <div className="w-12 h-12 flex items-center justify-center bg-green-100 rounded-full mx-auto mb-4">
            <i className="ri-mail-send-line text-green-600 text-xl"></i>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('auth.emailSent')}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {t('auth.emailSentDesc')}{' '}
            <strong>{email}</strong>. {t('auth.checkSpam')}
          </p>
          <Link
            to="/login"
            className="text-sm text-slate-800 font-medium underline"
          >
            {t('auth.backToLogin')}
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl p-8 shadow-sm border border-gray-100">
        <div className="flex justify-center mb-6">
          <img src="/TrustLink_Logo_Bleu-125C8D.png" alt="TrustLink" className="h-12 w-auto" />
        </div>
        <div className="mb-5">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <i className="ri-arrow-left-line text-base"></i>
            {t('auth.backToLogin')}
          </Link>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          {t('auth.forgotPasswordTitle')}
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          {t('auth.forgotPasswordDesc')}
        </p>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#125C8D]"
              placeholder={t('auth.emailPlaceholder')}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 whitespace-nowrap cursor-pointer"
            style={{ backgroundColor: '#125C8D' }}
          >
            {loading ? t('auth.sending') : t('auth.sendLink')}
          </button>
        </form>
      </div>
    </div>
  );
}
