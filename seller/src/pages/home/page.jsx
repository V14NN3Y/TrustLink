import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import RevenueChart from "./components/RevenueChart";
import WalletWidget from "./components/WalletWidget";
import LogisticsAlerts from "./components/LogisticsAlerts";
import TopProducts from "./components/TopProducts";
import { mockStats } from "@/mocks/seller";
import {
  getDispatchesForSeller,
  getSharedOrders,
} from "@/lib/sharedStorage";
import { useExchangeRate } from "@/hooks/useExchangeRate";

const SELLER_ID = "adebayo-fashions";

const now = new Date();
const hour = now.getHours();
const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

export default function Home() {
  const navigate = useNavigate();
  const { rate } = useExchangeRate();
  const [pendingDispatchCount, setPendingDispatchCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      const dispatches = getDispatchesForSeller(SELLER_ID);
      const sharedOrders = getSharedOrders();
      const pending = dispatches.filter((d) => {
        const order = sharedOrders.find((o) => o.id === d.order_id);
        return order?.status === "dispatched_to_seller";
      });
      setPendingDispatchCount(pending.length);
    };
    updateCount();
    window.addEventListener("tl_storage_update", updateCount);
    return () => window.removeEventListener("tl_storage_update", updateCount);
  }, []);

  // Prix acheteur simulé avec taux dynamique : ₦50,000 * 1.075 * rate
  const simulatedFcfa = Math.round(50000 * 1.075 * rate);

  const kpiCards = [
    {
      icon: "ri-money-dollar-circle-line",
      iconColor: "#10B981",
      iconBg: "rgba(16,185,129,0.1)",
      badge: "+18.4%",
      badgeColor: "#10B981",
      label: "Ventes Totales (NGN)",
      value: "₦4,820,500",
    },
    {
      icon: "ri-inbox-line",
      iconColor: "#FF6A00",
      iconBg: "rgba(255,106,0,0.1)",
      badge: "+7 aujourd'hui",
      badgeColor: "#FF6A00",
      label: "Commandes à Expédier",
      value: "34",
    },
    {
      icon: "ri-bank-card-line",
      iconColor: "#125C8D",
      iconBg: "rgba(18,92,141,0.1)",
      badge: `+₦320,000 ce mois`,
      badgeColor: "#10B981",
      label: "Solde Disponible (NGN)",
      value: "₦1,245,000",
    },
    {
      icon: "ri-lock-2-line",
      iconColor: "#8B5CF6",
      iconBg: "rgba(139,92,246,0.1)",
      badge: "12 commandes",
      badgeColor: "#8B5CF6",
      label: "Fonds en Attente",
      value: "₦890,200",
    },
  ];

  return (
    <DashboardLayout>
      {/* Greeting + CTA */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {greeting}, <span style={{ color: "#125C8D" }}>Adebayo Fashions</span> 👋
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Voici un aperçu de votre activité aujourd'hui — 25 Avril 2026
          </p>
        </div>
        <button
          onClick={() => navigate("/catalog/new")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white whitespace-nowrap hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "#125C8D" }}
        >
          <i className="ri-add-line text-base"></i>
          Nouveau Produit
        </button>
      </div>

      {/* Bannière dispatches en attente */}
      {pendingDispatchCount > 0 && (
        <div
          onClick={() => navigate("/orders")}
          className="mb-4 flex items-center gap-3 rounded-xl px-4 py-3 border border-[#125C8D]/20 bg-[#125C8D]/5 cursor-pointer hover:bg-[#125C8D]/10 transition-colors"
        >
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#125C8D]/10">
              <i className="ri-send-plane-line text-[#125C8D] text-base"></i>
            </div>
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] font-bold" style={{ backgroundColor: "#FF6A00" }}>
              {pendingDispatchCount}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-[#125C8D] text-sm font-semibold">
              {pendingDispatchCount} commande{pendingDispatchCount > 1 ? "s" : ""} dispatched par l'Admin — confirmation requise
            </p>
            <p className="text-gray-400 text-xs">
              Cliquez pour voir et confirmer les commandes assignées à votre boutique
            </p>
          </div>
          <i className="ri-arrow-right-line text-gray-400 text-sm flex-shrink-0"></i>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpiCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: card.iconBg }}>
                <i className={`${card.icon} text-lg`} style={{ color: card.iconColor }}></i>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-md" style={{ color: card.badgeColor, backgroundColor: `${card.badgeColor}15` }}>
                {card.badge}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-medium mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Chart + Wallet Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div>
          <WalletWidget />
        </div>
      </div>

      {/* Alerts + Top Products + Exchange Rate Live */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LogisticsAlerts />
        <TopProducts />

        {/* Taux de Change Live — DYNAMIQUE */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-gray-900 font-bold text-base mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Taux de Change Live
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-[#F9FAFB] rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-lg">🇳🇬</span>
                <div>
                  <p className="text-gray-800 text-sm font-semibold">NGN → FCFA</p>
                  <p className="text-gray-400 text-xs">Naira → Franc CFA</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[#10B981] font-bold text-base">× {rate.toFixed(4)}</p>
                <p className="text-gray-400 text-xs">1 FCFA = {(1 / rate).toFixed(2)} NGN</p>
              </div>
            </div>

            <div className="p-3 bg-[#125C8D]/5 rounded-lg border border-[#125C8D]/10">
              <p className="text-gray-500 text-xs mb-2">Simulation de prix</p>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <p className="text-gray-400 text-xs mb-1">Prix vendeur (NGN)</p>
                  <p className="text-gray-900 font-bold">₦50,000</p>
                </div>
                <i className="ri-arrow-right-line text-gray-400"></i>
                <div className="flex-1 text-right">
                  <p className="text-gray-400 text-xs mb-1">Prix acheteur (FCFA)</p>
                  <p className="text-[#10B981] font-bold">FCFA {simulatedFcfa.toLocaleString("fr-FR")}</p>
                </div>
              </div>
              <p className="text-gray-400 text-xs mt-2">Inclut : commission 5% + frais change 2.5%</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-[#10B981]/5 rounded-lg text-center">
                <p className="text-[#10B981] font-bold text-lg">{mockStats.conversion_rate}%</p>
                <p className="text-gray-400 text-xs">Taux livraison</p>
              </div>
              <div className="p-3 bg-[#FF6A00]/5 rounded-lg text-center">
                <p className="text-[#FF6A00] font-bold text-lg">{mockStats.dispute_rate}%</p>
                <p className="text-gray-400 text-xs">Litiges</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
