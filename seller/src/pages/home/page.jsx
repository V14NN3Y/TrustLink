import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { useSellerOrders } from "@/hooks/useSellerOrders";
import { useSellerProducts } from "@/hooks/useSellerProducts";
import { useLowStock } from "@/hooks/useLowStock";
import { useProductPerformance } from "@/hooks/useProductPerformance";
import DashboardLayout from "@/components/feature/DashboardLayout";
import OnboardingChecklist from "@/components/feature/OnboardingChecklist";
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
  const { lowStock } = useLowStock(user?.id);
  const { products: perfProducts } = useProductPerformance(user?.id);
  const [disputeCount, setDisputeCount] = useState(0);
  const [videoCount, setVideoCount] = useState(0);

  useEffect(() => {
    if (!user?.id) return;
    supabase.from("order_items").select("order_id").eq("seller_id", user.id).then(({ data: items }) => {
      if (!items?.length) return;
      const oids = [...new Set(items.map(i => i.order_id))];
      supabase.from("disputes").select("id", { count: "exact", head: true }).in("order_id", oids).then(({ count }) => setDisputeCount(count || 0));
      supabase.from("delivery_videos").select("id", { count: "exact", head: true }).in("order_id", oids).then(({ count }) => setVideoCount(count || 0));
    });
  }, [user]);
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
      value: approvedProducts.toString(),
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
      <OnboardingChecklist />
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
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900">Vidéos de déballage</h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: "#125C8D" }}>{videoCount}</span>
          </div>
          <p className="text-xs text-gray-400 mb-3">Vidéos soumises par les acheteurs pour vos produits</p>
          <button onClick={() => navigate("/orders")} className="text-xs font-semibold text-[#125C8D] hover:underline cursor-pointer">
            Voir dans les commandes →
          </button>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900">Litiges</h3>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${disputeCount > 0 ? 'text-red-600 bg-red-50' : 'text-gray-400 bg-gray-100'}`}>
              {disputeCount > 0 ? `${disputeCount} ouvert${disputeCount > 1 ? 's' : ''}` : 'Aucun'}
            </span>
          </div>
          <p className="text-xs text-gray-400 mb-3">Litiges ouverts sur vos commandes</p>
          <button onClick={() => navigate("/orders")} className="text-xs font-semibold text-[#125C8D] hover:underline cursor-pointer">
            Voir dans les commandes →
          </button>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900">Stock faible</h3>
            {lowStock.length > 0 && <span className="text-xs font-bold px-2 py-0.5 rounded-full text-amber-600 bg-amber-50">{lowStock.length} produit(s)</span>}
          </div>
          {lowStock.length === 0 ? (
            <p className="text-xs text-gray-400 mb-3">Tous vos produits ont un stock suffisant</p>
          ) : (
            <div className="space-y-2 mb-3">
              {lowStock.slice(0, 4).map(p => (
                <div key={p.id} className="flex items-center justify-between text-xs">
                  <span className="text-gray-700 truncate flex-1">{p.name}</span>
                  <span className="text-red-500 font-semibold ml-2">{p.stock_quantity} unité{p.stock_quantity > 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => navigate("/catalog")} className="text-xs font-semibold text-[#125C8D] hover:underline cursor-pointer">
            Gérer le catalogue →
          </button>
        </div>
      </div>
      {perfProducts.length > 0 && (
        <div className="mt-4 bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Performance des produits</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-50 text-gray-400">
                  <th className="text-left px-5 py-3 font-semibold">Produit</th>
                  <th className="text-center px-3 py-3 font-semibold">Vues</th>
                  <th className="text-center px-3 py-3 font-semibold">Ventes</th>
                  <th className="text-center px-3 py-3 font-semibold">Conversion</th>
                  <th className="text-center px-3 py-3 font-semibold">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {perfProducts.slice(0, 5).map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-800 font-medium">{p.name}</td>
                    <td className="text-center px-3 py-3 text-gray-600">{p.views}</td>
                    <td className="text-center px-3 py-3 text-gray-600">{p.sales}</td>
                    <td className="text-center px-3 py-3">
                      <span className={`font-semibold ${p.conversion >= 10 ? 'text-green-600' : p.conversion >= 5 ? 'text-amber-600' : 'text-gray-500'}`}>
                        {p.conversion}%
                      </span>
                    </td>
                    <td className="text-center px-3 py-3">
                      <span className={`font-semibold ${p.stock <= 5 ? 'text-red-500' : 'text-gray-600'}`}>{p.stock}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
