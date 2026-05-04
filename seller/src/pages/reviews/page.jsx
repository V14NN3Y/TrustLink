import DashboardLayout from "@/components/feature/DashboardLayout";
import { useAuth } from "@/lib/AuthContext";
import { useSellerReviews } from "@/hooks/useSellerReviews";

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <i
          key={s}
          className={`ri-star-${s <= rating ? "fill" : "line"} text-xs ${
            s <= rating ? "text-amber-400" : "text-gray-300"
          }`}
        ></i>
      ))}
    </div>
  );
}
export default function ReviewsPage() {
  const { user } = useAuth();
  const { reviews, loading, stats } = useSellerReviews(user?.id);
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-[#125C8D] rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
          Avis clients
        </h2>
        <p className="text-sm text-gray-400">Retours et évaluations sur vos produits</p>
      </div>
      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Total avis</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Note moyenne</p>
          <p className="text-2xl font-bold text-[#125C8D]">{stats.avg} <span className="text-sm text-gray-400 font-normal">/ 5</span></p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">5 étoiles</p>
          <p className="text-2xl font-bold text-[#10B981]">{stats.fiveStars}</p>
        </div>
      </div>
      {/* Reviews list */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {reviews.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <i className="ri-star-line text-3xl mb-2 block"></i>
            <p className="text-sm">Aucun avis pour le moment</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {reviews.map((r) => (
              <div key={r.id} className="flex items-start gap-4 px-5 py-4 hover:bg-[#F9FAFB] transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#125C8D]/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-[#125C8D]">
                    {(r.buyer?.full_name || "CL").slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{r.buyer?.full_name || "Client"}</p>
                      <p className="text-[10px] text-gray-400">sur <span className="font-medium text-gray-600">{r.product?.name || "Produit"}</span></p>
                    </div>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                      {new Date(r.created_at).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <StarRating rating={r.rating} />
                  {r.comment && (
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">{r.comment}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
