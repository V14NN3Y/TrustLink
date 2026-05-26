import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();
  const VALID_CODE = import.meta.env.VITE_ADMIN_INVITE_CODE;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inviteCode !== VALID_CODE) {
      return setError('Code d\'invitation invalide.');
    }
    if (formData.password !== formData.confirmPassword) {
      return setError('Les mots de passe ne correspondent pas.');
    }
    setLoading(true);
    setError('');
    try {
      await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
      });
      // Avec Supabase, l'inscription peut nécessiter une confirmation email
      // selon ta config. Redirection vers login en attendant.
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors de la création du compte.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0A0F1D 0%, #1A2235 100%)' }}>

      {/* Aurora Background Effects */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full opacity-20 blur-[100px]"
        style={{ background: 'radial-gradient(circle, #00C2FF 0%, transparent 70%)' }}></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-20 blur-[120px]"
        style={{ background: 'radial-gradient(circle, #6A00FF 0%, transparent 70%)' }}></div>

      <div className="w-full max-w-md z-10 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-white bg-clip-text text-transparent" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Nouvel Accès Admin
          </h1>
          <p className="text-slate-400 mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>Créez votre profil administrateur</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Nom complet</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Jean Dupont"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:border-[#00C2FF] focus:bg-white/10 outline-none transition-all placeholder:text-slate-600"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Code d'invitation</label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Code d'invitation"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:border-[#00C2FF] focus:bg-white/10 outline-none transition-all placeholder:text-slate-600"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="admin@trustlink.bj"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:border-[#00C2FF] focus:bg-white/10 outline-none transition-all placeholder:text-slate-600"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Mot de passe</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:border-[#00C2FF] focus:bg-white/10 outline-none transition-all placeholder:text-slate-600"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">Confirmer</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:border-[#00C2FF] focus:bg-white/10 outline-none transition-all placeholder:text-slate-600"
                required
              />
            </div>

            {error && (
              <div className="text-red-400 text-xs text-center font-medium bg-red-400/10 py-2 rounded-xl border border-red-400/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl font-bold text-white transition-all transform active:scale-95 shadow-lg relative overflow-hidden group cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #00C2FF 0%, #0082FF 100%)' }}
            >
              <span className="relative z-10">{loading ? 'Création...' : 'S\'inscrire'}</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-slate-500 text-sm">
              Déjà administrateur ? {' '}
              <Link to="/login" className="text-[#00C2FF] hover:underline font-semibold">Se connecter</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
