import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { useCurrency } from "@/hooks/useCurrency";
import { useSidebar } from "@/lib/SidebarContext";
import { useLocale } from "@/lib/i18n";

export default function Header() {
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const liveRate = useExchangeRate();
  const { currency, setCurrency } = useCurrency();
  const { user, profile } = useAuth();
  const [notifCount, setNotifCount] = useState(0);
  const { toggle: toggleSidebar } = useSidebar();
  const { locale, setLocale, t } = useLocale();

  const pageTitles = [
    { path: "/catalog/new", title: t("pages.newProduct.title"), subtitle: t("pages.newProduct.sub") },
    { path: "/catalog", title: t("pages.catalog.title"), subtitle: t("pages.catalog.sub") },
    { path: "/orders", title: t("pages.orders.title"), subtitle: t("pages.orders.sub") },
    { path: "/stats", title: t("pages.stats.title"), subtitle: t("pages.stats.sub") },
    { path: "/support", title: t("pages.support.title"), subtitle: t("pages.support.sub") },
    { path: "/messages", title: t("pages.messages.title"), subtitle: t("pages.messages.sub") },
    { path: "/reviews", title: t("pages.reviews.title"), subtitle: t("pages.reviews.sub") },
    { path: "/notifications", title: t("pages.notifications.title"), subtitle: t("pages.notifications.sub") },
    { path: "/settings/profile", title: t("pages.profile.title"), subtitle: t("pages.profile.sub") },
    { path: "/settings/boutique", title: t("pages.boutique.title"), subtitle: t("pages.boutique.sub") },
    { path: "/settings/notifications", title: t("pages.settingsNotifs.title"), subtitle: t("pages.settingsNotifs.sub") },
    { path: "/settings/securite", title: t("pages.securite.title"), subtitle: t("pages.securite.sub") },
    { path: "/settings/langue", title: t("pages.langue.title"), subtitle: t("pages.langue.sub") },
    { path: "/settings", title: t("pages.settings.title"), subtitle: t("pages.settings.sub") },
    { path: "/activity", title: t("pages.activity.title"), subtitle: t("pages.activity.sub") },
    { path: "/help", title: t("pages.help.title"), subtitle: t("pages.help.sub") },
    { path: "/questions", title: t("pages.questions.title"), subtitle: t("pages.questions.sub") },
    { path: "/", title: t("pages.dashboard.title"), subtitle: t("pages.dashboard.sub") },
  ];

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
    const channel = supabase
      .channel(`seller-notifications-${user?.id}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "notifications",
        filter: `user_id=eq.${user?.id}`,
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

  const current = [...pageTitles].sort((a, b) => b.path.length - a.path.length).find((p) => {
    if (p.path === "/") return location.pathname === "/";
    return location.pathname.startsWith(p.path);
  }) || pageTitles[pageTitles.length - 1];

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 z-20 h-16 flex items-center px-4 md:px-6 border-b border-gray-100 bg-white gap-3">
      {/* Hamburger - mobile only */}
      <button
        onClick={toggleSidebar}
        className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
      >
        <i className="ri-menu-line text-lg"></i>
      </button>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-bold text-gray-900 leading-tight truncate" style={{ fontFamily: "'Poppins', sans-serif" }}>
          {current.title}
        </h1>
        <p className="text-[11px] text-gray-400 leading-tight hidden sm:block">{current.subtitle}</p>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Currency Toggle */}
        <div className="hidden md:flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
          <button onClick={() => setCurrency("NGN")}
            className={`px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${currency === "NGN" ? "bg-[#10B981] text-white" : "text-gray-500 hover:text-gray-700"}`}>
            NGN
          </button>
          <button onClick={() => setCurrency("XOF")}
            className={`px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${currency === "XOF" ? "bg-[#10B981] text-white" : "text-gray-500 hover:text-gray-700"}`}>
            FCFA
          </button>
        </div>

        {/* Language Toggle */}
        <div className="hidden md:flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
          <button onClick={() => setLocale("fr")}
            className={`px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${locale === "fr" ? "bg-[#125C8D] text-white" : "text-gray-500 hover:text-gray-700"}`}>
            FR
          </button>
          <button onClick={() => setLocale("en")}
            className={`px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${locale === "en" ? "bg-[#125C8D] text-white" : "text-gray-500 hover:text-gray-700"}`}>
            EN
          </button>
        </div>

        {/* Exchange Rate Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-green-200 bg-green-50 whitespace-nowrap">
          <span className="text-[#10B981] text-xs">⊙</span>
          <span className="text-xs font-semibold text-[#10B981]">1 NGN = {liveRate ? liveRate.toFixed(2) : "..."} FCFA</span>
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
          {notifOpen && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-xl border border-gray-100 shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-bold text-gray-900">{t("notifications.recent")}</p>
                {notifCount > 0 && (
                  <button
                    onClick={async () => {
                      await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
                      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                      setNotifCount(0);
                    }}
                    className="text-[10px] font-semibold text-[#125C8D] hover:underline cursor-pointer whitespace-nowrap"
                  >
                    {t("notifications.markAllAsRead")}
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-6">{t("notifications.noNotifications")}</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0 ${!n.is_read ? "bg-[#125C8D]/[0.03]" : ""}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${!n.is_read ? "bg-[#125C8D]/10" : "bg-gray-100"}`}>
                        <i className={`${n.type === "new_order" ? "ri-shopping-bag-3-line" : n.type === "order_update" ? "ri-truck-line" : n.type === "dispatch_ready" ? "ri-send-plane-line" : n.type === "security_alert" ? "ri-shield-line" : "ri-notification-3-line"} text-sm ${!n.is_read ? "text-[#125C8D]" : "text-gray-400"}`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-xs ${!n.is_read ? "font-bold text-gray-900" : "text-gray-600"}`}>{n.title}</p>
                          <span className="text-[10px] text-gray-300 whitespace-nowrap">{new Date(n.created_at).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-GB")}</span>
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
                              {t("notifications.markRead")}
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
                  {t("notifications.viewAll")}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Hub + Online */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse flex-shrink-0"></span>
          <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
            {profile?.default_city || "Hub"} · {t("header.online")}
          </span>
        </div>
      </div>
    </header>
  );
}
