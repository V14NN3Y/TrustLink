import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { useExchangeRate } from "@/hooks/useExchangeRate";

const pageTitles = [
  { path: "/catalog/new", title: "Nouveau Produit", subtitle: "Ajoutez un produit à votre catalogue" },
  { path: "/catalog", title: "Catalogue", subtitle: "Gérez vos produits et votre inventaire" },
  { path: "/orders", title: "Commandes", subtitle: "Suivi et gestion des commandes" },
  { path: "/stats", title: "Statistiques de ventes", subtitle: "Historique et performances de vos ventes" },
  { path: "/support", title: "Support & KYC", subtitle: "Assistance et vérification d'identité" },
  { path: "/settings/profile", title: "Mon Profil", subtitle: "Gérez vos informations personnelles et préférences" },
  { path: "/settings/boutique", title: "Boutique & Marque", subtitle: "Gérez vos informations personnelles et préférences" },
  { path: "/settings/banque", title: "Comptes Bancaires", subtitle: "Gérez vos informations personnelles et préférences" },
  { path: "/settings/notifications", title: "Notifications", subtitle: "Gérez vos informations personnelles et préférences" },
  { path: "/settings/securite", title: "Sécurité", subtitle: "Gérez vos informations personnelles et préférences" },
  { path: "/settings/langue", title: "Langue & Devise", subtitle: "Gérez vos informations personnelles et préférences" },
  { path: "/settings", title: "Paramètres", subtitle: "Gérez vos informations personnelles et préférences" },
  { path: "/", title: "Dashboard", subtitle: "Vue d'ensemble de votre activité" },
];

export default function Header() {
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const liveRate = useExchangeRate();
  const { user } = useAuth();
  const [notifCount, setNotifCount] = useState(0);
  useEffect(() => {
    const fetchNotifs = async () => {
      if (!user?.id) return;
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      setNotifications(data || []);
      setNotifCount((data || []).filter(n => !n.is_read).length);
    };
    fetchNotifs();
    // Temps réel (optionnel mais propre)
    const channel = supabase
      .channel('seller-notifications')
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, fetchNotifs)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

        {/* Exchange Rate Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-green-200 bg-green-50 whitespace-nowrap">
          <span className="text-[#10B981] text-xs">⊙</span>
          <span className="text-xs font-semibold text-[#10B981]">1 NGN = {liveRate.toFixed(2)} FCFA</span>
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <div
            onClick={() => setNotifOpen(!notifOpen)}
            className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer relative"
          >
            <i className="ri-notification-3-line text-gray-600 text-base"></i>
            {notifCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center" style={{ backgroundColor: "#FF6A00" }}>
                {notifCount > 9 ? "9+" : notifCount}
              </span>
            )}
          </div>
          {/* Dropdown */}
          {notifOpen && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-xl border border-gray-100 shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-bold text-gray-900">Notifications récentes</p>
                {notifCount > 0 && (
                  <button
                    onClick={async () => {
                      await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
                      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                      setNotifCount(0);
                    }}
                    className="text-[10px] font-semibold text-[#125C8D] hover:underline cursor-pointer whitespace-nowrap"
                  >
                    Tout marquer comme lus
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-6">Aucune notification pour le moment</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0 ${!n.is_read ? "bg-[#125C8D]/3" : ""}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${!n.is_read ? "bg-[#125C8D]/10" : "bg-gray-100"}`}>
                        <i className={`${n.type === 'new_order' ? 'ri-shopping-bag-3-line' : n.type === 'order_update' ? 'ri-truck-line' : 'ri-notification-3-line'} text-sm ${!n.is_read ? "text-[#125C8D]" : "text-gray-400"}`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-xs ${!n.is_read ? "font-bold text-gray-900" : "text-gray-600"}`}>{n.title}</p>
                          <span className="text-[10px] text-gray-300 whitespace-nowrap">{new Date(n.created_at).toLocaleDateString("fr-FR")}</span>
                        </div>
                        {n.body && <p className="text-[10px] text-gray-400 mt-0.5">{n.body}</p>}
                        {!n.is_read && (
                          <div className="flex items-center gap-2 mt-1.5">
                            <button
                              onClick={async () => {
                                await supabase.from("notifications").update({ is_read: true }).eq("id", n.id);
                                setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, is_read: true } : x));
                                setNotifCount(prev => Math.max(0, prev - 1));
                              }}
                              className="text-[10px] font-semibold text-[#125C8D] hover:underline cursor-pointer whitespace-nowrap"
                            >
                              Marquer comme lu
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="border-t border-gray-100 px-4 py-2 text-center">
                <button
                  onClick={() => { setNotifOpen(false); navigate("/notifications"); }}
                  className="text-xs font-semibold text-[#125C8D] hover:underline cursor-pointer whitespace-nowrap"
                >
                  Voir tout
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Message icon */}
        <div
          onClick={() => navigate("/messages")}
          className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer"
        >
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
