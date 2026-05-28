import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useSellerOrders } from "@/hooks/useSellerOrders";
import { useLocale } from "@/lib/i18n";
import { useCurrency } from "@/hooks/useCurrency";
import DashboardLayout from "@/components/feature/DashboardLayout";
import OrderStatusBadge from "./components/OrderStatusBadge";
import OrderDetailModal from "./components/OrderDetailModal";
import QRBordereau from "./components/QRBordereau";

function exportOrdersCSV(orders, locale) {
  const headers = locale === "en"
    ? ["ID", "Date", "Buyer", "City", "Product", "Amount NGN", "Amount FCFA", "Status"]
    : ["ID", "Date", "Acheteur", "Ville", "Produit", "Montant NGN", "Montant FCFA", "Statut"];
  const rows = orders.map((o) => [
    `"${o.id}"`,
    `"${o.created_at ? new Date(o.created_at).toLocaleDateString("fr-FR") : ""}"`,
    `"${o.buyer || ""}"`,
    `"${o.buyer_city || ""}"`,
    `"${o.items?.[0]?.product || ""}"`,
    `"${o.amount_ngn || 0}"`,
    `"${o.amount_fcfa || 0}"`,
    `"${o.status}"`,
  ].join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `orders_trustlink_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function OrdersPage() {
  const { user } = useAuth();
  const { orders, loading, refetch } = useSellerOrders(user?.id);
  const [activeStatus, setActiveStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [detailOrder, setDetailOrder] = useState(null);
  const [showQR, setShowQR] = useState(null);
  const { t, locale } = useLocale();
  const { formatPrice } = useCurrency();

  const tabs = [
    { value: "all", label: t("orders.all") },
    { value: "processing", label: t("orders.processing") },
    { value: "in_transit", label: t("orders.inTransit") },
    { value: "delivered", label: t("orders.delivered") },
    { value: "disputed", label: t("orders.disputed") },
    { value: "cancelled", label: t("orders.cancelled") },
  ];

  const filtered = orders.filter((o) => {
    if (activeStatus === "all") return true;
    if (activeStatus === "processing") return o.status === "processing";
    if (activeStatus === "delivered") return o.status === "delivered" || o.status === "confirmed";
    if (activeStatus === "disputed") return o.status === "disputed";
    if (activeStatus === "cancelled") return o.status === "cancelled" || o.status === "refunded";
    return o.status === activeStatus;
  }).filter((o) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      (o.id?.toLowerCase() || "").includes(s) ||
      (o.items?.[0]?.product?.toLowerCase() || "").includes(s) ||
      (o.buyer?.toLowerCase() || "").includes(s)
    );
  });

  const totalFilteredFCFA = filtered.reduce((sum, o) => sum + (o.amount_fcfa || 0), 0);
  const totalAllFCFA = orders.reduce((sum, o) => sum + (o.amount_fcfa || 0), 0);

  const tabCount = (val) => {
    if (val === "all") return orders.length;
    if (val === "processing") return orders.filter((o) => o.status === "processing").length;
    if (val === "delivered") return orders.filter((o) => o.status === "delivered" || o.status === "confirmed").length;
    if (val === "disputed") return orders.filter((o) => o.status === "disputed").length;
    if (val === "cancelled") return orders.filter((o) => o.status === "cancelled" || o.status === "refunded").length;
    return orders.filter((o) => o.status === val).length;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-[#125C8D] rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <p className="text-sm font-semibold text-gray-700">
          {orders.length} {t("orders.total")}{" "}
          <span className="text-[#125C8D]">{formatPrice(totalAllFCFA)}</span>
        </p>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
            <input
              type="text"
              placeholder={t("orders.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-700 outline-none w-48 focus:border-[#125C8D] transition-colors"
            />
          </div>
          <button
            onClick={() => exportOrdersCSV(filtered, locale)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-white whitespace-nowrap cursor-pointer hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "#125C8D" }}
          >
            <i className="ri-download-2-line text-sm"></i>{t("orders.exportCSV")}
          </button>
        </div>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-5 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveStatus(tab.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
              activeStatus === tab.value ? "bg-white text-[#125C8D] shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeStatus === tab.value ? "bg-[#125C8D]/10 text-[#125C8D]" : "bg-gray-200 text-gray-500"}`}>
              {tabCount(tab.value)}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">{t("orders.colId")}</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">{t("orders.colBuyer")}</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">{t("orders.colItems")}</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">{t("orders.colAmount")}</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">{t("orders.colStatus")}</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">{t("orders.colActions")}</th>
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
                    <p className="text-[10px] text-gray-400">{order.created_at ? new Date(order.created_at).toLocaleDateString(locale === "en" ? "en-GB" : "fr-FR") : ""}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-800">{order.buyer || "—"}</p>
                    <p className="text-[10px] text-gray-400">{order.buyer_city || "—"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-medium text-gray-700 max-w-[180px] truncate">{order.items?.[0]?.product || "—"}</p>
                    <p className="text-[10px] text-gray-400">{(order.amount_fcfa || 0).toLocaleString()} FCFA</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-bold text-gray-900">{formatPrice(order.amount_fcfa || 0)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
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
                        title={t('orders.viewDetail')}
                      >
                        <i className="ri-eye-line text-xs"></i>
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
              <p className="text-sm">{t("orders.noOrders")}</p>
            </div>
          )}
        </div>
        {filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center">
            <span className="text-xs text-gray-400">{filtered.length} {t("orders.results")}</span>
            <span className="text-xs font-bold text-gray-700">{t("orders.filteredTotal")} : {formatPrice(totalFilteredFCFA)}</span>
          </div>
        )}
      </div>

      {detailOrder && <OrderDetailModal order={detailOrder} onClose={() => setDetailOrder(null)} onStatusUpdate={() => refetch()} />}
      {showQR && <QRBordereau order={showQR} onClose={() => setShowQR(null)} />}
    </DashboardLayout>
  );
}
