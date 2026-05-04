import { useNavigate } from "react-router-dom";

export default function TopProducts({ products = [] }) {
  const navigate = useNavigate();
  const sorted = [...products]
    .sort((a, b) => (b.sales_count || 0) - (a.sales_count || 0))
    .slice(0, 5);
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>Top Produits</h3>
        <button
          onClick={() => navigate("/catalog")}
          className="text-[10px] font-semibold text-[#125C8D] hover:underline cursor-pointer whitespace-nowrap"
        >
          Voir catalogue
        </button>
      </div>
      <div className="space-y-3">
        {sorted.map((product, idx) => (
          <div
            key={product.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F9FAFB] transition-all cursor-pointer"
            onClick={() => navigate("/catalog")}
          >
            <span className="text-[10px] font-bold text-gray-300 w-4 flex-shrink-0 text-center">#{idx + 1}</span>
            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover object-top" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">N/A</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{product.name}</p>
              <p className="text-[10px] text-gray-400">
                {(product.sales_count || 0)} vendus &bull; Stock : {product.stock_total || 0}
              </p>
            </div>
            <p className="text-xs font-bold text-[#10B981] whitespace-nowrap flex-shrink-0">
              ₦{(product.price_ngn || 0).toLocaleString()}
            </p>
          </div>
        ))}
        {sorted.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">Aucun produit vendu pour l'instant</p>
        )}
      </div>
    </div>
  );
}
