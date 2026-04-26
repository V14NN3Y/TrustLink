import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { mockOrders } from "@/mocks/orders";
import OrderStatusBadge from "./components/OrderStatusBadge";
import OrderDetailModal from "./components/OrderDetailModal";
import QRBordereau from "./components/QRBordereau";
import {
  getDispatchesForSeller,
  getSharedOrders,
  updateSharedOrder,
} from "@/lib/sharedStorage";

const SELLER_ID = "adebayo-fashions";

const tabs = [
  { value: "all", label: "Toutes" },
  { value: "new", label: "Nouvelles" },
  { value: "ready", label: "Prêtes à déposer" },
  { value: "hub_received", label: "Reçues au Hub" },
  { value: "in_transit", label: "En transit" },
  { value: "delivered", label: "Livrées" },
  { value: "completed", label: "Terminées" },
];

function mapSharedStatus(status) {
  const map = {
    dispatched_to_seller: "new",
    seller_confirmed: "ready",
    hub_received: "hub_received",
    in_transit: "in_transit",
    delivered: "delivered",
    completed: "completed",
  };
  return map[status] ?? "new";
}

function sharedOrderToLocal(shared, dispatch) {
  return {
    id: shared.id,
    product: shared.product_name,
    product_image: "",
    buyer: shared.buyer_name,
    buyer_city: shared.buyer_city,
    quantity: 1,
    amount_ngn: shared.amount_ngn,
    amount_fcfa: shared.amount_xof,
    status: mapSharedStatus(shared.status),
    created_at: new Date(shared.created_at).toLocaleDateString("fr-FR"),
    hub: shared.hub,
    qr_code: `${shared.id}-QR`,
    items: [{ product: shared.product_name, variant: "", qty: 1, unit_price: shared.amount_ngn, total: shared.amount_ngn }],
    buyer_phone: "",
    deadline: "",
    seller_id: shared.seller_id,
    dispatched_by: dispatch.dispatched_by,
    dispatched_at: dispatch.dispatched_at,
    admin_instructions: dispatch.instructions,
    _fromShared: true,
  };
}

function loadOrders() {
  const dispatches = getDispatchesForSeller(SELLER_ID);
  if (dispatches.length === 0) {
    return { list: mockOrders, hasShared: false };
  }
  const sharedOrders = getSharedOrders();
  const dispatchedOrders = dispatches
    .map((dispatch) => {
      const shared = sharedOrders.find((o) => o.id === dispatch.order_id);
      if (!shared) return null;
      return sharedOrderToLocal(shared, dispatch);
    })
    .filter(Boolean);

  const dispatchedIds = new Set(dispatchedOrders.map((o) => o.id));
  const mockFallback = mockOrders.filter((o) => !dispatchedIds.has(o.id));
  return {
    list: [...dispatchedOrders, ...mockFallback],
    hasShared: true,
  };
}

export default function OrdersPage() {
  const [activeStatus, setActiveStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [detailOrder, setDetailOrder] = useState(null);
  const [showQR, setShowQR] = useState(null);
  const [allOrders, setAllOrders] = useState([]);
  const [hasSharedData, setHasSharedData] = useState(false);

  useEffect(() => {
    const refresh = () => {
      const { list, hasShared } = loadOrders();
      setAllOrders(list);
      setHasSharedData(hasShared);
    };
    refresh();
    window.addEventListener("tl_storage_update", refresh);
    return () => window.removeEventListener("tl_storage_update", refresh);
  }, []);

  const handleConfirmReception = (orderId) => {
    updateSharedOrder(orderId, { status: "seller_confirmed" });
    setAllOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "ready" } : o))
    );
  };

  const newDispatchCount = useMemo(
    () => allOrders.filter((o) => o.status === "new" && o.dispatched_by).length,
    [allOrders]
  );

  const filtered = useMemo(() => {
    let list = [...allOrders];
    if (activeStatus !== "all") list = list.filter((o) => o.status === activeStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.product.toLowerCase().includes(q) ||
          o.buyer.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allOrders, activeStatus, search]);

  const totalFiltered = filtered.reduce((sum, o) => sum + o.amount_ngn, 0);

  return (
    <DashboardLayout>
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <p className="text-sm font-semibold text-gray-700">
          {allOrders.length} commandes ·{" "}
          <span className="text-[#125C8D]">
            ₦{allOrders.reduce((s, o) => s + o.amount_ngn, 0).toLocaleString()}
          </span>
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
            />
          </div>
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-white whitespace-nowrap"
            style={{ backgroundColor: "#125C8D" }}
          >
            <i className="ri-download-2-line text-sm"></i>Exporter CSV
          </button>
        </div>
      </div>

      {/* Bannière dispatches en attente */}
      {hasSharedData && newDispatchCount > 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-xl px-4 py-3 border border-[#125C8D]/20 bg-[#125C8D]/5">
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#125C8D]/10 flex-shrink-0">
            <i className="ri-send-plane-line text-[#125C8D] text-sm"></i>
          </div>
          <div className="flex-1">
            <p className="text-[#125C8D] text-sm font-semibold">
              {newDispatchCount} nouvelle{newDispatchCount > 1 ? "s" : ""} commande{newDispatchCount > 1 ? "s" : ""} dispatched par l'Admin
            </p>
            <p className="text-gray-400 text-xs">Confirmez réception pour débloquer les fonds Escrow</p>
          </div>
          <span className="text-xs bg-[#125C8D] text-white rounded-full px-3 py-1 font-semibold whitespace-nowrap">
            Action requise
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5 overflow-x-auto">
        {tabs.map((tab) => {
          const count =
            tab.value === "all"
              ? allOrders.length
              : allOrders.filter((o) => o.status === tab.value).length;
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
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeStatus === tab.value
                    ? "bg-[#125C8D]/10 text-[#125C8D]"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
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
                {["ID / Date", "Acheteur", "Articles", "Montant", "Statut", "Source", "Échéance Hub", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-[#F9FAFB] transition-all cursor-pointer group"
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
                    <p className="text-xs font-medium text-gray-700 max-w-[160px] truncate">{order.product}</p>
                    {order.items?.length > 1 && (
                      <p className="text-[10px] text-gray-400">+{order.items.length - 1} autre{order.items.length > 2 ? "s" : ""}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-bold text-gray-900">₦{order.amount_ngn.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400">FCFA {order.amount_fcfa.toLocaleString()}</p>
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3">
                    {order.dispatched_by ? (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-[#125C8D]/10 text-[#125C8D] px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                        <i className="ri-global-line text-[10px]"></i>Marketplace
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                        <i className="ri-store-2-line text-[10px]"></i>Interne
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {order.deadline ? (
                      <span className={`text-xs font-semibold ${order.status === "ready" || order.status === "new" ? "text-orange-500" : "text-gray-500"}`}>
                        {order.deadline}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all" onClick={(e) => e.stopPropagation()}>
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
                      {order.dispatched_by && order.status === "new" && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleConfirmReception(order.id); }}
                          className="w-7 h-7 rounded-md flex items-center justify-center bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 transition-colors cursor-pointer"
                          title="Confirmer réception"
                        >
                          <i className="ri-checkbox-circle-line text-xs"></i>
                        </button>
                      )}
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
          <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center bg-[#F9FAFB]">
            <span className="text-xs text-gray-400">{filtered.length} résultats</span>
            <span className="text-xs font-bold text-gray-700">
              Total filtré : <span className="text-[#10B981]">₦{totalFiltered.toLocaleString()}</span>
            </span>
          </div>
        )}
      </div>

      {detailOrder && <OrderDetailModal order={detailOrder} onClose={() => setDetailOrder(null)} />}
      {showQR && <QRBordereau order={showQR} onClose={() => setShowQR(null)} />}
    </DashboardLayout>
  );
}
