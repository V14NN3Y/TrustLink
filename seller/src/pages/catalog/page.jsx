import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import ProductCard from "./components/ProductCard";
import EditProductModal from "./components/EditProductModal";
import ImportCSVModal from "./components/ImportCSVModal";
import { useAuth } from "@/lib/AuthContext";
import { useSellerProducts } from "@/hooks/useSellerProducts";
import { useSellerLog } from "@/hooks/useSellerLog";
import { useCurrency } from "@/hooks/useCurrency";
import { supabase } from "@/lib/supabaseClient";
import { exportToCSV } from "@/lib/export";
import { useLocale } from "@/lib/i18n";
import { toast } from "@/components/ui/use-toast";

export default function CatalogPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, locale } = useLocale();
  const { products, loading, refetch } = useSellerProducts(user?.id);
  const { logAction } = useSellerLog();
  const { formatPrice } = useCurrency();
  const [view, setView] = useState("grid");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStock, setFilterStock] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [quickEditId, setQuickEditId] = useState(null);
  const [editValues, setEditValues] = useState({ name: "", price: "" });
  const [savingQuick, setSavingQuick] = useState(false);

  const handleSaveProduct = async (updated) => {
    const { error } = await supabase
      .from("products")
      .update({
        name: updated.name,
        description: updated.description,
        price: updated.price_fcfa,
        stock_quantity: updated.stock_total,
        status: updated.status,
      })
      .eq("id", updated.id);
    if (error) {
      toast({ title: "Erreur", description: "Erreur lors de la mise à jour : " + error.message, variant: "destructive" });
      return;
    }
    if (updated.image) {
      try {
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
      } catch (err) {
        console.error("Error updating product image:", err);
      }
    }
    setEditingProduct(null);
    logAction("edit_product", { product_id: updated.id, product_name: updated.name });
    refetch();
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;
    setDeleting(true);
    await supabase.from("product_images").delete().eq("product_id", deletingProduct.id);
    const { error } = await supabase.from("products").delete().eq("id", deletingProduct.id);
    setDeleting(false);
    if (error) {
      toast({ title: "Erreur", description: "Erreur lors de la suppression : " + error.message, variant: "destructive" });
      return;
    }
    logAction("delete_product", { product_id: deletingProduct.id, product_name: deletingProduct.name });
    setDeletingProduct(null);
    refetch();
  };

  const startQuickEdit = (product) => {
    setQuickEditId(product.id);
    setEditValues({ name: product.name, price: String(product.price_fcfa) });
  };

  const cancelQuickEdit = () => {
    setQuickEditId(null);
    setEditValues({ name: "", price: "" });
  };

  const saveQuickEdit = async (productId) => {
    setSavingQuick(true);
    const price = parseFloat(editValues.price);
    if (!editValues.name.trim() || isNaN(price) || price <= 0) {
      toast({ title: "Erreur", description: "Veuillez entrer un nom valide et un prix supérieur à 0.", variant: "destructive" });
      setSavingQuick(false);
      return;
    }
    const { error } = await supabase
      .from("products")
      .update({ name: editValues.name.trim(), price })
      .eq("id", productId);
    setSavingQuick(false);
    if (error) {
      toast({ title: "Erreur", description: "Erreur : " + error.message, variant: "destructive" });
      return;
    }
    logAction("quick_edit_product", { product_id: productId, name: editValues.name, price });
    setQuickEditId(null);
    refetch();
  };

  const availableCategories = Array.from(
    new Set(products.map((p) => p.category).filter((c) => c && c !== "—"))
  );

  const filtered = products
    .filter((p) => {
      const matchStatus = filterStatus === "all" || p.status === filterStatus;
      const matchCategory = filterCategory === "all" || p.category === filterCategory;
      const matchStock =
        filterStock === "all" ||
        (filterStock === "in_stock" && (p.stock_total || 0) > 0) ||
        (filterStock === "low_stock" && (p.stock_total || 0) > 0 && (p.stock_total || 0) <= 5) ||
        (filterStock === "out_of_stock" && (p.stock_total || 0) === 0);
      const matchSearch =
        search === "" ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.category || "").toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchCategory && matchStock && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === "price_asc") return a.price_fcfa - b.price_fcfa;
      if (sortBy === "price_desc") return b.price_fcfa - a.price_fcfa;
      if (sortBy === "sales") return (b.sales_count || 0) - (a.sales_count || 0);
      if (sortBy === "stock") return (b.stock_total || 0) - (a.stock_total || 0);
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

  const totalStock = products.reduce((sum, p) => sum + (p.stock_total || 0), 0);
  const totalSales = products.reduce((sum, p) => sum + (p.sales_count || 0), 0);

  const handleExport = () => {
    exportToCSV(
      filtered,
      "produits",
      [
        { label: "Nom", accessor: (p) => p.name },
        { label: "Categorie", accessor: (p) => p.category },
        { label: "Prix FCFA", accessor: (p) => p.price_fcfa },
        { label: "Stock", accessor: (p) => p.stock_total },
        { label: "Statut", accessor: (p) => p.status },
      ]
    );
    logAction("export_products_csv", { count: filtered.length });
  };

  const statusLabels = {
    all: t('catalog.all'),
    approved: t('catalog.approved'),
    pending_review: t('catalog.pendingReview'),
    rejected: t('catalog.rejected'),
    draft: t('catalog.drafts'),
  };

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
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-5">
        {[
          { label: t('catalog.statTotal'), value: products.length, icon: "ri-store-2-line", color: "text-[#125C8D]", bg: "bg-[#125C8D]/10" },
          { label: t('catalog.statActive'), value: products.filter((p) => p.status === "approved").length, icon: "ri-checkbox-circle-line", color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
          { label: t('catalog.statDrafts'), value: products.filter((p) => p.status === "draft").length, icon: "ri-file-edit-line", color: "text-gray-500", bg: "bg-gray-100" },
          { label: t('catalog.statStock'), value: totalStock, icon: "ri-stack-line", color: "text-amber-600", bg: "bg-amber-50" },
          { label: t('catalog.statSales'), value: totalSales, icon: "ri-bar-chart-line", color: "text-[#FF6A00]", bg: "bg-[#FF6A00]/10" },
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
              placeholder={t('catalog.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-700 outline-none focus:border-[#125C8D] transition-colors"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {["all", "approved", "pending_review", "rejected", "draft"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${filterStatus === s ? "bg-white text-[#125C8D] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              {statusLabels[s]}
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
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-[#125C8D] border border-[#125C8D] cursor-pointer whitespace-nowrap hover:bg-[#125C8D]/5 transition-colors"
        >
          <i className="ri-download-line"></i>{t('catalog.exportCSV')}
        </button>
        <button
          onClick={() => setImportOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer whitespace-nowrap hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "#10B981" }}
        >
          <i className="ri-upload-line"></i>{t('catalog.importCSV')}
        </button>
        <button
          onClick={() => navigate("/catalog/new")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer whitespace-nowrap hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "#125C8D" }}
        >
          <i className="ri-add-line"></i>{t('catalog.newProduct')}
        </button>
        {/* Advanced Filters */}
        <div className="flex items-center gap-2 flex-wrap w-full pt-1">
          {availableCategories.length > 0 && (
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 bg-white outline-none focus:border-[#125C8D] cursor-pointer"
            >
              <option value="all">Toutes les catégories ({availableCategories.length})</option>
              {availableCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}

          <select
            value={filterStock}
            onChange={(e) => setFilterStock(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 bg-white outline-none focus:border-[#125C8D] cursor-pointer"
          >
            <option value="all">Tous les stocks</option>
            <option value="in_stock">En stock ({products.filter(p => (p.stock_total || 0) > 0).length})</option>
            <option value="low_stock">Stock faible (≤ 5)</option>
            <option value="out_of_stock">Rupture de stock ({products.filter(p => (p.stock_total || 0) === 0).length})</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 bg-white outline-none focus:border-[#125C8D] cursor-pointer"
          >
            <option value="newest">Plus récents</option>
            <option value="price_asc">Prix : croissant</option>
            <option value="price_desc">Prix : décroissant</option>
            <option value="sales">Meilleures ventes</option>
            <option value="stock">Stock disponible</option>
          </select>

          {(filterStatus !== "all" || filterCategory !== "all" || filterStock !== "all" || search !== "") && (
            <button
              onClick={() => {
                setFilterStatus("all");
                setFilterCategory("all");
                setFilterStock("all");
                setSearch("");
              }}
              className="px-2.5 py-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <i className="ri-close-circle-line text-sm" /> Réinitialiser filtres
            </button>
          )}

          <span className="text-xs text-gray-400 ml-auto font-medium">
            {filtered.length} produit{filtered.length > 1 ? "s" : ""} affiché{filtered.length > 1 ? "s" : ""}
          </span>
        </div>
      </div>
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
                  {[t('stats.colProduct'), t('catalog.summaryCategory'), t('catalog.summaryPrice'), t('catalog.summaryStock'), t('common.status'), t('orders.colActions')].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100 last:border-0 hover:bg-[#F9FAFB] transition-all">
                    <td className="px-4 py-3">
                      {quickEditId === product.id ? (
                        <input
                          value={editValues.name}
                          onChange={(e) => setEditValues(v => ({ ...v, name: e.target.value }))}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-xs font-semibold text-gray-900 outline-none focus:border-[#125C8D]"
                        />
                      ) : (
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
                      )}
                    </td>
                    <td className="px-4 py-3"><span className="text-xs text-gray-500">{product.category || "—"}</span></td>
                    <td className="px-4 py-3">
                      {quickEditId === product.id ? (
                        <input
                          type="number"
                          value={editValues.price}
                          onChange={(e) => setEditValues(v => ({ ...v, price: e.target.value }))}
                          className="w-28 border border-gray-300 rounded px-2 py-1 text-xs font-bold text-gray-900 outline-none focus:border-[#125C8D]"
                        />
                      ) : (
                        <span className="text-xs font-bold text-[#125C8D]">{formatPrice(product.price_fcfa)}</span>
                      )}
                    </td>
                    <td className="px-4 py-3"><span className="text-xs font-medium text-gray-700">{product.stock_total}</span></td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                        product.status === "approved" ? "bg-green-50 text-[#10B981]" :
                        product.status === "pending_review" ? "bg-amber-50 text-amber-600" :
                        product.status === "draft" ? "bg-gray-100 text-gray-500" :
                        "bg-gray-100 text-gray-400"
                      }`}>
                        {product.status === "approved" ? t('catalog.approved') : product.status === "pending_review" ? t('catalog.pendingReview') : product.status === "draft" ? t('catalog.drafts') : t('catalog.rejected')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {quickEditId === product.id ? (
                          <>
                            <button
                              onClick={() => saveQuickEdit(product.id)}
                              disabled={savingQuick}
                              className="text-xs font-semibold text-white bg-[#125C8D] px-2.5 py-1.5 rounded-lg hover:opacity-90 cursor-pointer whitespace-nowrap transition-colors disabled:opacity-50"
                            >
                              {savingQuick ? "..." : t('common.save')}
                            </button>
                            <button
                              onClick={cancelQuickEdit}
                              className="text-xs font-semibold text-gray-500 border border-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer whitespace-nowrap transition-colors"
                            >
                              {t('common.cancel')}
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startQuickEdit(product)}
                              className="text-xs font-semibold text-gray-500 border border-gray-200 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer whitespace-nowrap transition-colors"
                              title={t('catalog.quickEdit')}
                            >
                              <i className="ri-pencil-line"></i>
                            </button>
                            <button
                              onClick={() => setEditingProduct(product)}
                              className="text-xs font-semibold text-[#125C8D] border border-[#125C8D]/30 px-2.5 py-1.5 rounded-lg hover:bg-[#125C8D]/5 cursor-pointer whitespace-nowrap transition-colors"
                            >
                              <i className="ri-settings-4-line mr-1"></i>{t('common.edit')}
                            </button>
                            <button
                              onClick={() => setDeletingProduct(product)}
                              className="text-xs font-semibold text-red-500 border border-red-200 px-2.5 py-1.5 rounded-lg hover:bg-red-50 cursor-pointer whitespace-nowrap transition-colors"
                            >
                              <i className="ri-delete-bin-line mr-1"></i>{t('common.delete')}
                            </button>
                          </>
                        )}
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
          <p className="text-sm">{t('catalog.noProducts')}</p>
        </div>
      )}
      {/* Import CSV Modal */}
      {importOpen && (
        <ImportCSVModal onClose={() => setImportOpen(false)} onImported={() => { refetch(); logAction("import_products_csv", {}); }} />
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
            <h3 className="text-base font-bold text-gray-900 text-center mb-2">{t('catalog.confirmDeleteTitle')}</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              <strong>{deletingProduct.name}</strong> {t('catalog.confirmDeleteDesc')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingProduct(null)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 cursor-pointer whitespace-nowrap transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleDeleteProduct}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer whitespace-nowrap transition-colors disabled:opacity-50"
                style={{ backgroundColor: "#DC2626" }}
              >
                {deleting ? t('common.deleting') : t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
