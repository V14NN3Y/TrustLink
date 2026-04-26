import { useState, useEffect } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import WithdrawalModal from "./components/WithdrawalModal";
import { useExchangeRate, convertNGNtoFCFA } from "@/hooks/useExchangeRate";
import { getSellerWallet, initializeSellerMockData } from "@/lib/sharedStorage";

const txnConfig = {
  release:    { icon: "ri-arrow-down-circle-line",  color: "text-[#10B981]",  bg: "bg-[#10B981]/10", sign: "+", typeLabel: "Escrow débloqué" },
  escrow:     { icon: "ri-lock-line",               color: "text-amber-600",   bg: "bg-amber-50",      sign: "-", typeLabel: "Escrow bloqué" },
  withdrawal: { icon: "ri-arrow-up-circle-line",    color: "text-[#FF6A00]",  bg: "bg-[#FF6A00]/10", sign: "-", typeLabel: "Virement" },
  adjustment: { icon: "ri-equalizer-line",          color: "text-gray-500",   bg: "bg-gray-100",      sign: "",  typeLabel: "Ajustement" },
};

const filterTypes = [
  { value: "all", label: "Tous les types" },
  { value: "release", label: "Déblocages" },
  { value: "escrow", label: "Escrow" },
  { value: "withdrawal", label: "Retraits" },
];

export default function WalletPage() {
  const { rate } = useExchangeRate();
  const [showWithdrawal, setShowWithdrawal] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [txnSearch, setTxnSearch] = useState("");
  const [wallet, setWallet] = useState({ balance_ngn: 0, pending_escrow: 0, transactions: [], bank_accounts: [] });

  useEffect(() => {
    initializeSellerMockData();
    const load = () => setWallet(getSellerWallet());
    load();
    window.addEventListener("tl_storage_update", load);
    return () => window.removeEventListener("tl_storage_update", load);
  }, []);

  const filtered = (wallet.transactions || []).filter((t) => {
    const matchType = filterType === "all" || t.type === filterType;
    const matchSearch = txnSearch === "" || t.description.toLowerCase().includes(txnSearch.toLowerCase());
    return matchType && matchSearch;
  });

  const primaryBank = (wallet.bank_accounts || []).find((b) => b.primary);
  const totalIn = (wallet.transactions || []).filter((t) => t.type === "release" && t.status === "completed").reduce((s, t) => s + t.amount_ngn, 0);
  const lastWithdrawal = (wallet.transactions || []).find((t) => t.type === "withdrawal");

  const availableFcfa = convertNGNtoFCFA(wallet.balance_ngn, rate);
  const escrowFcfa = convertNGNtoFCFA(wallet.pending_escrow, rate);

  return (
    <DashboardLayout>
      {/* Top section: Solde + Escrow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Solde Card */}
        <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0E3A4F 0%, #125C8D 60%, #10B981 100%)" }}>
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)", transform: "translate(30%, -30%)" }}></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/20">
                <i className="ri-bank-card-line text-white text-sm"></i>
              </div>
              <div>
                <p className="text-white/70 text-xs font-medium">Solde Disponible</p>
                <p className="text-white/50 text-[10px]">Prêt à retirer</p>
              </div>
            </div>
            <p className="text-4xl font-bold text-white mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
              ₦{wallet.balance_ngn.toLocaleString()}
            </p>
            <p className="text-white/60 text-sm mb-4">≈ FCFA {availableFcfa.toLocaleString("fr-FR")}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowWithdrawal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-[#0E3A4F] text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-bank-line text-sm"></i>Retirer des fonds
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white text-sm font-semibold rounded-lg hover:bg-white/20 transition-colors cursor-pointer whitespace-nowrap">
                <i className="ri-file-list-3-line text-sm"></i>Relevé PDF
              </button>
            </div>
          </div>
        </div>

        {/* Escrow Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-50 flex-shrink-0">
              <i className="ri-lock-2-line text-amber-600 text-sm"></i>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">Fonds en Escrow</p>
              <p className="text-[11px] text-gray-400">En attente de livraison</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
            ₦{wallet.pending_escrow.toLocaleString()}
          </p>
          <p className="text-sm text-gray-400 mb-4">≈ FCFA {escrowFcfa.toLocaleString("fr-FR")}</p>
          {/* Taux live */}
          <div className="flex items-center gap-2 mb-4 p-2 bg-[#F9FAFB] rounded-lg">
            <i className="ri-exchange-line text-[#10B981] text-sm flex-shrink-0"></i>
            <span className="text-xs text-gray-600">
              Taux actuel : <span className="font-bold text-[#10B981]">1 NGN = {rate.toFixed(4)} FCFA</span>
            </span>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-lg px-4 py-2.5 flex items-center gap-2">
            <i className="ri-time-line text-amber-600 text-sm flex-shrink-0"></i>
            <p className="text-xs text-amber-700 font-medium">Débloqué après confirmation de livraison</p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#10B981]/10 flex-shrink-0">
            <i className="ri-money-dollar-circle-line text-[#10B981]"></i>
          </div>
          <div>
            <p className="text-[10px] text-gray-400">Total gagné (NGN)</p>
            <p className="text-sm font-bold text-gray-900">₦{totalIn.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#125C8D]/10 flex-shrink-0">
            <i className="ri-send-plane-line text-[#125C8D]"></i>
          </div>
          <div>
            <p className="text-[10px] text-gray-400">Dernier virement</p>
            <p className="text-sm font-bold text-gray-900">₦{lastWithdrawal?.amount_ngn.toLocaleString()}</p>
            <p className="text-[10px] text-gray-400">{lastWithdrawal?.date}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-purple-50 flex-shrink-0">
            <i className="ri-bank-line text-purple-600"></i>
          </div>
          <div>
            <p className="text-[10px] text-gray-400">Comptes bancaires</p>
            <p className="text-sm font-bold text-gray-900">{(wallet.bank_accounts || []).length} comptes</p>
          </div>
        </div>
      </div>

      {/* Bank Accounts */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900">Comptes bancaires enregistrés</h3>
          <button className="text-xs font-semibold text-[#125C8D] flex items-center gap-1 hover:opacity-70 transition-opacity">
            <i className="ri-add-line"></i>Ajouter un compte
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {wallet.bank_accounts.map((bank) => (
            <div key={bank.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-[#F9FAFB] transition-all">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gray-100 flex-shrink-0">
                <i className="ri-bank-line text-gray-500"></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-800">{bank.bank}</p>
                  {bank.primary && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981]">Défaut</span>
                  )}
                </div>
                <p className="text-[10px] text-gray-400">****{bank.last4}</p>
                <p className="text-[10px] text-gray-400 uppercase">ADEBAYO FASHIONS LTD</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-wrap gap-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Historique des transactions</h3>
            <p className="text-[10px] text-gray-400">{filtered.length} transactions</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
              <input
                type="text"
                placeholder="Rechercher..."
                value={txnSearch}
                onChange={(e) => setTxnSearch(e.target.value)}
                className="border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-700 outline-none w-36 focus:border-[#125C8D] transition-colors"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 outline-none focus:border-[#125C8D] cursor-pointer"
            >
              {filterTypes.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filtered.map((txn) => {
            const cfg = txnConfig[txn.type];
            const fcfaAmount = convertNGNtoFCFA(txn.amount_ngn, rate);
            return (
              <div key={txn.id} className="flex items-center gap-4 px-5 py-4 hover:bg-[#F9FAFB] transition-all">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                  <i className={`${cfg.icon} text-base ${cfg.color}`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{txn.description}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      txn.type === "release" ? "bg-[#10B981]/10 text-[#10B981]" :
                      txn.type === "escrow" ? "bg-amber-50 text-amber-600" :
                      "bg-gray-100 text-gray-500"
                    }`}>{cfg.typeLabel}</span>
                    {txn.order_id && <span className="font-mono text-[10px] text-gray-400">{txn.order_id}</span>}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-bold ${cfg.color}`}>
                    {cfg.sign}₦{txn.amount_ngn.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-gray-400">≈ FCFA {fcfaAmount.toLocaleString("fr-FR")}</p>
                  <p className="text-[10px] text-gray-400">{txn.date}</p>
                  <span className={`text-[10px] font-semibold ${txn.status === "completed" ? "text-[#10B981]" : "text-amber-600"}`}>
                    {txn.status === "completed" ? "Complété" : "En attente"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showWithdrawal && (
        <WithdrawalModal
          availableBalance={wallet.balance_ngn}
          onClose={() => setShowWithdrawal(false)}
        />
      )}
    </DashboardLayout>
  );
}
