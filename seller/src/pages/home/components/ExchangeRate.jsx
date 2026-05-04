import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ExchangeRate() {
  const [ngnInput, setNgnInput] = useState(50000);
  const [rate, setRate] = useState(0.89);
  const [stats, setStats] = useState({ conversion_rate: 0, dispute_rate: 0 });
  useEffect(() => {
    const fetchRate = async () => {
      const { data } = await supabase
        .from("exchange_rates")
        .select("rate")
        .eq("from_currency", "NGN")
        .eq("to_currency", "XOF")
        .maybeSingle();
      if (data) setRate(data.rate);
    };
    fetchRate();
  }, []);
  useEffect(() => {
    // TODO: brancher sur vraies stats Supabase
    setStats({ conversion_rate: 0, dispute_rate: 0 });
  }, []);
  const fcfaResult = Math.round(ngnInput * rate);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Simulateur de change</h3>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#10B981]/10">
          <i className="ri-exchange-dollar-line text-sm text-[#10B981]"></i>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 bg-[#F9FAFB] rounded-lg p-2 mb-4">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Taux affiché</span>
        <span className="text-sm font-bold text-[#125C8D]">1 NGN = {rate.toFixed(2)} XOF</span>
      </div>
      <div className="flex items-center gap-2 mb-4">
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
        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#125C8D]/10 flex-shrink-0">
          <i className="ri-arrow-right-line text-[#125C8D] text-sm"></i>
        </div>
        <div className="flex-1 border border-gray-200 rounded-lg p-3 bg-[#F9FAFB]">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">XOF</p>
          <p className="text-sm font-bold text-[#10B981]">{fcfaResult.toLocaleString()}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
        <div className="text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">Confiance</p>
          <p className="text-base font-bold text-[#10B981]">{stats.conversion_rate}%</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">Litiges</p>
          <p className="text-base font-bold text-[#FF6A00]">{stats.dispute_rate}%</p>
        </div>
      </div>
    </div>
  );
}
