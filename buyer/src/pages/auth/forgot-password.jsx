import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (resetError) {
      setError(resetError.message || "Erreur lors de l'envoi de l'email.");
      setLoading(false);
      return;
    }
    setSuccess(true);
    setLoading(false);
  };
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white rounded-xl p-8 text-center border border-gray-100">
          <div className="w-12 h-12 flex items-center justify-center bg-green-100 rounded-full mx-auto mb-4">
            <i className="ri-mail-send-line text-green-600 text-xl"></i>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Email envoyé !
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Un lien de réinitialisation a été envoyé à{' '}
            <strong>{email}</strong>. Vérifie ta boîte mail (et les spams).
          </p>
          <Link
            to="/login"
            className="text-sm text-slate-800 font-medium underline"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl p-8 shadow-sm border border-gray-100">
        <div className="mb-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <i className="ri-arrow-left-line text-base"></i>
            Retour à la connexion
          </Link>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Mot de passe oublié
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Saisis ton adresse email et on t&apos;envoie un lien pour réinitialiser ton mot de passe.
        </p>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-800"
              placeholder="vous@exemple.com"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50 whitespace-nowrap cursor-pointer"
          >
            {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
          </button>
        </form>
      </div>
    </div>
  );
}
