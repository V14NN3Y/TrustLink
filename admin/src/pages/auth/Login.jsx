import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Identifiants invalides. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden" 
         style={{ background: 'linear-gradient(135deg, #0A0F1D 0%, #1A2235 100%)' }}>
      
      {/* Aurora Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full opacity-20 blur-[100px]" 
           style={{ background: 'radial-gradient(circle, #00C2FF 0%, transparent 70%)' }}></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-20 blur-[120px]" 
           style={{ background: 'radial-gradient(circle, #6A00FF 0%, transparent 70%)' }}></div>

      <div className="w-full max-w-md z-10 animate-fade-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-4 backdrop-blur-md">
            <i className="ri-shield-user-line text-3xl text-[#00C2FF]"></i>
          </div>
          <h1 className="text-3xl font-bold bg-white bg-clip-text text-transparent" style={{ fontFamily: 'Poppins, sans-serif' }}>
            TrustLink Admin
          </h1>
          <p className="text-slate-400 mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>Plateforme d'administration sécurisée</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Email</label>
              <div className="relative">
                <i className="ri-mail-line absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@trustlink.bj"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:border-[#00C2FF] focus:bg-white/10 outline-none transition-all placeholder:text-slate-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2 block ml-1">Mot de passe</label>
              <div className="relative">
                <i className="ri-lock-line absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:border-[#00C2FF] focus:bg-white/10 outline-none transition-all placeholder:text-slate-600"
                  required
                />
              </div>
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
              <span className="relative z-10">{loading ? 'Connexion en cours...' : 'Se connecter'}</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-slate-500 text-sm">
              Nouvel administrateur ? {' '}
              <Link to="/register" className="text-[#00C2FF] hover:underline font-semibold">Demander un accès</Link>
            </p>
          </div>
        </div>
        
        <p className="text-center text-slate-600 text-xs mt-8">
          &copy; 2024 TrustLink EcoSystem. Tous droits réservés.
        </p>
      </div>
    </div>
  );
}
