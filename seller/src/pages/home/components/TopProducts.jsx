import { useNavigate } from "react-router-dom";
import { mockTopProducts } from "@/mocks/seller";

export default function TopProducts() {
  const navigate = useNavigate();

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
        {mockTopProducts.map((product, idx) => (
          <div
            key={product.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F9FAFB] transition-all cursor-pointer"
            onClick={() => navigate("/catalog")}
          >
            <span className="text-[10px] font-bold text-gray-300 w-4 flex-shrink-0 text-center">#{idx + 1}</span>
            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{product.name}</p>
              <p className="text-[10px] text-gray-400">
                {product.sales} vendus &bull; Stock : {product.stock}
              </p>
            </div>
            <p className="text-xs font-bold text-[#10B981] whitespace-nowrap flex-shrink-0">
              ₦{(product.revenue / 1000000).toFixed(0)}M
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
