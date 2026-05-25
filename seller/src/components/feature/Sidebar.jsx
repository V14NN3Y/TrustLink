import { useState } from "react";
import { useLocation, useNavigate, NavLink, Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { useSidebar } from "@/lib/SidebarContext";
import { useLocale } from "@/lib/i18n";

const profileMenuItems = [
  { icon: "ri-user-line", key: "profile", path: "/settings/profile" },
  { icon: "ri-store-2-line", key: "boutique", path: "/settings/boutique" },
  { icon: "ri-notification-3-line", key: "notifications", path: "/settings/notifications" },
  { icon: "ri-shield-line", key: "securite", path: "/settings/securite" },
  { icon: "ri-global-line", key: "langue", path: "/settings/langue" },
];

const navItems = [
  { path: "/", icon: "ri-dashboard-3-line", key: "dashboard" },
  { path: "/orders", icon: "ri-shopping-bag-3-line", key: "orders" },
  { path: "/catalog", icon: "ri-store-2-line", key: "catalog" },
  { path: "/reviews", icon: "ri-star-line", key: "reviews" },
  { path: "/stats", icon: "ri-bar-chart-line", key: "stats" },
  { path: "/questions", icon: "ri-question-answer-line", key: "questions" },
  { path: "/help", icon: "ri-information-line", key: "help" },
  { path: "/activity", icon: "ri-history-line", key: "activity" },
  { path: "/support", icon: "ri-customer-service-2-line", key: "support" },
  { path: "/messages", icon: "ri-message-3-line", key: "messages" },
];

const profileLabelsFr = {
  profile: "Mon Profil", boutique: "Boutique & Marque",
  notifications: "Notifications", securite: "Sécurité", langue: "Langue & Devise",
};
const profileLabelsEn = {
  profile: "My Profile", boutique: "Store & Brand",
  notifications: "Notifications", securite: "Security", langue: "Language & Currency",
};

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, profile, logout } = useAuth();
  const { open: sidebarOpen, close } = useSidebar();
  const { locale, t } = useLocale();

  const profileLabels = locale === "en" ? profileLabelsEn : profileLabelsFr;

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const handleNavClick = () => { close(); };

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 md:hidden" onClick={close} />
      )}

      <div
        className={`fixed left-0 top-0 w-64 h-screen z-30 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        style={{ backgroundColor: "#0E3A4F" }}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <Link to="/" className="flex items-center gap-3" onClick={handleNavClick}>
            <img src="/TrustLink_Logo_Bleu-125C8D.png" alt="TrustLink" className="h-8 w-auto" />
          </Link>
          <div className="text-white/50 text-[10px] leading-tight mt-1">Seller Hub</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <p className="text-white/30 text-[9px] font-bold uppercase tracking-widest px-3 mb-3">
            {locale === "en" ? "Main Menu" : "Menu Principal"}
          </p>
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer ${
                    active ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white/90"
                  }`}
                >
                  <i className={`${item.icon} text-base w-5 text-center flex-shrink-0 ${active ? "text-[#10B981]" : ""}`}></i>
                  <span className="text-sm font-medium flex-1 whitespace-nowrap">{t(`nav.${item.key}`)}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* User Profile Bottom */}
        <div className="border-t border-white/10 relative">
          {menuOpen && (
            <div className="absolute bottom-full left-3 right-3 mb-2 bg-[#0E3A4F] border border-white/15 rounded-xl overflow-hidden shadow-2xl">
              <div className="px-4 py-3 border-b border-white/10">
                <p className="text-white text-sm font-semibold">{profile?.business_name || "Vendeur"}</p>
                <p className="text-white/50 text-xs">{profile?.email || ""}</p>
              </div>
              <div className="py-1">
                {profileMenuItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => { navigate(item.path); setMenuOpen(false); handleNavClick(); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-white/70 hover:text-white hover:bg-white/5 transition-all text-left"
                  >
                    <i className={`${item.icon} text-sm w-4 text-center flex-shrink-0`}></i>
                    <span className="text-sm">{profileLabels[item.key]}</span>
                  </button>
                ))}
              </div>
              <div className="border-t border-white/10 py-1">
                <button
                  onClick={() => { setMenuOpen(false); logout(); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-white/5 transition-all text-left"
                >
                  <i className="ri-logout-box-r-line text-sm w-4 text-center flex-shrink-0"></i>
                  <span className="text-sm font-medium">{locale === "en" ? "Sign out" : "Déconnexion"}</span>
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
                src={profile?.avatar_url || ""}
                alt={profile?.business_name || "Vendeur"}
                className="w-9 h-9 rounded-full object-cover"
                onError={(e) => { e.target.style.display = "none"; if (e.target.nextSibling) e.target.nextSibling.style.display = "flex"; }}
              />
              <div className="w-9 h-9 rounded-full items-center justify-center text-white font-bold text-sm flex-shrink-0 hidden" style={{ backgroundColor: "#125C8D" }}>
                {profile?.business_name?.slice(0, 2)?.toUpperCase() || "SE"}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#10B981] border-2 border-[#0E3A4F]"></span>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-white text-sm font-semibold truncate">{profile?.business_name || "Vendeur"}</div>
              <div className="text-white/50 text-[10px] truncate">
                {profile?.default_city || "Hub"} · {locale === "en" ? "Verified" : "Vérifié"}
              </div>
            </div>
            <i className={`ri-arrow-${menuOpen ? "up" : "down"}-s-line text-white/40 text-sm flex-shrink-0`}></i>
          </button>
        </div>
      </div>
    </>
  );
}
