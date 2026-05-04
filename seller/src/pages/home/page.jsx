import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { useSellerOrders } from "@/hooks/useSellerOrders";
import { useSellerProducts } from "@/hooks/useSellerProducts";
import DashboardLayout from "@/components/feature/DashboardLayout";
import RevenueChart from "./components/RevenueChart";
import SalesQuickWidget from "./components/SalesQuickWidget";
import LogisticsAlerts from "./components/LogisticsAlerts";
import TopProducts from "./components/TopProducts";
import ExchangeRate from "./components/ExchangeRate";
import RecentOrders from "./components/RecentOrders";

export default function Home() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { orders } = useSellerOrders(user?.id);
  const { products } = useSellerProducts(user?.id);
  const toShip = orders.filter((o) => o.status === "paid" || o.status === "processing").length;
  const delivered = orders.filter((o) => o.status === "delivered" || o.status === "confirmed").length;
  const totalRevenue = orders.reduce((s, o) => s + (o.amount_ngn || 0), 0);
  const approvedProducts = products.filter((p) => p.status === "approved").length;
  const kpiCards = [
    {
      icon: "ri-money-dollar-circle-line",
      iconColor: "#10B981",
      iconBg: "rgba(16,185,129,0.1)",
      badge: `${orders.length} total`,
      badgeColor: "#10B981",
      label: "Commandes reçues",
      value: orders.length.toString(),
    },
    {
      icon: "ri-inbox-line",
      iconColor: "#FF6A00",
      iconBg: "rgba(255,106,0,0.1)",
      badge: `${toShip} à traiter`,
      badgeColor: "#FF6A00",
      label: "En cours de traitement",
      value: toShip.toString(),
    },
    {
      icon: "ri-store-2-line",
      iconColor: "#125C8D",
      iconBg: "rgba(18,92,141,0.1)",
      badge: `${approvedProducts} actifs`,
      badgeColor: "#125C8D",
      label: "Produits approuvés",
      value: products.length.toString(),
    },
    {
      icon: "ri-bar-chart-line",
      iconColor: "#125C8D",
      iconBg: "rgba(18,92,141,0.1)",
      badge: `${delivered} livrées`,
      badgeColor: "#10B981",
      label: "Revenus estimés (NGN)",
      value: `₦${totalRevenue.toLocaleString()}`,
    },
  ];
  return (
    <DashboardLayout>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Bonjour, <span style={{ color: "#125C8D" }}>{profile?.business_name || "Vendeur"}</span>
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Voici un aperçu de votre activité
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2">
          <RevenueChart orders={orders} />
        </div>
        <div>
          <SalesQuickWidget orders={orders} />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LogisticsAlerts orders={orders} />
        <TopProducts products={products} />
        <ExchangeRate />
      </div>
      <div className="mt-4">
        <RecentOrders orders={orders.slice(0, 6)} />
      </div>
    </DashboardLayout>
  );
}
