import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 pt-20">
      <div className="text-8xl mb-6">🔍</div>
      <h1 className="text-3xl font-poppins font-bold mb-3" style={{ color: '#0E3A4F' }}>Page introuvable</h1>
      <p className="text-sm font-inter mb-8 text-center" style={{ color: '#6B7280' }}>
        La page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <Link
        to="/"
        className="px-8 py-3 text-white font-poppins font-semibold rounded-full transition-opacity hover:opacity-90"
        style={{ backgroundColor: '#FF6A00' }}
      >
        Retour à l'accueil
      </Link>
    </div>
  );
}
