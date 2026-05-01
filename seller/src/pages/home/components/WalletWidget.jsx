import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mockStats } from "@/mocks/seller";

export default function WalletWidget() {
  const [hidden, setHidden] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      className="rounded-xl p-5 relative overflow-hidden flex flex-col justify-between"
      style={{ background: "linear-gradient(135deg, #0E3A4F 0%, #125C8D 100%)", minHeight: "220px" }}
    >
      {/* Decorative circles */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}></div>
      <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full pointer-events-none" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}></div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-1">
          <p className="text-white/60 text-[10px] font-semibold uppercase tracking-widest">Solde disponible</p>
          <button
            onClick={() => setHidden(!hidden)}
            className="text-white/40 hover:text-white/80 transition-colors cursor-pointer"
          >
            <i className={`${hidden ? "ri-eye-line" : "ri-eye-off-line"} text-sm`}></i>
          </button>
        </div>
        <p className="text-3xl font-bold text-white mt-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
          {hidden ? "••••••••" : `₦${mockStats.balance_available.toLocaleString()}`}
        </p>
        <p className="text-white/50 text-xs mt-1">
          +₦{mockStats.balance_change_month.toLocaleString()} ce mois
        </p>

        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <p className="text-white/60 text-[10px] uppercase tracking-widest">En Escrow</p>
            <p className="text-white/80 text-sm font-semibold">
              {hidden ? "••••••" : `₦${mockStats.escrow_amount.toLocaleString()}`}
            </p>
          </div>
          <p className="text-white/40 text-[10px] mt-0.5">{mockStats.escrow_orders} commandes en attente</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="relative z-10 flex gap-2 mt-4">
        <button
          onClick={() => navigate("/wallet")}
          className="flex-1 bg-white text-[#0E3A4F] text-sm font-semibold py-2 rounded-lg text-center cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap"
        >
          <i className="ri-send-plane-line mr-1.5"></i>Retirer
        </button>
        <button
          onClick={() => navigate("/wallet")}
          className="flex-1 text-white text-sm font-semibold py-2 rounded-lg text-center cursor-pointer transition-colors whitespace-nowrap border border-white/20"
          style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
        >
          <i className="ri-history-line mr-1.5"></i>Historique
        </button>
      </div>
    </div>
  );
}
