import { useState } from "react";
import { useLocation, useNavigate, NavLink } from "react-router-dom";

const navItems = [
  { path: "/", icon: "ri-dashboard-3-line", label: "Dashboard" },
  { path: "/orders", icon: "ri-shopping-bag-3-line", label: "Commandes", badge: 34 },
  { path: "/catalog", icon: "ri-store-2-line", label: "Catalogue" },
  { path: "/wallet", icon: "ri-wallet-3-line", label: "Wallet" },
  { path: "/support", icon: "ri-customer-service-2-line", label: "Support & KYC" },
];

const profileMenuItems = [
  { icon: "ri-user-line", label: "Mon Profil", path: "/settings/profile" },
  { icon: "ri-store-2-line", label: "Boutique & Marque", path: "/settings/boutique" },
  { icon: "ri-bank-line", label: "Comptes Bancaires", path: "/settings/banque" },
  { icon: "ri-notification-3-line", label: "Notifications", path: "/settings/notifications" },
  { icon: "ri-shield-line", label: "Sécurité", path: "/settings/securite" },
  { icon: "ri-global-line", label: "Langue & Devise", path: "/settings/langue" },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed left-0 top-0 w-64 h-screen z-30 flex flex-col" style={{ backgroundColor: "#0E3A4F" }}>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#10B981" }}>
            <i className="ri-links-line text-white text-lg"></i>
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>TrustLink</div>
            <div className="text-white/50 text-[10px] leading-tight">Seller Hub</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest px-3 mb-3">Menu Principal</p>
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer ${
                  active ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white/90"
                }`}
              >
                <i className={`${item.icon} text-base w-5 text-center flex-shrink-0 ${active ? "text-[#10B981]" : ""}`}></i>
                <span className="text-sm font-medium flex-1 whitespace-nowrap">{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap" style={{ backgroundColor: "#FF6A00", color: "#fff" }}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* User Profile Bottom */}
      <div className="border-t border-white/10 relative">
        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="absolute bottom-full left-3 right-3 mb-2 bg-[#0E3A4F] border border-white/15 rounded-xl overflow-hidden shadow-2xl">
            <div className="px-4 py-3 border-b border-white/10">
              <p className="text-white text-sm font-semibold">Adebayo Fashions</p>
              <p className="text-white/50 text-xs">adebayo@trustlink.ng</p>
            </div>
            <div className="py-1">
              {profileMenuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => { navigate(item.path); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-white/70 hover:text-white hover:bg-white/5 transition-all text-left"
                >
                  <i className={`${item.icon} text-sm w-4 text-center flex-shrink-0`}></i>
                  <span className="text-sm">{item.label}</span>
                </button>
              ))}
            </div>
            <div className="border-t border-white/10 py-1">
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-white/5 transition-all text-left">
                <i className="ri-logout-box-r-line text-sm w-4 text-center flex-shrink-0"></i>
                <span className="text-sm font-medium">Déconnexion</span>
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-full px-4 py-4 hover:bg-white/5 transition-all flex items-center gap-3"
        >
          <div className="relative flex-shrink-0">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
              alt="Adebayo Fashions"
              className="w-9 h-9 rounded-full object-cover"
              onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
            />
            <div className="w-9 h-9 rounded-full items-center justify-center text-white font-bold text-sm flex-shrink-0 hidden" style={{ backgroundColor: "#125C8D" }}>AF</div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#10B981] border-2 border-[#0E3A4F]"></span>
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-white text-sm font-semibold truncate">Adebayo Fashions</div>
            <div className="text-white/50 text-[10px] truncate">Lagos Hub · Vérifié</div>
          </div>
          <i className={`ri-arrow-${menuOpen ? "down" : "up"}-s-line text-white/40 text-sm flex-shrink-0`}></i>
        </button>
      </div>
    </div>
  );
}
