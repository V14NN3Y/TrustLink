import { useState } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { mockOrders } from "@/mocks/orders";
import OrderStatusBadge from "./components/OrderStatusBadge";
import OrderDetailModal from "./components/OrderDetailModal";
import QRBordereau from "./components/QRBordereau";

const tabs = [
  { value: "all", label: "Toutes" },
  { value: "new", label: "Nouvelles" },
  { value: "ready", label: "Prêtes à déposer" },
  { value: "hub_received", label: "Reçues au Hub" },
  { value: "in_transit", label: "En transit" },
  { value: "delivered", label: "Livrées" },
  { value: "completed", label: "Terminées" },
];

export default function OrdersPage() {
  const [activeStatus, setActiveStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [detailOrder, setDetailOrder] = useState(null);
  const [showQR, setShowQR] = useState(null);

  const filtered = mockOrders.filter((o) => {
    const matchStatus = activeStatus === "all" || o.status === activeStatus;
    const matchSearch =
      search === "" ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.product.toLowerCase().includes(search.toLowerCase()) ||
      o.buyer.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalFiltered = filtered.reduce((sum, o) => sum + o.amount_ngn, 0);

  return (
    <DashboardLayout>
      {/* Top bar: count + search + export */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <p className="text-sm font-semibold text-gray-700">
          {mockOrders.length} commandes · Total{" "}
          <span className="text-[#125C8D]">₦{mockOrders.reduce((s,o)=>s+o.amount_ngn,0).toLocaleString()}</span>
        </p>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-700 outline-none w-48 focus:border-[#125C8D] transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-white whitespace-nowrap" style={{ backgroundColor: "#125C8D" }}>
            <i className="ri-download-2-line text-sm"></i>Exporter CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5 overflow-x-auto">
        {tabs.map((tab) => {
          const count = tab.value === "all" ? mockOrders.length : mockOrders.filter((o) => o.status === tab.value).length;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveStatus(tab.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                activeStatus === tab.value
                  ? "bg-white text-[#125C8D] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeStatus === tab.value ? "bg-[#125C8D]/10 text-[#125C8D]" : "bg-gray-200 text-gray-500"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  ID / Date <i className="ri-arrow-up-down-line ml-0.5 opacity-50"></i>
                </th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Acheteur</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Articles</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Montant <i className="ri-arrow-up-down-line ml-0.5 opacity-50"></i>
                </th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Statut</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Échéance Hub</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-[#F9FAFB] transition-all cursor-pointer"
                  onClick={() => setDetailOrder(order)}
                >
                  <td className="px-4 py-3">
                    <p className="text-sm font-bold text-[#125C8D]">{order.id}</p>
                    <p className="text-[10px] text-gray-400">{order.created_at}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-800">{order.buyer}</p>
                    <p className="text-[10px] text-gray-400">{order.buyer_city}, Bénin</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-medium text-gray-700 max-w-[180px] truncate">{order.product}</p>
                    <p className="text-[10px] text-gray-400">FCFA {order.amount_fcfa.toLocaleString()}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-bold text-gray-900">₦{order.amount_ngn.toLocaleString()}</p>
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3">
                    {order.deadline ? (
                      <span className={`text-xs font-semibold ${
                        order.status === "ready" ? "text-orange-500" : "text-gray-500"
                      }`}>
                        {order.deadline}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowQR(order); }}
                        className="w-7 h-7 rounded-md flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer"
                        title="QR Bordereau"
                      >
                        <i className="ri-qr-code-line text-xs"></i>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDetailOrder(order); }}
                        className="w-7 h-7 rounded-md flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer"
                        title="Détail"
                      >
                        <i className="ri-eye-line text-xs"></i>
                      </button>
                      <button
                        className="w-7 h-7 rounded-md flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer"
                        title="Supprimer"
                      >
                        <i className="ri-delete-bin-line text-xs"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <i className="ri-inbox-line text-3xl mb-2 block"></i>
              <p className="text-sm">Aucune commande trouvée</p>
            </div>
          )}
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center">
            <span className="text-xs text-gray-400">{filtered.length} résultats</span>
            <span className="text-xs font-bold text-gray-700">Total filtré : ₦{totalFiltered.toLocaleString()}</span>
          </div>
        )}
      </div>

      {detailOrder && <OrderDetailModal order={detailOrder} onClose={() => setDetailOrder(null)} />}
      {showQR && <QRBordereau order={showQR} onClose={() => setShowQR(null)} />}
    </DashboardLayout>
  );
}
