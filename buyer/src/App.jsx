import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { AuthProvider } from '@/lib/AuthContext';
import AppRoutes from './router/index';
import { Toaster } from '@/components/ui/toaster';
function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <BrowserRouter basename="/">
        <AuthProvider>
          <AppRoutes />
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
export default App;
