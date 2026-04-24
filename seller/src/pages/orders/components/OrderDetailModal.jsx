import OrderStatusBadge from "./OrderStatusBadge";

const statusOrder = ["new", "ready", "hub_received", "in_transit", "delivered", "completed"];

const stepLabels = [
  { key: "new",          icon: "ri-add-circle-line",      label: "Commande\nreçue" },
  { key: "ready",        icon: "ri-box-3-line",            label: "Prete a\ndeposer" },
  { key: "hub_received", icon: "ri-store-2-line",          label: "Au Hub\nLogistique" },
  { key: "in_transit",   icon: "ri-truck-line",            label: "En\ntransit" },
  { key: "delivered",    icon: "ri-map-pin-line",          label: "Livree\nacheteur" },
  { key: "completed",    icon: "ri-check-double-line",     label: "Fonds\ndebloques" },
];

const nextActionLabel = {
  new:          "Marquer Prete a deposer",
  ready:        "Confirmer depot au Hub",
  hub_received: "En transit",
  in_transit:   "Marquer Livree",
  delivered:    "Marquer Terminee",
};

const MiniQR = ({ code }) => {
  const grid = Array.from({ length: 7 }, (_, r) =>
    Array.from({ length: 7 }, (_, c) => {
      const hash = (r * 7 + c + code.charCodeAt(r % code.length)) % 3;
      return hash !== 2;
    })
  );
  return (
    <div className="bg-white p-2 rounded-xl border border-gray-200 inline-block">
      <div className="flex flex-col gap-0.5">
        {grid.map((row, r) => (
          <div key={r} className="flex gap-0.5">
            {row.map((filled, c) => (
              <div key={c} className={`w-5 h-5 rounded-sm ${filled ? "bg-gray-900" : "bg-white border border-gray-100"}`}></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function OrderDetailModal({ order, onClose }) {
  if (!order) return null;
  const currentIdx = statusOrder.indexOf(order.status);

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Commande {order.id}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {order.created_at} &bull; {order.buyer}
            </p>
            <div className="mt-2">
              <OrderStatusBadge status={order.status} />
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 cursor-pointer flex-shrink-0">
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        {/* Tracker */}
        <div className="p-6 border-b border-gray-100">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Suivi logistique</h4>
          <div className="relative flex items-start justify-between">
            {/* Connector lines */}
            {stepLabels.map((_, idx) => {
              if (idx === stepLabels.length - 1) return null;
              const passed = idx < currentIdx;
              return (
                <div
                  key={`line-${idx}`}
                  className="absolute top-5 h-px"
                  style={{
                    left: `calc(${(idx / (stepLabels.length - 1)) * 100}% + 20px)`,
                    width: `calc(${100 / (stepLabels.length - 1)}% - 40px)`,
                    backgroundColor: passed ? "#125C8D" : "#E5E7EB",
                  }}
                ></div>
              );
            })}

            {stepLabels.map((step, idx) => {
              const passed = idx <= currentIdx;
              return (
                <div key={step.key} className="flex flex-col items-center flex-1 relative z-10">
                  <div
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      passed
                        ? "border-[#125C8D] bg-[#125C8D] text-white"
                        : "border-gray-200 bg-white text-gray-300"
                    }`}
                  >
                    <i className={`${step.icon} text-sm`}></i>
                  </div>
                  <p className="text-[10px] text-center mt-1 max-w-[60px] leading-tight text-gray-500">
                    {step.label.split("\n").map((l, i) => <span key={i} className="block">{l}</span>)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Buyer + QR */}
        <div className="grid grid-cols-2 gap-4 p-6 border-b border-gray-100">
          <div className="bg-[#F9FAFB] rounded-xl p-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Acheteur</h4>
            <p className="text-sm font-semibold text-gray-900 mb-1">{order.buyer}</p>
            <p className="text-xs text-gray-500 mb-1">
              <i className="ri-phone-line mr-1"></i>{order.buyer_phone || "+229 97 00 00 00"}
            </p>
            <p className="text-xs text-gray-500 mb-2">
              <i className="ri-map-pin-line mr-1"></i>{order.buyer_city}
            </p>
            {order.deadline && (
              <p className="text-xs font-semibold text-[#FF6A00]">
                <i className="ri-alarm-line mr-1"></i>Echéance : {order.deadline}
              </p>
            )}
          </div>
          <div className="bg-[#F9FAFB] rounded-xl p-4 flex flex-col items-center">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Bordereau QR</h4>
            <MiniQR code={order.qr_code} />
            <p className="font-mono text-xs font-bold text-gray-700 mt-2">{order.qr_code}</p>
            <button className="mt-2 text-[10px] font-semibold text-[#125C8D] hover:underline cursor-pointer whitespace-nowrap">
              <i className="ri-download-line mr-1"></i>Télécharger
            </button>
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
                  <td className="px-3 py-2 text-right text-gray-700">₦{item.unit_price.toLocaleString()}</td>
                  <td className="px-3 py-2 text-right font-semibold text-gray-900">₦{item.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200">
                <td colSpan={4} className="px-3 py-2 text-right font-semibold text-gray-500">Total NGN</td>
                <td className="px-3 py-2 text-right font-bold text-[#125C8D]">₦{order.amount_ngn.toLocaleString()}</td>
              </tr>
              <tr>
                <td colSpan={4} className="px-3 py-2 text-right font-semibold text-gray-400">Equivalent FCFA</td>
                <td className="px-3 py-2 text-right text-gray-500">{order.amount_fcfa.toLocaleString()} F</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 rounded-b-2xl px-6 py-4 flex items-center justify-between gap-3">
          {order.status === "completed" ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg">
              <i className="ri-checkbox-circle-fill text-[#10B981]"></i>
              <span className="text-sm font-semibold text-[#10B981]">Commande terminée — Fonds débloqués</span>
            </div>
          ) : (
            <button
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer whitespace-nowrap transition-colors"
              style={{ backgroundColor: "#125C8D" }}
            >
              <i className="ri-arrow-right-circle-line mr-1.5"></i>
              {nextActionLabel[order.status]}
            </button>
          )}
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-lg text-sm font-semibold text-gray-700 border border-gray-200 hover:bg-gray-100 cursor-pointer whitespace-nowrap transition-colors"
          >
            <i className="ri-printer-line mr-1.5"></i>Imprimer
          </button>
        </div>
      </div>
    </div>
  );
}
