import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import RevenueChart from "./components/RevenueChart";
import WalletWidget from "./components/WalletWidget";
import LogisticsAlerts from "./components/LogisticsAlerts";
import TopProducts from "./components/TopProducts";
import ExchangeRate from "./components/ExchangeRate";
import { mockStats } from "@/mocks/seller";

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
    badge: "+₦320,000 ce mois",
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

export default function Home() {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      {/* Greeting + CTA */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Bonjour, <span style={{ color: "#125C8D" }}>Adebayo Fashions</span> 👋
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Voici un aperçu de votre activité aujourd'hui — 20 Avril 2026
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpiCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: card.iconBg }}>
                <i className={`${card.icon} text-lg`} style={{ color: card.iconColor }}></i>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-md" style={{ color: card.badgeColor, backgroundColor: `${card.badgeColor}15` }}>
                {card.badge.includes("+") || card.badge.includes("₦") ? (
                  <><i className="ri-arrow-up-line mr-0.5"></i>{card.badge.replace("+","")}</>
                ) : card.badge}
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

      {/* Alerts + Top Products + Exchange Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LogisticsAlerts />
        <TopProducts />
        <ExchangeRate />
      </div>
    </DashboardLayout>
  );
}
