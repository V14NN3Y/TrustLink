import { useLocation } from "react-router-dom";
import { useExchangeRate } from "@/hooks/useExchangeRate";

const pageTitles = [
  { path: "/catalog/new", title: "Nouveau Produit", subtitle: "Ajoutez un produit à votre catalogue" },
  { path: "/catalog", title: "Catalogue", subtitle: "Gérez vos produits et votre inventaire" },
  { path: "/orders", title: "Commandes", subtitle: "Suivi et gestion des commandes" },
  { path: "/wallet", title: "Wallet", subtitle: "Finances et retraits" },
  { path: "/support", title: "Support & KYC", subtitle: "Assistance et vérification d'identité" },
  { path: "/settings/profile",       title: "Mon Profil",       subtitle: "Gérez vos informations personnelles et préférences" },
  { path: "/settings/boutique",      title: "Boutique & Marque", subtitle: "Gérez vos informations personnelles et préférences" },
  { path: "/settings/banque",        title: "Comptes Bancaires", subtitle: "Gérez vos informations personnelles et préférences" },
  { path: "/settings/notifications", title: "Notifications",     subtitle: "Gérez vos informations personnelles et préférences" },
  { path: "/settings/securite",      title: "Sécurité",          subtitle: "Gérez vos informations personnelles et préférences" },
  { path: "/settings/langue",        title: "Langue & Devise",   subtitle: "Gérez vos informations personnelles et préférences" },
  { path: "/settings", title: "Paramètres", subtitle: "Gérez vos informations personnelles et préférences" },
  { path: "/", title: "Dashboard", subtitle: "Vue d'ensemble de votre activité" },
];

export default function Header() {
  const location = useLocation();
  const { rate } = useExchangeRate();

  const current = pageTitles.find((p) => {
    if (p.path === "/") return location.pathname === "/";
    return location.pathname.startsWith(p.path);
  }) || pageTitles[pageTitles.length - 1];

  return (
    <header className="fixed top-0 right-0 z-20 h-16 flex items-center px-6 border-b border-gray-100 bg-white" style={{ left: "256px" }}>
      {/* Title */}
      <div className="flex-1">
        <h1 className="text-base font-bold text-gray-900 leading-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
          {current.title}
        </h1>
        <p className="text-[11px] text-gray-400 leading-tight">{current.subtitle}</p>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:flex items-center">
          <i className="ri-search-line absolute left-3 text-gray-400 text-sm"></i>
          <input
            type="text"
            placeholder="Rechercher commandes, produits..."
            className="bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-600 outline-none w-56 focus:border-[#125C8D] transition-colors"
            style={{ fontFamily: "'Inter', sans-serif" }}
          />
        </div>

        {/* Exchange Rate Badge — DYNAMIQUE */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-green-200 bg-green-50 whitespace-nowrap">
          <span className="text-[#10B981] text-xs">⊙</span>
          <span className="text-xs font-semibold text-[#10B981]">1 NGN = {rate.toFixed(4)} FCFA</span>
        </div>

        {/* Notifications */}
        <div className="relative cursor-pointer">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors">
            <i className="ri-notification-3-line text-gray-600 text-base"></i>
          </div>
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center" style={{ backgroundColor: "#FF6A00" }}>3</span>
        </div>

        {/* Message icon */}
        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer">
          <i className="ri-message-3-line text-gray-600 text-base"></i>
        </div>

        {/* Hub + Online */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse flex-shrink-0"></span>
          <span className="text-xs font-medium text-gray-600 whitespace-nowrap hidden sm:inline">Lagos Hub · En ligne</span>
        </div>
      </div>
    </header>
  );
}
