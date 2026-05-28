import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useI18n } from '@/lib/I18nContext';

function getPasswordStrength(password, t) {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { score, label: t('auth.passwordVeryWeak'), color: '#EF4444' };
  if (score === 2) return { score, label: t('auth.passwordWeak'), color: '#F97316' };
  if (score === 3) return { score, label: t('auth.passwordMedium'), color: '#EAB308' };
  if (score === 4) return { score, label: t('auth.passwordGood'), color: '#22C55E' };
  return { score, label: t('auth.passwordExcellent'), color: '#15803D' };
}

export default function Register() {
  const { t } = useI18n();
  const { registerWithEmail, loginWithGoogle, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const strength = getPasswordStrength(password, t);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError(t('auth.passwordsDontMatch'));
      return;
    }
    if (password.length < 6) {
      setError(t('auth.passwordTooShort'));
      return;
    }
    setLoading(true);
    try {
      const result = await registerWithEmail(email, password, fullName);
      if (!result.success) {
        setError(result.error?.message || t('auth.registerError'));
        return;
      }
      setSuccess(true);
    } catch (err) {
      setError(err.message || t('auth.registerError'));
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

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white rounded-xl p-8 text-center border border-gray-100">
          <div className="w-12 h-12 flex items-center justify-center bg-green-100 rounded-full mx-auto mb-4">
            <i className="ri-mail-check-line text-green-600 text-xl"></i>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('auth.registerSuccess')}
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            {t('auth.registerSuccessDesc').replace('{email}', email)}
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
        <h1 className="text-2xl font-semibold text-gray-900 mb-2 text-center">
          {t('auth.createAccount')}
        </h1>
        <p className="text-sm text-gray-500 mb-6 text-center">
          {t('auth.hasAccount')}{' '}
          <Link to="/login" className="text-slate-800 font-medium underline">
            {t('auth.signIn')}
          </Link>
        </p>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.name')}
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoComplete="name"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#125C8D]"
              placeholder={t('auth.placeholderName')}
            />
          </div>
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
                autoComplete="new-password"
                className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#125C8D]"
                placeholder={t('auth.minChars')}
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
            {password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="flex-1 h-1 rounded-full transition-all duration-300"
                      style={{ backgroundColor: i <= strength.score ? strength.color : '#E5E7EB' }}
                    />
                  ))}
                </div>
                <p className="text-xs" style={{ color: strength.color }}>{strength.label}</p>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('auth.confirmPassword')}
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                className={`w-full px-3 py-2 pr-10 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-[#125C8D] ${
                  confirmPassword && confirmPassword !== password
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300'
                }`}
                placeholder={t('auth.confirmPasswordPlaceholder')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                tabIndex={-1}
              >
                <i className={showConfirmPassword ? 'ri-eye-off-line' : 'ri-eye-line'} style={{ fontSize: '16px' }}></i>
              </button>
            </div>
            {confirmPassword && confirmPassword !== password && (
              <p className="text-xs text-red-500 mt-1">{t('auth.passwordsDontMatch')}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 whitespace-nowrap cursor-pointer"
            style={{ backgroundColor: '#125C8D' }}
          >
            {loading ? t('auth.creating') : t('auth.createAccount')}
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
