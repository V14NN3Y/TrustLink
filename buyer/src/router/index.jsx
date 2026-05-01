import { Routes, Route } from 'react-router-dom';
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
import NotFound from '@/pages/NotFound';
import Header from '@/components/feature/Header';
import Footer from '@/components/feature/Footer';
import FloatingSupportButton from '@/components/feature/FloatingSupportButton';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/auth/login';
import Register from '@/pages/auth/register';
import AuthCallback from '@/pages/auth/callback';
import ForgotPassword from '@/pages/auth/forgot-password';
import ResetPassword from '@/pages/auth/reset-password';

export default function AppRoutes() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/help" element={<Help />} />
          <Route path="/support" element={<Support />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/policy/returns" element={<Returns />} />
          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          {/* Routes protégées (nécessitent d'être connecté) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/account" element={<Account />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/notifications" element={<Notifications />} /> 
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <FloatingSupportButton />
    </>
  );
}
