import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { totalItems } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate('/?search=' + encodeURIComponent(query.trim()));
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-300 ${scrolled ? 'shadow-sm' : 'border-b border-gray-100'}`}>
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        {/* Desktop */}
        <div className="hidden md:flex items-center h-16 gap-6">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#125C8D' }}>
              <i className="ri-links-line text-white text-base"></i>
            </div>
            <span className="font-poppins font-bold text-xl">
              <span style={{ color: '#0E3A4F' }}>Trust</span><span style={{ color: '#FF6A00' }}>Link</span>
            </span>
          </Link>

          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un produit, une marque..."
                className="flex-1 px-4 py-2.5 text-sm outline-none font-inter"
                style={{ color: '#111827' }}
              />
              <button type="submit" className="px-4 py-2.5 text-white flex items-center justify-center" style={{ backgroundColor: '#125C8D', minWidth: '44px' }}>
                <i className="ri-search-line text-base"></i>
              </button>
            </div>
          </form>

          <div className="flex items-center gap-1">
            <Link to="/wishlist" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
              <i className="ri-heart-line text-xl" style={{ color: '#6B7280' }}></i>
            </Link>
            <Link to="/cart" className="relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
              <i className="ri-shopping-cart-line text-xl" style={{ color: '#6B7280' }}></i>
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 text-xs font-bold text-white rounded-full flex items-center justify-center font-poppins" style={{ backgroundColor: '#FF6A00', fontSize: '10px' }}>
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>
            <Link to="/account" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
              <i className="ri-user-3-line text-xl" style={{ color: '#6B7280' }}></i>
            </Link>
          </div>
        </div>

        {/* Mobile */}
        <div className="md:hidden">
          <div className="flex items-center justify-between h-14">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#125C8D' }}>
                <i className="ri-links-line text-white text-sm"></i>
              </div>
              <span className="font-poppins font-bold text-lg">
                <span style={{ color: '#0E3A4F' }}>Trust</span><span style={{ color: '#FF6A00' }}>Link</span>
              </span>
            </Link>
            <div className="flex items-center gap-1">
              <Link to="/cart" className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100">
                <i className="ri-shopping-cart-line text-lg" style={{ color: '#6B7280' }}></i>
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 text-white rounded-full flex items-center justify-center" style={{ backgroundColor: '#FF6A00', fontSize: '9px' }}>
                    {totalItems}
                  </span>
                )}
              </Link>
              <button onClick={() => setMenuOpen(!menuOpen)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100">
                <i className={`text-lg ${menuOpen ? 'ri-close-line' : 'ri-menu-line'}`} style={{ color: '#111827' }}></i>
              </button>
            </div>
          </div>
          <div className="pb-2">
            <form onSubmit={handleSearch}>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher..." className="flex-1 px-3 py-2 text-sm outline-none font-inter" />
                <button type="submit" className="px-3 py-2 text-white" style={{ backgroundColor: '#125C8D' }}>
                  <i className="ri-search-line text-sm"></i>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pb-4">
          {[['/', 'Boutique'], ['/account', 'Mon Compte'], ['/wishlist', 'Ma Wishlist'], ['/faq', 'FAQ'], ['/support', 'Support']].map(([to, label]) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)} className="block py-3 text-sm font-inter border-b border-gray-50 last:border-0" style={{ color: '#111827' }}>
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
