import { Component } from 'react';
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch() {
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-xl font-poppins font-bold mb-2" style={{ color: '#111827' }}>Une erreur est survenue</h1>
            <p className="text-sm font-inter mb-6" style={{ color: '#6B7280' }}>
              Désolé, quelque chose s'est mal passé. Rechargez la page ou réessayez plus tard.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 text-white font-poppins font-semibold rounded-full"
              style={{ backgroundColor: '#FF6A00' }}
            >
              Recharger la page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
