import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { mockProducts } from "@/mocks/products";
import ProductCard from "./components/ProductCard";
import EditProductModal from "./components/EditProductModal";
import { getCatalogPending } from "@/lib/sharedStorage";

export default function CatalogPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState(mockProducts);
  const [view, setView] = useState("grid");
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [pendingProductNames, setPendingProductNames] = useState(new Set());

  useEffect(() => {
    const refresh = () => {
      const pending = getCatalogPending();
      setPendingProductNames(new Set(pending.map((p) => p.name)));
    };
    refresh();
    window.addEventListener("tl_storage_update", refresh);
    return () => window.removeEventListener("tl_storage_update", refresh);
  }, []);

  const handleSaveProduct = (updated) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setEditingProduct(null);
  };

  const filtered = products.filter((p) => {
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    const matchSearch = search === "" || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const totalStock = products.reduce((sum, p) => sum + p.stock_total, 0);
  const totalSales = products.reduce((sum, p) => sum + p.sales_count, 0);

  return (
    <DashboardLayout>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label: "Produits total", value: products.length, icon: "ri-store-2-line", color: "text-[#125C8D]", bg: "bg-[#125C8D]/10" },
          { label: "Actifs", value: products.filter((p) => p.status === "active").length, icon: "ri-checkbox-circle-line", color: "text-[#10B981]", bg: "bg-[#10B981]/10" },
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
            style={{ fontFamily: "'Inter', sans-serif" }}
          />
        </div>

        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {["all", "active", "pending", "inactive"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${filterStatus === s ? "bg-white text-[#125C8D] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              {s === "all" ? "Tous" : s === "active" ? "Actifs" : s === "pending" ? "En revision" : "Inactifs"}
            </button>
          ))}
        </div>

        {/* View toggle */}
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
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white cursor-pointer whitespace-nowrap transition-colors hover:opacity-90"
          style={{ backgroundColor: "#125C8D" }}
        >
          <i className="ri-add-line"></i>Nouveau produit
        </button>
      </div>

      {/* Grid view */}
      {view === "grid" && (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={setEditingProduct}
              isPending={pendingProductNames.has(product.name)}
            />
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
                  {["Produit", "Categorie", "Prix NGN", "Prix FCFA", "Stock", "Statut", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100 last:border-0 hover:bg-[#F9FAFB] transition-all">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover object-top" />
                        </div>
                        <span className="text-xs font-semibold text-gray-900">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="text-xs text-gray-500">{product.category}</span></td>
                    <td className="px-4 py-3"><span className="text-xs font-bold text-[#125C8D]">₦{product.price_ngn.toLocaleString()}</span></td>
                    <td className="px-4 py-3"><span className="text-xs text-gray-500">{product.price_fcfa.toLocaleString()} F</span></td>
                    <td className="px-4 py-3"><span className="text-xs font-medium text-gray-700">{product.stock_total}</span></td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                        product.status === "active" ? "bg-green-50 text-[#10B981]" :
                        product.status === "pending" ? "bg-amber-50 text-amber-600" :
                        "bg-gray-100 text-gray-400"
                      }`}>
                        {product.status === "active" ? "Actif" : product.status === "pending" ? "En revision" : "Inactif"}
                      </span>
                      {pendingProductNames.has(product.name) && (
                        <span className="ml-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FF6A00]/10 text-[#FF6A00] whitespace-nowrap">
                          En attente Admin
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="text-xs font-semibold text-[#125C8D] border border-[#125C8D]/30 px-2.5 py-1.5 rounded-lg hover:bg-[#125C8D]/5 cursor-pointer whitespace-nowrap transition-colors"
                      >
                        <i className="ri-pencil-line mr-1"></i>Modifier
                      </button>
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

      {editingProduct && (
        <EditProductModal product={editingProduct} onClose={() => setEditingProduct(null)} onSave={handleSaveProduct} />
      )}
    </DashboardLayout>
  );
}
