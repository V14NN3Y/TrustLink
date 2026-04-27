import { useState, useEffect } from "react";
import { getSellerStats, getSharedRate } from "@/lib/sharedStorage";

export default function ExchangeRate() {
  const [ngnInput, setNgnInput] = useState(50000);
  const [stats, setStats] = useState({});
  const [rateData, setRateData] = useState({ rate: 4 });

  useEffect(() => {
    const loadData = () => {
      setStats(getSellerStats());
      setRateData(getSharedRate());
    };
    loadData();
    window.addEventListener("tl_storage_update", loadData);
    return () => window.removeEventListener("tl_storage_update", loadData);
  }, []);

  const rate = rateData.rate || 4;
  const commission = 0.05;
  const changeFee = 0.025;
  const fcfaResult = Math.round(ngnInput * rate * (1 + commission + changeFee));

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Simulateur de change</h3>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#10B981]/10">
          <i className="ri-exchange-dollar-line text-sm text-[#10B981]"></i>
        </div>
      </div>

      {/* Rate badge */}
      <div className="flex items-center justify-center gap-2 bg-[#F9FAFB] rounded-lg p-2 mb-4">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Taux affiché</span>
        <span className="text-sm font-bold text-[#125C8D]">1 NGN = {rate.toFixed(4)} FCFA</span>
      </div>

      {/* Converter */}
      <div className="flex items-center gap-2 mb-4">
        {/* NGN input */}
        <div className="flex-1 border border-gray-200 rounded-lg p-3 bg-white">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">NGN ₦</p>
          <input
            type="number"
            value={ngnInput}
            onChange={(e) => setNgnInput(Number(e.target.value) || 0)}
            className="w-full text-sm font-bold text-gray-900 bg-transparent border-none outline-none"
            style={{ fontFamily: "'Inter', sans-serif" }}
            min={0}
          />
        </div>

        {/* Arrow */}
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#125C8D]/10 flex-shrink-0">
          <i className="ri-arrow-right-line text-[#125C8D] text-sm"></i>
        </div>

        {/* FCFA output */}
        <div className="flex-1 border border-gray-200 rounded-lg p-3 bg-[#F9FAFB]">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">FCFA</p>
          <p className="text-sm font-bold text-[#10B981]">{fcfaResult.toLocaleString()}</p>
        </div>
      </div>

      <p className="text-[10px] text-gray-400 text-center mb-4">
        Commission 5% + frais change 2.5% inclus
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
        <div className="text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">Taux conversion</p>
          <p className="text-base font-bold text-[#10B981]">{stats.conversion_rate || 98.2}%</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">Taux litige</p>
          <p className="text-base font-bold text-[#FF6A00]">{stats.dispute_rate || 1.8}%</p>
        </div>
      </div>
    </div>
  );
}
