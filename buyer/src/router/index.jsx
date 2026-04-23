import { Routes, Route } from 'react-router-dom';
import Home from '@/pages/home/page';
import ProductPage from '@/pages/product/page';
import Cart from '@/pages/cart/page';
import Checkout from '@/pages/checkout/page';
import Account from '@/pages/account/page';
import Wishlist from '@/pages/wishlist/page';
import FAQ from '@/pages/faq/page';
import Help from '@/pages/help/page';
import Support from '@/pages/support/page';
import Legal from '@/pages/legal/page';
import Returns from '@/pages/returns/page';
import NotFound from '@/pages/NotFound';
import Header from '@/components/feature/Header';
import Footer from '@/components/feature/Footer';
import FloatingSupportButton from '@/components/feature/FloatingSupportButton';

export default function AppRoutes() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/account" element={<Account />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/help" element={<Help />} />
          <Route path="/support" element={<Support />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="/policy/returns" element={<Returns />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <FloatingSupportButton />
    </>
  );
}
