import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import AdminLayout from '@/components/feature/AdminLayout';
import HomePage from '@/pages/home/page';
import OrdersPage from '@/pages/orders/page';
import FinancePage from '@/pages/finance/page';
import LogisticsPage from '@/pages/logistics/page';
import ModerationPage from '@/pages/moderation/page';
import ProfilePage from '@/pages/profile/page';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import UsersPage from '@/pages/users/page';
import AdminLogsPage from '@/pages/admin-logs/page';
import ProductsPage from '@/pages/products/page';
import MessagesPage from '@/pages/messages/page';
import DeliveryVideosPage from '@/pages/delivery-videos/page';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, isAuthenticated, authError } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0A0F1D]">
        <div className="w-12 h-12 border-4 border-[#00C2FF]/20 border-t-[#00C2FF] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
    if (authError.type === 'not_admin') {
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-50">
          <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg border border-slate-100 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-red-100">
              <i className="ri-lock-line text-2xl text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Accès refusé</h1>
            <p className="text-slate-600 mb-4">{authError.message}</p>
            <p className="text-sm text-slate-500">Veuillez contacter un super administrateur.</p>
          </div>
        </div>
      );
    }
  }

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/register" element={<Navigate to="/" replace />} />
      <Route path="/*" element={
        <AdminLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/finance" element={<FinancePage />} />
            <Route path="/logistics" element={<LogisticsPage />} />
            <Route path="/moderation" element={<ModerationPage />} />
            <Route path="/users" element={<UsersPage />} />        {/* ← AJOUTE */}
            <Route path="/products" element={<ProductsPage />} />   {/* ← AJOUTE */}
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/admin-logs" element={<AdminLogsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/delivery-videos" element={<DeliveryVideosPage />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </AdminLayout>
      } />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
