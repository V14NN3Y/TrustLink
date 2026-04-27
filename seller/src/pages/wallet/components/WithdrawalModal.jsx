import { useState, useEffect } from "react";
import { getSellerWallet } from "@/lib/sharedStorage";

export default function WithdrawalModal({ availableBalance, onClose }) {
  const [amount, setAmount] = useState("");
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const wallet = getSellerWallet();
    setBankAccounts(wallet.bank_accounts || []);
    if (wallet.bank_accounts?.[0]) {
      setSelectedBank(wallet.bank_accounts[0]);
    }
  }, []);

  const numAmount = Number(amount);
  const isValid = numAmount > 0 && numAmount <= availableBalance;
  const isOverLimit = numAmount > availableBalance && numAmount > 0;

  const handleSubmit = () => {
    if (!isValid) return;
    setSubmitted(true);
    setTimeout(onClose, 2000);
  };

  const setQuick = (pct) => {
    setAmount(String(Math.floor(availableBalance * pct)));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "rgba(16,185,129,0.1)" }}>
              <i className="ri-checkbox-circle-fill text-3xl text-[#10B981]"></i>
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>Retrait initié !</h3>
            <p className="text-sm text-gray-500">
              ₦{numAmount.toLocaleString()} vers {selectedBank.bank} ****{selectedBank.last4}
            </p>
            <p className="text-xs text-gray-400 mt-1">Traitement sous 24-48h</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Demander un retrait</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 cursor-pointer">
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Balance */}
              <div className="bg-[#F9FAFB] rounded-xl p-4 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Solde disponible</p>
                <p className="text-2xl font-bold text-gray-900">₦{availableBalance.toLocaleString()}</p>
              </div>

              {/* Amount */}
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 block mb-2">Montant du retrait</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₦</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className={`w-full border rounded-lg pl-7 pr-4 py-2.5 text-sm font-bold outline-none transition-colors ${isOverLimit ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-[#125C8D]"}`}
                    style={{ fontFamily: "'Inter', sans-serif" }}
                    min={0}
                  />
                </div>
                {isOverLimit && (
                  <p className="text-xs text-red-500 mt-1">Montant supérieur au solde disponible</p>
                )}
                {/* Quick amounts */}
                <div className="flex gap-2 mt-2">
                  {[0.25, 0.5, 1].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setQuick(pct)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer whitespace-nowrap transition-colors"
                    >
                      {pct === 1 ? "Max" : `${pct * 100}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bank selection */}
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 block mb-2">Compte de destination</label>
                <div className="space-y-2">
                  {mockBankAccounts.map((bank) => (
                    <div
                      key={bank.id}
                      onClick={() => setSelectedBank(bank)}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${selectedBank.id === bank.id ? "border-[#125C8D] bg-[#125C8D]/5" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#F9FAFB]">
                        <i className="ri-bank-line text-gray-600"></i>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{bank.bank} ****{bank.last4}</p>
                        <p className="text-[10px] text-gray-400">{bank.account_name}</p>
                      </div>
                      {bank.primary && (
                        <span className="text-[10px] font-bold text-[#10B981] bg-green-50 px-1.5 py-0.5 rounded-full whitespace-nowrap">Principal</span>
                      )}
                      {selectedBank.id === bank.id && (
                        <i className="ri-checkbox-circle-fill text-[#125C8D] flex-shrink-0"></i>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 pt-0">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer whitespace-nowrap transition-colors">
                Annuler
              </button>
              <button
                onClick={handleSubmit}
                disabled={!isValid}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer whitespace-nowrap transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#125C8D" }}
              >
                Confirmer le retrait
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
