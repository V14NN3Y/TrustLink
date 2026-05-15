import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import DashboardLayout from "@/components/feature/DashboardLayout";

const statusStyles = {
  pending_review: { label: "En attente", color: "text-amber-600", bg: "bg-amber-50" },
  approved: { label: "Approuvé", color: "text-blue-600", bg: "bg-blue-50" },
  rejected: { label: "Rejeté", color: "text-red-600", bg: "bg-red-50" },
  paid: { label: "Payé", color: "text-green-600", bg: "bg-green-50" },
};

export default function PayoutsPage() {
  const { user } = useAuth();
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0 });

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from("payouts")
      .select("*")
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const list = data || [];
        setPayouts(list);
        setStats({
          total: list.reduce((s, p) => s + Number(p.amount_xof), 0),
          paid: list.filter((p) => p.status === "paid").reduce((s, p) => s + Number(p.amount_xof), 0),
          pending: list.filter((p) => p.status === "pending_review" || p.status === "approved").reduce((s, p) => s + Number(p.amount_xof), 0),
        });
        setLoading(false);
      });
  }, [user]);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Mes paiements</h2>
        <p className="text-sm text-gray-400">Historique de vos demandes de paiement</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Total payé</p>
          <p className="text-2xl font-bold text-green-600">{stats.paid.toLocaleString()} FCFA</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">En attente</p>
          <p className="text-2xl font-bold text-amber-600">{stats.pending.toLocaleString()} FCFA</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Total global</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total.toLocaleString()} FCFA</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-[#125C8D] rounded-full animate-spin"></div>
          </div>
        ) : payouts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <i className="ri-bank-line text-3xl mb-2 block"></i>
            <p className="text-sm">Aucune demande de paiement pour le moment</p>
            <p className="text-xs mt-1">Les paiements sont gérés par l'administration</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Date</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Montant</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Statut</th>
                  <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">Traité le</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => {
                  const s = statusStyles[p.status] || statusStyles.pending_review;
                  return (
                    <tr key={p.id} className="border-b border-gray-100 last:border-0 hover:bg-[#F9FAFB]">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-800">
                          {new Date(p.created_at).toLocaleDateString("fr-FR")}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold text-gray-900">{Number(p.amount_xof).toLocaleString()} FCFA</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${s.bg} ${s.color}`}>{s.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-500">
                          {p.resolved_at ? new Date(p.resolved_at).toLocaleDateString("fr-FR") : "—"}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
