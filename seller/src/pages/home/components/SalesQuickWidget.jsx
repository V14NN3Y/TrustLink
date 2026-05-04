import { useNavigate } from "react-router-dom";

export default function SalesQuickWidget({ orders = [] }) {
  const navigate = useNavigate();
  const delivered = orders.filter((o) => o.status === "delivered" || o.status === "confirmed").length;
  const totalRevenue = orders.reduce((s, o) => s + (o.amount_ngn || 0), 0);
  const toShip = orders.filter((o) => o.status === "paid" || o.status === "processing").length;
  return (
    <div
      className="rounded-xl p-5 relative overflow-hidden flex flex-col justify-between"
      style={{ background: "linear-gradient(135deg, #0E3A4F 0%, #125C8D 100%)", minHeight: "220px" }}
    >
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}></div>
      <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full pointer-events-none" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}></div>
      <div className="relative z-10">
        <p className="text-white/60 text-[10px] font-semibold uppercase tracking-widest mb-3">
          Performance des ventes
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-white/70 text-[10px]">Commandes livrées</p>
            <p className="text-xl font-bold text-white">{delivered}</p>
          </div>
          <div>
            <p className="text-white/70 text-[10px]">Revenus totaux</p>
            <p className="text-xl font-bold text-white">₦{(totalRevenue / 1000000).toFixed(1)}M</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <p className="text-white/50 text-xs">
              En cours : <span className="text-white font-semibold">{toShip}</span>
            </p>
            <p className="text-white/50 text-xs">
              Total : <span className="text-white font-semibold">{orders.length}</span>
            </p>
          </div>
        </div>
      </div>
      <div className="relative z-10 mt-4">
        <button
          onClick={() => navigate("/stats")}
          className="w-full text-white text-sm font-semibold py-2.5 rounded-lg text-center cursor-pointer transition-colors border border-white/20 hover:bg-white/10"
        >
          Voir les statistiques <i className="ri-arrow-right-line ml-1"></i>
        </button>
      </div>
    </div>
  );
}
