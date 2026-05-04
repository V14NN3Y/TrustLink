import { useNavigate } from "react-router-dom";
import OrderStatusBadge from "@/pages/orders/components/OrderStatusBadge";

export default function RecentOrders({ orders = [] }) {
  const navigate = useNavigate();
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
        <i className="ri-inbox-line text-3xl mb-2 block"></i>
        <p className="text-sm">Aucune commande récente</p>
      </div>
    );
  }
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
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="group border-b border-gray-100 last:border-0 hover:bg-[#F9FAFB] transition-all cursor-pointer" onClick={() => navigate("/orders")}>
                <td className="px-5 py-3">
                  <span className="font-mono text-xs font-bold text-gray-700">{order.id}</span>
                </td>
                <td className="px-5 py-3">
                  <span className="text-xs font-medium text-gray-700 max-w-[160px] truncate block">{order.product}</span>
                </td>
                <td className="px-5 py-3">
                  <p className="text-xs font-medium text-gray-700">{order.buyer}</p>
                  <p className="text-[10px] text-gray-400">{order.buyer_city}</p>
                </td>
                <td className="px-5 py-3">
                  <p className="text-xs font-bold text-gray-900">₦{(order.amount_ngn || 0).toLocaleString()}</p>
                </td>
                <td className="px-5 py-3">
                  <OrderStatusBadge status={order.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
