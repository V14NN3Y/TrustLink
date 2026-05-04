const statusConfig = {
  approved:       { label: "Approuvé",      bg: "bg-green-50",  color: "text-[#10B981]" },
  pending_review: { label: "En révision",   bg: "bg-amber-50",  color: "text-amber-600" },
  rejected:       { label: "Rejeté",        bg: "bg-red-50",    color: "text-red-500" },
};

export default function ProductCard({ product, onEdit, onDelete }) {
  const cfg = statusConfig[product.status] || statusConfig.approved;
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden group relative cursor-pointer">
      {/* Image */}
      <div className="aspect-square overflow-hidden bg-gray-50 relative">
        <img
          src={product.image || "/placeholder.png"}
          alt={product.name}
          className="w-full h-full object-cover object-top"
        />
        {/* Status badge */}
        <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
          {cfg.label}
        </span>
        {/* Action buttons */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all flex gap-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(product); }}
            className="bg-white border border-gray-200 text-[#125C8D] text-xs font-semibold px-2.5 py-1.5 rounded-lg cursor-pointer whitespace-nowrap hover:bg-gray-50 transition-colors"
          >
            <i className="ri-pencil-line mr-1"></i>Modifier
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(product); }}
            className="bg-white border border-red-200 text-red-500 text-xs font-semibold px-2.5 py-1.5 rounded-lg cursor-pointer whitespace-nowrap hover:bg-red-50 transition-colors"
          >
            <i className="ri-delete-bin-line mr-1"></i>Supprimer
          </button>
        </div>
      </div>
      {/* Info */}
      <div className="p-4">
        <p className="text-sm font-semibold text-gray-900 truncate mb-0.5">{product.name}</p>
        <p className="text-[10px] text-gray-400 mb-2">{product.category}</p>
        <p className="text-sm font-bold text-[#125C8D]">₦{product.price_ngn.toLocaleString()}</p>
        <p className="text-[10px] text-gray-400">{product.price_fcfa.toLocaleString()} FCFA</p>
        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-gray-100">
          <span className="text-[10px] text-gray-500">Stock : <strong className="text-gray-700">{product.stock_total}</strong></span>
          <span className="text-[10px] text-gray-500">Ventes : <strong className="text-gray-700">{product.sales_count}</strong></span>
        </div>
      </div>
    </div>
  );
}
