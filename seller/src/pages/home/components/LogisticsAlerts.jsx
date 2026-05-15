import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

const alertConfig = {
  critical: {
    bg: "bg-[#FF6A00]/8",
    border: "border-[#FF6A00]/30",
    icon: "ri-alarm-warning-line",
    iconColor: "text-[#FF6A00]",
    badgeBg: "#FF6A00",
    badgeColor: "#fff",
    label: "Critique",
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: "ri-error-warning-line",
    iconColor: "text-amber-500",
    badgeBg: "#FEF3C7",
    badgeColor: "#92400E",
    label: "Attention",
  },
  info: {
    bg: "bg-[#125C8D]/5",
    border: "border-[#125C8D]/20",
    icon: "ri-information-line",
    iconColor: "text-[#125C8D]",
    badgeBg: "rgba(18,92,141,0.1)",
    badgeColor: "#125C8D",
    label: "Info",
  },
};
export default function LogisticsAlerts({ orders = [] }) {
  const navigate = useNavigate();
  const [dispatchAlerts, setDispatchAlerts] = useState([]);

  useEffect(() => {
    supabase.from("dispatches").select("dispatch_code, status, driver_name, created_at").order("created_at", { ascending: false }).limit(5).then(({ data }) => {
      if (data) {
        setDispatchAlerts(data.map((d) => ({
          id: d.dispatch_code,
          order_id: d.dispatch_code,
          type: d.status === "in_transit" ? "info" : d.status === "cancelled" ? "critical" : "warning",
          message: `Voyage ${d.dispatch_code} — ${d.status === "preparing" ? "En préparation" : d.status === "in_transit" ? "En transit" : d.status === "delivered" ? "Livré" : "Annulé"}${d.driver_name ? ` (${d.driver_name})` : ""}`,
          deadline: new Date(d.created_at).toLocaleDateString("fr-FR"),
        })));
      }
    });
  }, []);

  const orderAlerts = orders
    .filter((o) => o.status === "processing" || o.status === "paid" || o.status === "in_transit")
    .slice(0, 3)
    .map((o) => ({
      id: o.items?.[0]?.item_id || o.id,
      order_id: o.id,
      type: o.status === "paid" ? "info" : o.status === "in_transit" ? "info" : "warning",
      message: o.status === "paid"
        ? `Commande ${o.id} — En attente de traitement`
        : o.status === "in_transit"
        ? `Commande ${o.id} — En transit`
        : `Commande ${o.id} — En cours de préparation`,
      deadline: new Date(o.created_at).toLocaleDateString("fr-FR"),
    }));

  const alerts = [...dispatchAlerts, ...orderAlerts].slice(0, 6);
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Alertes logistiques</h3>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white whitespace-nowrap" style={{ backgroundColor: "#FF6A00" }}>
          {alerts.length}
        </span>
      </div>
      <div className="space-y-3">
        {alerts.map((alert) => {
          const cfg = alertConfig[alert.type];
          return (
            <div
              key={alert.id}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:opacity-90 transition-all ${cfg.bg} ${cfg.border}`}
              onClick={() => navigate("/orders")}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                <i className={`${cfg.icon} text-base ${cfg.iconColor}`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono text-xs font-bold text-gray-700">{alert.order_id}</span>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap"
                    style={{ backgroundColor: cfg.badgeBg, color: cfg.badgeColor }}
                  >
                    {cfg.label}
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-tight">{alert.message}</p>
                {alert.deadline && (
                  <p className="text-[10px] text-gray-400 mt-1">
                    <i className="ri-time-line mr-0.5"></i>Date : {alert.deadline}
                  </p>
                )}
              </div>
              <i className="ri-arrow-right-s-line text-gray-400 flex-shrink-0"></i>
            </div>
          );
        })}
        {alerts.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">Aucune alerte active</p>
        )}
      </div>
    </div>
  );
}
