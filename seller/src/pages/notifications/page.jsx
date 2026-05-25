import { useState, useEffect } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { useLocale } from "@/lib/i18n";

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const { t, locale } = useLocale();

  useEffect(() => {
    if (!user?.id) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setNotifications(data || []);
      setLoading(false);
    };
    fetch();
    const channel = supabase
      .channel("notifications-page")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, fetch)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const markAsRead = async (id) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllAsRead = async () => {
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const filtered = filter === "unread" ? notifications.filter(n => !n.is_read) : notifications;
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const typeIcon = (type) => {
    switch (type) {
      case "new_order": return "ri-shopping-bag-3-line";
      case "order_update": return "ri-truck-line";
      case "dispatch_ready": return "ri-send-plane-line";
      case "product_approved": return "ri-check-line";
      case "product_rejected": return "ri-close-circle-line";
      case "security_alert": return "ri-shield-line";
      case "dispute_update": return "ri-scales-line";
      default: return "ri-notification-3-line";
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
          {t("notifications.title")}
        </h2>
        <p className="text-sm text-gray-400">
          {unreadCount} {unreadCount > 1 ? t("notifications.unreadPlural") : t("notifications.unread")} {t("notifications.on")} {notifications.length} {t("notifications.total")}
        </p>
      </div>

      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {[
            { key: "all", label: t("notifications.allTab") },
            { key: "unread", label: t("notifications.unreadTab") },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filter === tab.key ? "bg-white text-[#125C8D] shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs font-semibold text-[#125C8D] hover:underline cursor-pointer whitespace-nowrap"
          >
            {t("notifications.markAllRead")}
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-[#125C8D] rounded-full animate-spin"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <i className="ri-notification-off-line text-3xl mb-2 block"></i>
            <p className="text-sm">
              {filter === "unread" ? t("notifications.noUnread") : t("notifications.noNotifications")}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-4 px-5 py-4 hover:bg-[#F9FAFB] transition-all ${!n.is_read ? "bg-[#125C8D]/[0.03]" : ""}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${!n.is_read ? "bg-[#125C8D]/10" : "bg-gray-100"}`}>
                  <i className={`${typeIcon(n.type)} text-base ${!n.is_read ? "text-[#125C8D]" : "text-gray-400"}`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm ${!n.is_read ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
                      {n.title}
                    </p>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                      {new Date(n.created_at).toLocaleDateString(locale === "en" ? "en-GB" : "fr-FR", {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {n.body && <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>}
                  {!n.is_read && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="text-[10px] font-semibold text-[#125C8D] hover:underline mt-2 cursor-pointer whitespace-nowrap"
                    >
                      {t("notifications.markRead")}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
