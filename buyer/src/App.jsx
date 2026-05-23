import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { AuthProvider } from '@/lib/AuthContext';
import { CurrencyProvider } from '@/lib/CurrencyContext';
import { I18nProvider } from '@/lib/I18nContext';
import AppRoutes from './router/index';
import { Toaster } from '@/components/ui/toaster';
import ErrorBoundary from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClientInstance}>
        <BrowserRouter
          basename="/"
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <I18nProvider>
            <CurrencyProvider>
              <AuthProvider>
                <AppRoutes />
                <Toaster />
              </AuthProvider>
            </CurrencyProvider>
          </I18nProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
export default App;
