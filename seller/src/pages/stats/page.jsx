import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useAuth } from "@/lib/AuthContext";
import { useSellerOrders } from "@/hooks/useSellerOrders";
import { useSellerProducts } from "@/hooks/useSellerProducts";

export default function StatsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { orders } = useSellerOrders(user?.id);
  const { products } = useSellerProducts(user?.id);
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((s, o) => s + (o.amount_ngn || 0), 0);
  const avgOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const totalSold = orders.reduce((s, o) => s + (o.quantity || 1), 0);
  const revenueByMonth = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      const d = new Date(o.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map[key] = (map[key] || 0) + (o.amount_ngn || 0);
    });
    const keys = Object.keys(map).sort().slice(-7);
    return keys.map((k) => ({
      month: k.split("-")[1],
      revenue: map[k],
    }));
  }, [orders]);
  const maxRev = Math.max(...revenueByMonth.map((d) => d.revenue), 1);
  const topProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0))
      .slice(0, 5);
  }, [products]);
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
          Statistiques de ventes
        </h2>
        <p className="text-sm text-gray-400">Historique et performances de vos ventes</p>
      </div>
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Commandes totales", value: totalOrders, icon: "ri-shopping-bag-3-line", color: "#125C8D", bg: "rgba(18,92,141,0.1)" },
          { label: "Produits vendus", value: totalSold, icon: "ri-store-2-line", color: "#10B981", bg: "rgba(16,185,129,0.1)" },
          { label: "Revenus totaux", value: `₦${(totalRevenue / 1000000).toFixed(1)}M`, icon: "ri-money-dollar-circle-line", color: "#125C8D", bg: "rgba(18,92,141,0.1)" },
          { label: "Panier moyen", value: `₦${avgOrder.toLocaleString()}`, icon: "ri-bar-chart-box-line", color: "#FF6A00", bg: "rgba(255,106,0,0.1)" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mb-3" style={{ backgroundColor: kpi.bg }}>
              <i className={`${kpi.icon} text-lg`} style={{ color: kpi.color }}></i>
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">{kpi.label}</p>
            <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
          </div>
        ))}
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Évolution des revenus</h3>
            <p className="text-xs text-gray-400">7 derniers mois</p>
          </div>
          <div className="flex items-end gap-2" style={{ height: "160px" }}>
            {revenueByMonth.map((item, idx) => {
              const h = maxRev > 0 ? (item.revenue / maxRev) * 100 : 0;
              const isLast = idx === revenueByMonth.length - 1;
              return (
                <div key={item.month + idx} className="flex-1 flex flex-col items-center gap-1 h-full group relative">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-semibold px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-10">
                    ₦{(item.revenue / 1000).toFixed(0)}k
                  </div>
                  <div className="flex-1 flex items-end w-full">
                    <div className={`w-full rounded-t-lg transition-all duration-500 ${isLast ? "bg-[#125C8D]" : "bg-[#125C8D]/20"}`} style={{ height: `${h}%`, minHeight: "4px" }}></div>
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">{item.month}</span>
                </div>
              );
            })}
            {revenueByMonth.length === 0 && (
              <p className="text-xs text-gray-400 w-full text-center py-8">Aucune donnée disponible</p>
            )}
          </div>
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">Croissance</p>
              <p className="text-sm font-bold text-[#10B981]">—</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">Moy. mensuelle</p>
              <p className="text-sm font-bold text-gray-900">₦{revenueByMonth.length > 0 ? Math.round(totalRevenue / revenueByMonth.length / 1000) : 0}k</p>
            </div>
          </div>
        </div>
        {/* Conversion rate */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col justify-center">
          <h3 className="text-base font-bold text-gray-900 mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>Taux de conversion</h3>
          <div className="text-center mb-4">
            <p className="text-4xl font-bold text-[#10B981]">
              {totalOrders > 0 ? Math.round((orders.filter(o => o.status === "confirmed").length / totalOrders) * 100) : 0}%
            </p>
            <p className="text-xs text-gray-400 mt-1">Commandes confirmées sans litige</p>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div className="h-3 rounded-full bg-[#10B981]" style={{ width: `${totalOrders > 0 ? (orders.filter(o => o.status === "confirmed").length / totalOrders) * 100 : 0}%` }}></div>
          </div>
          <p className="text-[10px] text-center text-gray-400 mt-3">
            Litiges : {totalOrders > 0 ? Math.round((orders.filter(o => o.status === "disputed").length / totalOrders) * 100) : 0}%
          </p>
        </div>
      </div>
      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent orders */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Dernières commandes</h3>
            <button onClick={() => navigate("/orders")} className="text-[10px] font-semibold text-[#125C8D] hover:underline cursor-pointer whitespace-nowrap">
              Voir toutes
            </button>
          </div>
          <div className="space-y-3">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-[#F9FAFB] rounded-lg cursor-pointer hover:bg-gray-100 transition-all" onClick={() => navigate("/orders")}>
                <div>
                  <p className="text-xs font-semibold text-gray-900">{order.product}</p>
                  <p className="text-[10px] text-gray-400">{order.id} · {order.buyer}</p>
                </div>
                <p className="text-xs font-bold text-[#125C8D] whitespace-nowrap">₦{(order.amount_ngn || 0).toLocaleString()}</p>
              </div>
            ))}
            {orders.length === 0 && <p className="text-xs text-gray-400 text-center py-4">Aucune commande</p>}
          </div>
        </div>
        {/* Top products */}
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Top produits</h3>
            <button onClick={() => navigate("/catalog")} className="text-[10px] font-semibold text-[#125C8D] hover:underline cursor-pointer whitespace-nowrap">
              Voir catalogue
            </button>
          </div>
          <div className="space-y-3">
            {topProducts.map((product, idx) => (
              <div key={product.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F9FAFB] transition-all">
                <span className="text-[10px] font-bold text-gray-300 w-4 text-center flex-shrink-0">#{idx + 1}</span>
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover object-top" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{product.name}</p>
                  <p className="text-[10px] text-gray-400">{(product.sales_count || 0)} vendus</p>
                </div>
                <p className="text-xs font-bold text-[#10B981] whitespace-nowrap flex-shrink-0">₦{(product.price_ngn || 0).toLocaleString()}</p>
              </div>
            ))}
            {topProducts.length === 0 && <p className="text-xs text-gray-400 text-center py-4">Aucun produit</p>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
