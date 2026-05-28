import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { t } from "@/lib/i18n";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isAuthenticated, isLoadingAuth } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    businessName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, isLoadingAuth, navigate]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError(t('pages.auth.passwordMismatch'));
      return;
    }
    if (form.password.length < 8) {
      setError(t('pages.auth.passwordTooShort'));
      return;
    }
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email)) {
      setError(t('pages.auth.invalidEmail'));
      return;
    }
    setError("");
    setLoading(true);
    try {
      await register(form.email, form.password, {
        full_name: form.fullName,
        business_name: form.businessName,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || t('pages.auth.registerError'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 p-8 text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 bg-green-50">
            <i className="ri-checkbox-circle-fill text-3xl text-[#10B981]"></i>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">{t('pages.auth.accountCreated')}</h2>
          <p className="text-sm text-gray-500 mb-6">
            {t('pages.auth.accountCreatedSub')}
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white"
            style={{ backgroundColor: "#125C8D" }}
          >
            {t('pages.auth.goToLogin')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="mb-4">
            <img src="/TrustLink_Logo_Bleu-125C8D.png" alt="TrustLink" className="h-12 w-auto mx-auto" />
          </div>
          <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {t('pages.auth.registerTitle')}
          </h1>
          <p className="text-sm text-gray-400 mt-1">{t('pages.auth.registerSub')}</p>
        </div>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">{t('pages.auth.fullName')}</label>
            <input
              type="text"
              required
              value={form.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#125C8D]"
              placeholder={t('pages.auth.namePlaceholder')}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">{t('pages.auth.businessName')}</label>
            <input
              type="text"
              required
              value={form.businessName}
              onChange={(e) => handleChange("businessName", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#125C8D]"
              placeholder={t('pages.auth.storePlaceholder')}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">{t('pages.auth.email')}</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#125C8D]"
              placeholder={t('pages.auth.emailPlaceholder')}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">{t('pages.auth.password')}</label>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#125C8D]"
              placeholder={t('pages.auth.minPassword')}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">{t('pages.auth.confirmPassword')}</label>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#125C8D]"
              placeholder={t('pages.auth.minPassword')}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer transition-colors disabled:opacity-50"
            style={{ backgroundColor: "#125C8D" }}
          >
            {loading ? t('pages.auth.registering') : t('pages.auth.registerBtn')}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          {t('pages.auth.alreadyAccount')}{" "}
          <Link to="/login" className="text-[#125C8D] font-semibold hover:underline">
            {t('pages.auth.login')}
          </Link>
        </p>
      </div>
    </div>
  );
}
