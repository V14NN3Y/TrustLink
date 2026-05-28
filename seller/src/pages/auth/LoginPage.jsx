import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { t } from "@/lib/i18n";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoadingAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, isLoadingAuth, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      await new Promise(r => setTimeout(r, 100));
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || t('pages.auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="mb-4">
            <img src="/TrustLink_Logo_Bleu-125C8D.png" alt="TrustLink" className="h-12 w-auto mx-auto" />
          </div>
          <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {t('pages.auth.loginTitle')}
          </h1>
          <p className="text-sm text-gray-400 mt-1">{t('pages.auth.loginSub')}</p>
        </div>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">{t('pages.auth.email')}</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#125C8D] transition-colors"
              placeholder={t('pages.auth.emailPlaceholder')}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('pages.auth.password')}</label>
              <Link to="/forgot-password" className="text-xs text-[#125C8D] hover:underline font-medium">
                {t('pages.auth.forgotPassword')}
              </Link>
            </div>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#125C8D] transition-colors"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer transition-colors disabled:opacity-50"
            style={{ backgroundColor: "#125C8D" }}
          >
            {loading ? t('pages.auth.logging') : t('pages.auth.login')}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          {t('pages.auth.noAccount')}{" "}
          <Link to="/register" className="text-[#125C8D] font-semibold hover:underline">
            {t('pages.auth.createAccount')}
          </Link>
        </p>
      </div>
    </div>
  );
}
