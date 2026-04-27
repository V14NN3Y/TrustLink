import { useState, useEffect } from "react";
import { getSellerStats, getSellerWallet } from "@/lib/sharedStorage";

export default function RevenueChart() {
  const [currency, setCurrency] = useState("NGN");
  const [stats, setStats] = useState({ total_revenue: 0 });
  const [wallet, setWallet] = useState({ balance_ngn: 0 });

  useEffect(() => {
    const loadData = () => {
      setStats(getSellerStats());
      setWallet(getSellerWallet());
    };
    loadData();
    window.addEventListener("tl_storage_update", loadData);
    return () => window.removeEventListener("tl_storage_update", loadData);
  }, []);

  const RATE = 4;
  const fixedData = [
    { month: 'Oct', revenue: 280000 },
    { month: 'Nov', revenue: 420000 },
    { month: 'Déc', revenue: 680000 },
    { month: 'Jan', revenue: 520000 },
    { month: 'Fév', revenue: 750000 },
    { month: 'Mar', revenue: 920000 },
    { month: 'Avr', revenue: stats.total_revenue || 1250000 },
  ];
  
  const data = fixedData.map((d) => ({
    ...d,
    value: currency === "NGN" ? d.revenue : Math.round(d.revenue * RATE),
  }));

  const maxValue = Math.max(...data.map((d) => d.value));

  const formatValue = (v) => {
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
    return v;
  };

  const totalRevenue = stats.total_revenue || 1250000;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Revenus mensuels</h3>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Total Avr 2026 : <span className="font-semibold text-[#125C8D]">
              {currency === "NGN" ? `₦${totalRevenue.toLocaleString()}` : `${(totalRevenue * RATE).toLocaleString()} FCFA`}
            </span>
          </p>
        </div>
        {/* Currency Toggle */}
        <div className="flex items-center bg-gray-100 rounded-full p-0.5">
          {["NGN", "FCFA"].map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all whitespace-nowrap cursor-pointer ${
                currency === c ? "bg-white text-[#125C8D] shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="flex items-end gap-2" style={{ height: "120px" }}>
        {data.map((item, idx) => {
          const heightPct = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          const isLast = idx === data.length - 1;
          return (
            <div key={item.month} className="flex-1 flex flex-col items-center gap-1 h-full group relative">
              {/* Tooltip */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-semibold px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-10">
                {currency === "NGN" ? "₦" : ""}{formatValue(item.value)}{currency === "FCFA" ? " F" : ""}
              </div>
              <div className="flex-1 flex items-end w-full">
                <div
                  className={`w-full rounded-t-lg transition-all duration-500 ${isLast ? "bg-[#125C8D]" : "bg-[#125C8D]/20"}`}
                  style={{ height: `${heightPct}%`, minHeight: "4px" }}
                ></div>
              </div>
              <span className="text-[9px] text-gray-400 font-medium">{item.month}</span>
            </div>
          );
        })}
      </div>

      {/* Footer stats */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">Croissance</p>
          <p className="text-sm font-bold text-[#10B981]">+35.8%</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">Moy. mensuelle</p>
          <p className="text-sm font-bold text-gray-900">₦688k</p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">Meilleur mois</p>
          <p className="text-sm font-bold text-gray-900">Avr 2026</p>
        </div>
      </div>
    </div>
  );
}
