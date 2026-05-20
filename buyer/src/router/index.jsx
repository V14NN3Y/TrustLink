import { Routes, Route, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import Home from '@/pages/home/page';
import ProductPage from '@/pages/product/page';
import Cart from '@/pages/cart/page';
import Checkout from '@/pages/checkout/page';
import Account from '@/pages/account/page';
import Wishlist from '@/pages/wishlist/page';
import Notifications from '@/pages/notifications/page';
import FAQ from '@/pages/faq/page';
import Help from '@/pages/help/page';
import Support from '@/pages/support/page';
import Legal from '@/pages/legal/page';
import Returns from '@/pages/returns/page';
import InvoicePage from '@/pages/invoice/page';
import NotFound from '@/pages/NotFound';
import MaintenancePage from '@/pages/MaintenancePage';
import Header from '@/components/feature/Header';
import Footer from '@/components/feature/Footer';
import FloatingSupportButton from '@/components/feature/FloatingSupportButton';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/auth/login';
import Register from '@/pages/auth/register';
import AuthCallback from '@/pages/auth/callback';
import ForgotPassword from '@/pages/auth/forgot-password';
import ResetPassword from '@/pages/auth/reset-password';
import { useMaintenance } from '@/hooks/useMaintenance';

const AUTH_ROUTES = ['/login', '/register', '/forgot-password', '/auth/reset-password', '/auth/callback'];

export default function AppRoutes() {
  const { pathname } = useLocation();
  const { isMaintenance, checked } = useMaintenance();

  const isAuthPage = useMemo(() => AUTH_ROUTES.includes(pathname), [pathname]);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-[#125C8D] rounded-full animate-spin" />
      </div>
    );
  }

  if (isMaintenance && !isAuthPage) {
    return (
      <>
        <Header />
        <main><MaintenancePage /></main>
        <Footer />
      </>
    );
  }

  return (
    <>
      {!isAuthPage && <Header />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/help" element={<Help />} />
          <Route path="/support" element={<Support />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/policy/returns" element={<Returns />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/account" element={<Account />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/notifications" element={<Notifications />} /> 
            <Route path="/invoice/:id" element={<InvoicePage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAuthPage && <Footer />}
      {!isAuthPage && <FloatingSupportButton />}
    </>
  );
}
