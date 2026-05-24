import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { supabase } from "@/lib/supabaseClient";
import OrderStatusBadge from "./OrderStatusBadge";

const normalFlow = ["paid", "processing", "in_transit", "delivered", "confirmed"];
const stepLabels = [
  { key: "paid", icon: "ri-check-line", label: "Payée" },
  { key: "processing", icon: "ri-loader-2-line", label: "En traitement" },
  { key: "in_transit", icon: "ri-truck-line", label: "En transit" },
  { key: "delivered", icon: "ri-map-pin-line", label: "Livrée" },
  { key: "confirmed", icon: "ri-check-double-line", label: "Confirmée" },
];
const terminalStatuses = ["disputed", "cancelled", "refunded"];
const sellerUpdatable = ["processing"];

function QRDisplay({ code }) {
  const [dataUrl, setDataUrl] = useState("");
  useEffect(() => {
    if (!code) return;
    QRCode.toDataURL(code, { width: 96, margin: 1, color: { dark: "#111827", light: "#FFFFFF" } })
      .then(setDataUrl);
  }, [code]);
  if (!dataUrl) return <div className="w-24 h-24 rounded-lg bg-gray-100 animate-pulse" />;
  return <img src={dataUrl} alt="QR Code" className="w-24 h-24 rounded-lg" />;
}

export default function OrderDetailModal({ order, onClose, onStatusUpdate }) {
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  if (!order) return null;
  const isTerminal = terminalStatuses.includes(order.status);
  const currentIdx = normalFlow.indexOf(order.status);
  const safeCurrentIdx = currentIdx >= 0 ? currentIdx : -1;

  const updateItemStatus = async (newStatus) => {
    setUpdating(true);
    setUpdateError(null);
    try {
      const { error } = await supabase
        .from("order_items")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("order_id", order.order_id);
      if (error) throw error;
      if (onStatusUpdate) onStatusUpdate();
      onClose();
    } catch (err) {
      setUpdateError(err.message || "Erreur lors de la mise à jour");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Commande {order.id}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {order.created_at ? new Date(order.created_at).toLocaleDateString("fr-FR") : ""} &bull; {order.buyer}
            </p>
            <div className="mt-2">
              <OrderStatusBadge status={order.status} />
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 cursor-pointer flex-shrink-0">
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        {/* Progress tracker */}
        {!isTerminal && (
          <div className="p-6 border-b border-gray-100">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Suivi logistique</h4>
            <div className="relative flex items-start justify-between">
              {stepLabels.map((_, idx) => {
                if (idx === stepLabels.length - 1) return null;
                const passed = idx < safeCurrentIdx && safeCurrentIdx >= 0;
                return (
                  <div key={`line-${idx}`} className="absolute top-5 h-px"
                    style={{
                      left: `calc(${(idx / (stepLabels.length - 1)) * 100}% + 20px)`,
                      width: `calc(${100 / (stepLabels.length - 1)}% - 40px)`,
                      backgroundColor: passed ? "#125C8D" : "#E5E7EB",
                    }}
                  />
                );
              })}
              {stepLabels.map((step, idx) => {
                const passed = idx <= safeCurrentIdx && safeCurrentIdx >= 0;
                return (
                  <div key={step.key} className="flex flex-col items-center flex-1 relative z-10">
                    <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${passed ? "border-[#125C8D] bg-[#125C8D] text-white" : "border-gray-200 bg-white text-gray-300"}`}>
                      <i className={`${step.icon} text-sm`}></i>
                    </div>
                    <p className="text-[10px] text-center mt-1 max-w-[60px] leading-tight text-gray-500">{step.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {isTerminal && (
          <div className="p-6 border-b border-gray-100">
            <div className={`p-4 rounded-xl border ${order.status === "disputed" ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"}`}>
              <div className="flex items-center gap-2">
                <i className={`${order.status === "disputed" ? "ri-error-warning-line text-red-500" : order.status === "refunded" ? "ri-refund-line text-gray-500" : "ri-close-circle-line text-gray-500"} text-lg`}></i>
                <p className="text-sm font-semibold text-gray-800">
                  {order.status === "disputed" ? "Cette commande fait l'objet d'un litige en cours de traitement par l'administration." :
                    order.status === "refunded" ? "Cette commande a été remboursée." : "Cette commande a été annulée."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Buyer + QR */}
        <div className="grid grid-cols-2 gap-4 p-6 border-b border-gray-100">
          <div className="bg-[#F9FAFB] rounded-xl p-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Acheteur</h4>
            <p className="text-sm font-semibold text-gray-900 mb-1">{order.buyer}</p>
            <p className="text-xs text-gray-500 mb-2"><i className="ri-map-pin-line mr-1"></i>{order.buyer_city}</p>
            {order.created_at && (
              <p className="text-xs text-gray-400"><i className="ri-calendar-line mr-1"></i>Commande du {new Date(order.created_at).toLocaleDateString("fr-FR")}</p>
            )}
          </div>
          <div className="bg-[#F9FAFB] rounded-xl p-4 flex flex-col items-center justify-center">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">QR Bordereau</h4>
            <QRDisplay code={order.order_id} />
            <p className="font-mono text-xs font-bold text-gray-600 mt-2">{order.id}</p>
          </div>
        </div>

        {/* Items */}
        <div className="p-6 border-b border-gray-100">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Articles commandés</h4>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#F9FAFB]">
                <th className="text-left px-3 py-2 text-gray-400 font-semibold">Produit</th>
                <th className="text-left px-3 py-2 text-gray-400 font-semibold">Variante</th>
                <th className="text-center px-3 py-2 text-gray-400 font-semibold">Qté</th>
                <th className="text-right px-3 py-2 text-gray-400 font-semibold">Prix unit.</th>
                <th className="text-right px-3 py-2 text-gray-400 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((item, idx) => (
                <tr key={idx} className="border-t border-gray-100">
                  <td className="px-3 py-2 font-medium text-gray-700">{item.product}</td>
                  <td className="px-3 py-2 text-gray-500">{item.variant}</td>
                  <td className="px-3 py-2 text-center text-gray-700">{item.qty}</td>
                  <td className="px-3 py-2 text-right text-gray-700">₦{(item.unit_price || 0).toLocaleString()}</td>
                  <td className="px-3 py-2 text-right font-semibold text-gray-900">₦{(item.total || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200">
                <td colSpan={4} className="px-3 py-2 text-right font-semibold text-gray-500">Total NGN</td>
                <td className="px-3 py-2 text-right font-bold text-[#125C8D]">₦{(order.amount_ngn || 0).toLocaleString()}</td>
              </tr>
              <tr>
                <td colSpan={4} className="px-3 py-2 text-right font-semibold text-gray-400">Equivalent FCFA</td>
                <td className="px-3 py-2 text-right text-gray-500">{(order.amount_fcfa || 0).toLocaleString()} F</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 rounded-b-2xl px-6 py-4">
          {!isTerminal && sellerUpdatable.includes(order.status) && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Mettre à jour le statut</p>
              <div className="flex gap-2 flex-wrap">
                {order.status === "processing" && (
                  <button onClick={() => updateItemStatus("in_transit")} disabled={updating}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 cursor-pointer transition-colors">
                    <i className="ri-truck-line"></i>Marquer en transit
                  </button>
                )}
              </div>
              {updateError && <p className="text-xs text-red-500 mt-2">{updateError}</p>}
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#125C8D]/10 rounded-lg">
              <i className="ri-information-line text-[#125C8D]"></i>
              <span className="text-sm font-semibold text-[#125C8D]">
                {isTerminal ? "Statut final" : sellerUpdatable.includes(order.status) ? "Vous pouvez mettre à jour" : "Admin gère les statuts"}
              </span>
            </div>
            <button onClick={onClose} className="py-2.5 px-4 rounded-lg text-sm font-semibold text-gray-700 border border-gray-200 hover:bg-gray-100 cursor-pointer whitespace-nowrap transition-colors">
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
