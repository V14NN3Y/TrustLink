import { Component } from 'react';
import { t } from '@/lib/i18n';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('[TrustLink] Erreur capturée par ErrorBoundary:', error, info);
  }
  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-xl font-poppins font-bold mb-2" style={{ color: '#111827' }}>{t('errorBoundary.title')}</h1>
            <p className="text-sm font-inter mb-6" style={{ color: '#6B7280' }}>
              {t('errorBoundary.message')}
            </p>
            <button
              onClick={this.handleReset}
              className="px-6 py-2.5 text-white font-poppins font-semibold rounded-full"
              style={{ backgroundColor: '#FF6A00' }}
            >
              {t('errorBoundary.reload')}
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
