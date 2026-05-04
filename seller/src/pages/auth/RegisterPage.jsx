import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
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
  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    if (form.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
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
      setError(err.message || "Erreur lors de l'inscription");
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
          <h2 className="text-lg font-bold text-gray-900 mb-2">Compte créé !</h2>
          <p className="text-sm text-gray-500 mb-6">
            Vérifiez votre email pour confirmer votre inscription, puis connectez-vous.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white"
            style={{ backgroundColor: "#125C8D" }}
          >
            Aller à la connexion
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#10B981" }}>
            <i className="ri-links-line text-white text-xl"></i>
          </div>
          <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Devenir vendeur
          </h1>
          <p className="text-sm text-gray-400 mt-1">Créez votre compte TrustLink Seller</p>
        </div>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Nom complet</label>
            <input
              type="text"
              required
              value={form.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#125C8D]"
              placeholder="Adebayo Okonkwo"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Nom de la boutique</label>
            <input
              type="text"
              required
              value={form.businessName}
              onChange={(e) => handleChange("businessName", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#125C8D]"
              placeholder="Adebayo Fashions"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#125C8D]"
              placeholder="votre@email.com"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Mot de passe</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#125C8D]"
              placeholder="Min. 6 caractères"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Confirmer le mot de passe</label>
            <input
              type="password"
              required
              value={form.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#125C8D]"
              placeholder="Min. 6 caractères"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer transition-colors disabled:opacity-50"
            style={{ backgroundColor: "#125C8D" }}
          >
            {loading ? "Création..." : "Créer mon compte vendeur"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Déjà un compte ?{" "}
          <Link to="/login" className="text-[#125C8D] font-semibold hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
