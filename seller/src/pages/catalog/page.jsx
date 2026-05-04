import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import ProductCard from "./components/ProductCard";
import EditProductModal from "./components/EditProductModal";
import { useAuth } from "@/lib/AuthContext";
import { useSellerProducts } from "@/hooks/useSellerProducts";
import { supabase } from "@/lib/supabaseClient";
export default function CatalogPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { products, loading, refetch } = useSellerProducts(user?.id);
  const [view, setView] = useState("grid");
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const handleSaveProduct = async (updated) => {
    const { error } = await supabase
      .from("products")
      .update({
        name: updated.name,
        description: updated.description,
        price: updated.price_ngn,
        stock_quantity: updated.stock_total,
        status: updated.status,
      })
      .eq("id", updated.id);
    if (error) {
      alert("Erreur lors de la mise à jour : " + error.message);
      return;
    }
    if (updated.image) {
      const { data: existingImage } = await supabase
        .from("product_images")
        .select("id")
        .eq("product_id", updated.id)
        .eq("is_primary", true)
        .maybeSingle();
      if (existingImage) {
        await supabase.from("product_images").update({ url: updated.image }).eq("id", existingImage.id);
      } else {
        await supabase.from("product_images").insert({ product_id: updated.id, url: updated.image, is_primary: true });
      }
    }
    setEditingProduct(null);
    refetch();
  };
  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    setDeleting(true);
    await supabase.from("product_images").delete().eq("product_id", deletingProduct.id);
    const { error } = await supabase.from("products").delete().eq("id", deletingProduct.id);
    setDeleting(false);
    if (error) {
      alert("Erreur lors de la suppression : " + error.message);
      return;
    }
    setDeletingProduct(null);
    refetch();
  };
  const filtered = products.filter((p) => {
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    const matchSearch =
      search === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category || "").toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });
  const totalStock = products.reduce((sum, p) => sum + (p.stock_total || 0), 0);
  const totalSales = products.reduce((sum, p) => sum + (p.sales_count || 0), 0);
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
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label: "Produits total", value: products.length, icon: "ri-store-2-line", color: "text-[#125C8D]", bg: "bg-[#125C8D]/10" },
          { label: "Actifs", value: products.filter((p) => p.status === "approved").length, icon: "ri-checkbox-circle-line", color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
          { label: "Stock total", value: totalStock, icon: "ri-stack-line", color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Ventes totales", value: totalSales, icon: "ri-bar-chart-line", color: "text-[#FF6A00]", bg: "bg-[#FF6A00]/10" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg}`}>
              <i className={`${s.icon} text-xl ${s.color}`}></i>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{s.label}</p>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-700 outline-none focus:border-[#125C8D] transition-colors"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {["all", "approved", "pending_review", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${filterStatus === s ? "bg-white text-[#125C8D] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              {s === "all" ? "Tous" : s === "approved" ? "Approuvés" : s === "pending_review" ? "En révision" : "Rejetés"}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setView("grid")}
            className={`w-8 h-8 rounded-md flex items-center justify-center cursor-pointer transition-all ${view === "grid" ? "bg-[#125C8D] text-white" : "text-gray-500 hover:text-gray-700"}`}
          >
            <i className="ri-grid-line text-sm"></i>
          </button>
          <button
            onClick={() => setView("list")}
            className={`w-8 h-8 rounded-md flex items-center justify-center cursor-pointer transition-all ${view === "list" ? "bg-[#125C8D] text-white" : "text-gray-500 hover:text-gray-700"}`}
          >
            <i className="ri-list-check text-sm"></i>
          </button>
        </div>
        <button
          onClick={() => navigate("/catalog/new")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer whitespace-nowrap hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "#125C8D" }}
        >
          <i className="ri-add-line"></i>Nouveau produit
        </button>
      </div>
      {/* Grid view */}
      {view === "grid" && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} onEdit={setEditingProduct} onDelete={setDeletingProduct} />
          ))}
        </div>
      )}
      {/* List view */}
      {view === "list" && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-gray-100">
                  {["Produit", "Catégorie", "Prix NGN", "Prix FCFA", "Stock", "Statut", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100 last:border-0 hover:bg-[#F9FAFB] transition-all">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover object-top" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">N/A</div>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-gray-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="text-xs text-gray-500">{product.category || "—"}</span></td>
                    <td className="px-4 py-3"><span className="text-xs font-bold text-[#125C8D]">₦{(product.price_ngn || 0).toLocaleString()}</span></td>
                    <td className="px-4 py-3"><span className="text-xs text-gray-500">{(product.price_fcfa || 0).toLocaleString()} F</span></td>
                    <td className="px-4 py-3"><span className="text-xs font-medium text-gray-700">{product.stock_total}</span></td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                        product.status === "approved" ? "bg-green-50 text-[#10B981]" :
                        product.status === "pending_review" ? "bg-amber-50 text-amber-600" :
                        "bg-gray-100 text-gray-400"
                      }`}>
                        {product.status === "approved" ? "Approuvé" : product.status === "pending_review" ? "En révision" : "Rejeté"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="text-xs font-semibold text-[#125C8D] border border-[#125C8D]/30 px-2.5 py-1.5 rounded-lg hover:bg-[#125C8D]/5 cursor-pointer whitespace-nowrap transition-colors"
                        >
                          <i className="ri-pencil-line mr-1"></i>Modifier
                        </button>
                        <button
                          onClick={() => setDeletingProduct(product)}
                          className="text-xs font-semibold text-red-500 border border-red-200 px-2.5 py-1.5 rounded-lg hover:bg-red-50 cursor-pointer whitespace-nowrap transition-colors"
                        >
                          <i className="ri-delete-bin-line mr-1"></i>Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <i className="ri-inbox-line text-4xl mb-3 block"></i>
          <p className="text-sm">Aucun produit trouvé</p>
        </div>
      )}
      {/* Edit Modal */}
      {editingProduct && (
        <EditProductModal product={editingProduct} onClose={() => setEditingProduct(null)} onSave={handleSaveProduct} />
      )}
      {/* Delete Confirm Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={() => setDeletingProduct(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <i className="ri-delete-bin-line text-red-500 text-xl"></i>
            </div>
            <h3 className="text-base font-bold text-gray-900 text-center mb-2">Supprimer ce produit ?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              <strong>{deletingProduct.name}</strong> sera définitivement supprimé. Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingProduct(null)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 cursor-pointer whitespace-nowrap transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteProduct}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer whitespace-nowrap transition-colors disabled:opacity-50"
                style={{ backgroundColor: "#DC2626" }}
              >
                {deleting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
