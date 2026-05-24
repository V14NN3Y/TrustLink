import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (err) throw err;
      setSent(true);
    } catch (err) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 bg-blue-50">
            <i className="ri-mail-send-line text-3xl text-[#125C8D]"></i>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Email envoyé</h2>
          <p className="text-sm text-gray-500 mb-6">
            Si un compte existe pour <strong>{email}</strong>, vous recevrez un lien de réinitialisation dans quelques minutes.
          </p>
          <Link
            to="/login"
            className="block w-full py-2.5 rounded-lg text-sm font-semibold text-white text-center"
            style={{ backgroundColor: "#125C8D" }}
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="mb-4">
            <img src="/TrustLink_Logo_Bleu-125C8D.png" alt="TrustLink" className="h-12 w-auto mx-auto" />
          </div>
          <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Mot de passe oublié
          </h1>
          <p className="text-sm text-gray-400 mt-1">Entrez votre email pour recevoir un lien de réinitialisation</p>
        </div>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Email</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#125C8D] transition-colors"
              placeholder="votre@email.com"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer transition-colors disabled:opacity-50"
            style={{ backgroundColor: "#125C8D" }}
          >
            {loading ? "Envoi..." : "Envoyer le lien"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          <Link to="/login" className="text-[#125C8D] font-semibold hover:underline">
            ← Retour à la connexion
          </Link>
        </p>
      </div>
    </div>
  );
}
