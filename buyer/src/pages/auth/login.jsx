import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/I18nContext';
export default function Login() {
  const { t } = useI18n();
  const { loginWithEmail, loginWithGoogle, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const resetSuccess = searchParams.get('reset') === 'success';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await loginWithEmail(email, password);
      if (!result.success) {
        setError(result.error?.message || t('auth.loginError'));
        return;
      }
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || t('auth.loginErrorDefault'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      const result = await loginWithGoogle();
      if (!result.success) {
        setError(result.error?.message || t('auth.googleError'));
      }
    } catch (err) {
      setError(err.message || t('auth.googleError'));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl p-8 shadow-sm border border-gray-100">
        <div className="flex justify-center mb-6">
          <img src="/TrustLink_Logo_Bleu-125C8D.png" alt="TrustLink" className="h-12 w-auto" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2 text-center">{t('auth.login')}</h1>
        <p className="text-sm text-gray-500 mb-6 text-center">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="text-slate-800 font-medium underline">
            {t('auth.register')}
          </Link>
        </p>

        {resetSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
            <i className="ri-checkbox-circle-line text-base"></i>
            {t('auth.resetSuccess')}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.password')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#125C8D]"
                placeholder={t('auth.passwordPlaceholder')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                tabIndex={-1}
              >
                <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} style={{ fontSize: '16px' }}></i>
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span />
            <Link
              to="/forgot-password"
              className="text-sm text-slate-700 hover:underline"
            >
              {t('auth.forgotPassword')}
            </Link>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 whitespace-nowrap cursor-pointer"
            style={{ backgroundColor: '#125C8D' }}
          >
            {loading ? t('auth.signInLoading') : t('auth.signIn')}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">{t('general.or')}</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 py-2.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 whitespace-nowrap cursor-pointer"
        >
          <i className="ri-google-fill text-base"></i>
          {googleLoading ? t('auth.redirecting') : t('auth.continueWithGoogle')}
        </button>
      </div>
    </div>
  );
}
