import { useNavigate } from "react-router-dom";

const recentOrders = [
  { id: "TL-004901", product: "iPhone 15 Pro Max", buyer: "Kofi Mensah", city: "Cotonou", amount_ngn: 1850000, status: "new" },
  { id: "TL-004899", product: "Samsung Galaxy A54", buyer: "Aminata Diallo", city: "Porto-Novo", amount_ngn: 790000, status: "ready" },
  { id: "TL-004887", product: "Ecouteurs JBL x3", buyer: "Chidi Okonkwo", city: "Cotonou", amount_ngn: 127500, status: "hub_received" },
  { id: "TL-004856", product: "Power Bank Anker x2", buyer: "Fatou Traore", city: "Parakou", amount_ngn: 56000, status: "in_transit" },
  { id: "TL-004821", product: "Xiaomi Mi Band 8", buyer: "Segun Adeyemi", city: "Abomey-Calavi", amount_ngn: 35000, status: "delivered" },
  { id: "TL-004799", product: "Aspirateur Rowenta", buyer: "Blessing Nwosu", city: "Cotonou", amount_ngn: 145000, status: "completed" },
];

const statusConfig = {
  new:          { label: "Nouvelle",        bg: "bg-[#125C8D]/10", color: "text-[#125C8D]",  icon: "ri-add-circle-line" },
  ready:        { label: "Prete a deposer", bg: "bg-[#FF6A00]/10", color: "text-[#FF6A00]",  icon: "ri-box-3-line" },
  hub_received: { label: "Recue au Hub",    bg: "bg-violet-100",   color: "text-violet-600",  icon: "ri-store-2-line" },
  in_transit:   { label: "En transit",      bg: "bg-amber-100",    color: "text-amber-600",   icon: "ri-truck-line" },
  delivered:    { label: "Livree",          bg: "bg-[#10B981]/10", color: "text-[#10B981]",   icon: "ri-checkbox-circle-line" },
  completed:    { label: "Terminee",        bg: "bg-gray-100",     color: "text-gray-500",    icon: "ri-check-double-line" },
};

export default function RecentOrders() {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl border border-gray-100">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Commandes récentes</h3>
        <button
          onClick={() => navigate("/orders")}
          className="text-[10px] font-semibold text-[#125C8D] hover:underline cursor-pointer whitespace-nowrap"
        >
          Voir toutes
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Commande</th>
              <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Produit</th>
              <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Acheteur</th>
              <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Montant</th>
              <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Statut</th>
              <th className="text-left px-5 py-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => {
              const cfg = statusConfig[order.status];
              return (
                <tr key={order.id} className="group border-b border-gray-100 last:border-0 hover:bg-[#F9FAFB] transition-all cursor-pointer" onClick={() => navigate("/orders")}>
                  <td className="px-5 py-3">
                    <span className="font-mono text-xs font-bold text-gray-700">{order.id}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs font-medium text-gray-700 max-w-[160px] truncate block">{order.product}</span>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-xs font-medium text-gray-700">{order.buyer}</p>
                    <p className="text-[10px] text-gray-400">{order.city}</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-xs font-bold text-gray-900">₦{order.amount_ngn.toLocaleString()}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${cfg.bg} ${cfg.color}`}>
                      <i className={`${cfg.icon} text-[10px]`}></i>
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate("/orders"); }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#125C8D]/10 text-[#125C8D] hover:bg-[#125C8D]/20 transition-colors cursor-pointer"
                      >
                        <i className="ri-eye-line text-xs"></i>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate("/orders"); }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        <i className="ri-qr-code-line text-xs"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
