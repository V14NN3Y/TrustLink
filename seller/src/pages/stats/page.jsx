import { useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from "recharts";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { useAuth } from "@/lib/AuthContext";
import { useSellerOrders } from "@/hooks/useSellerOrders";
import { useSellerProducts } from "@/hooks/useSellerProducts";
import { useProductPerformance } from "@/hooks/useProductPerformance";
import { useLowStock } from "@/hooks/useLowStock";

const COLORS = ["#125C8D", "#10B981", "#FF6A00", "#F59E0B", "#EF4444", "#8B5CF6"];

function formatNgn(amount) {
  return `₦${(amount / 1000).toFixed(0)}k`;
}

export default function StatsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { orders } = useSellerOrders(user?.id);
  const { products } = useSellerProducts(user?.id);
  const { products: perfProducts } = useProductPerformance(user?.id);
  const { lowStock } = useLowStock(user?.id, 5);
  const [sortField, setSortField] = useState("sales");
  const [sortDir, setSortDir] = useState("desc");

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((s, o) => s + (o.amount_ngn || 0), 0);
  const avgOrder = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const totalSold = orders.reduce((s, o) => s + (o.items?.reduce((sum, item) => sum + (item.qty || 0), 0) || 0), 0);
  const confirmedOrders = orders.filter(o => o.status === "confirmed");
  const conversionRate = totalOrders > 0 ? Math.round((confirmedOrders.length / totalOrders) * 100) : 0;
  const disputeRate = totalOrders > 0 ? Math.round((orders.filter(o => o.status === "disputed").length / totalOrders) * 100) : 0;

  const revenueByMonth = useMemo(() => {
    const map = {};
    orders.forEach((o) => {
      const d = new Date(o.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map[key] = (map[key] || 0) + (o.amount_ngn || 0);
    });
    const keys = Object.keys(map).sort().slice(-12);
    return keys.map((k) => ({
      month: k.split("-")[1],
      year: k.split("-")[0],
      full: k,
      revenue: map[k],
    }));
  }, [orders]);

  const orderStatusDist = useMemo(() => {
    const statusCounts = {};
    orders.forEach(o => {
      const s = o.status || "unknown";
      statusCounts[s] = (statusCounts[s] || 0) + 1;
    });
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  }, [orders]);

  const topProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0))
      .slice(0, 5);
  }, [products]);

  const sortedPerf = useMemo(() => {
    return [...perfProducts].sort((a, b) => {
      const mul = sortDir === "desc" ? -1 : 1;
      if (sortField === "name") return mul * a.name.localeCompare(b.name);
      return mul * ((b[sortField] || 0) - (a[sortField] || 0));
    });
  }, [perfProducts, sortField, sortDir]);

  const toggleSort = useCallback((field) => {
    setSortField(prev => {
      if (prev === field) {
        setSortDir(d => d === "desc" ? "asc" : "desc");
        return prev;
      }
      setSortDir("desc");
      return field;
    });
  }, []);

  const exportCSV = useCallback(() => {
    const headers = ["Mois", "Revenus (NGN)", "Commandes", "Confirmées", "Annulées", "Litiges", "Taux conversion (%)"];
    const monthMap = {};
    orders.forEach((o) => {
      const d = new Date(o.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!monthMap[key]) monthMap[key] = { revenue: 0, total: 0, confirmed: 0, cancelled: 0, disputed: 0 };
      monthMap[key].revenue += o.amount_ngn || 0;
      monthMap[key].total += 1;
      if (o.status === "confirmed") monthMap[key].confirmed += 1;
      if (o.status === "cancelled") monthMap[key].cancelled += 1;
      if (o.status === "disputed") monthMap[key].disputed += 1;
    });
    const rows = Object.entries(monthMap).sort(([a], [b]) => a.localeCompare(b)).map(([month, d]) => {
      const conv = d.total > 0 ? Math.round((d.confirmed / d.total) * 100) : 0;
      return `"${month}","${d.revenue}","${d.total}","${d.confirmed}","${d.cancelled}","${d.disputed}","${conv}"`;
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "trustlink_stats.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [orders]);

  const SortHeader = ({ field, label }) => (
    <th className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 py-2 text-left cursor-pointer hover:text-gray-600 select-none" onClick={() => toggleSort(field)}>
      {label} {sortField === field ? (sortDir === "desc" ? "↓" : "↑") : ""}
    </th>
  );

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Statistiques de ventes
          </h2>
          <p className="text-sm text-gray-400">Historique et performances de vos ventes</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 text-xs font-semibold text-white bg-[#125C8D] hover:bg-[#125C8D]/90 px-4 py-2 rounded-lg transition-all cursor-pointer">
          <i className="ri-file-download-line"></i>
          Export CSV
        </button>
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Évolution des revenus</h3>
            <p className="text-xs text-gray-400">12 derniers mois</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueByMonth}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#125C8D" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#125C8D" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={50} />
              <Tooltip formatter={(v) => [`₦${Number(v).toLocaleString()}`, "Revenus"]} labelFormatter={(l, p) => p?.[0]?.payload?.full || l} contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="#125C8D" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">Croissance</p>
              <p className="text-sm font-bold text-[#10B981]">0%</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">Moy. mensuelle</p>
              <p className="text-sm font-bold text-gray-900">₦{revenueByMonth.length > 0 ? Math.round(totalRevenue / revenueByMonth.length / 1000) : 0}k</p>
            </div>
          </div>
        </div>

        {/* Conversion / Order Status */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col justify-center">
          <h3 className="text-base font-bold text-gray-900 mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>Taux de conversion</h3>
          <div className="text-center mb-4">
            <p className="text-4xl font-bold text-[#10B981]">{conversionRate}%</p>
            <p className="text-xs text-gray-400 mt-1">Commandes confirmées sans litige</p>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div className="h-3 rounded-full bg-[#10B981]" style={{ width: `${conversionRate}%` }}></div>
          </div>
          <p className="text-[10px] text-center text-gray-400 mt-3">
            Litiges : {disputeRate}%
          </p>
        </div>
      </div>

      {/* Order Status Distribution + Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-base font-bold text-gray-900 mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>Statut des commandes</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={orderStatusDist} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {orderStatusDist.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {orderStatusDist.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-[10px] text-gray-500 capitalize">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
          <h3 className="text-base font-bold text-gray-900 mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>Répartition des statuts</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={orderStatusDist}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} width={40} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {orderStatusDist.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStock.length > 0 && (
        <div className="bg-white rounded-xl border border-amber-200 p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <i className="ri-alert-line text-amber-500"></i>
            <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Stock faible ({lowStock.length})</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {lowStock.map(p => (
              <div key={p.id} className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-900 truncate">{p.name}</p>
                <p className="text-[10px] text-gray-400">Stock: <span className="font-bold text-amber-600">{p.stock_quantity}</span></p>
                <p className="text-[10px] text-gray-400">{p.status === "pending_review" ? "En attente" : "Approuvé"}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Performance Table */}
      <div className="grid grid-cols-1 gap-4 mb-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Performance des produits</h3>
            <p className="text-xs text-gray-400">{perfProducts.length} produits</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <SortHeader field="name" label="Produit" />
                  <SortHeader field="price" label="Prix" />
                  <SortHeader field="views" label="Vues" />
                  <SortHeader field="sales" label="Ventes" />
                  <SortHeader field="conversion" label="Conversion" />
                  <SortHeader field="stock" label="Stock" />
                  <th className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 py-2 text-left">Statut</th>
                </tr>
              </thead>
              <tbody>
                {sortedPerf.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-[#F9FAFB] transition-all">
                    <td className="text-xs font-semibold text-gray-900 px-3 py-3">{p.name}</td>
                    <td className="text-xs text-gray-600 px-3 py-3">₦{Number(p.price).toLocaleString()}</td>
                    <td className="text-xs text-gray-600 px-3 py-3">{p.views}</td>
                    <td className="text-xs font-semibold text-gray-900 px-3 py-3">{p.sales}</td>
                    <td className="text-xs px-3 py-3">
                      <span className={`font-semibold ${p.conversion >= 10 ? "text-[#10B981]" : p.conversion >= 5 ? "text-[#F59E0B]" : "text-gray-400"}`}>
                        {p.conversion}%
                      </span>
                    </td>
                    <td className="text-xs px-3 py-3">
                      <span className={`font-semibold ${p.stock <= 5 ? "text-[#EF4444]" : p.stock <= 15 ? "text-[#F59E0B]" : "text-gray-600"}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="text-xs px-3 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        p.status === "approved" ? "bg-[#10B981]/10 text-[#10B981]" :
                        p.status === "pending_review" ? "bg-[#F59E0B]/10 text-[#F59E0B]" :
                        p.status === "rejected" ? "bg-[#EF4444]/10 text-[#EF4444]" :
                        "bg-gray-100 text-gray-500"
                      }`}>
                        {p.status === "approved" ? "Approuvé" : p.status === "pending_review" ? "En attente" : p.status === "rejected" ? "Rejeté" : p.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {sortedPerf.length === 0 && (
                  <tr><td colSpan={7} className="text-xs text-gray-400 text-center py-8">Aucune donnée disponible</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom row: recent orders + top products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                  <img src={product.image || ""} alt={product.name} className="w-full h-full object-cover object-top" onError={e => e.target.style.display = 'none'} />
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
