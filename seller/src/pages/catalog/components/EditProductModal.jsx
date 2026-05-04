import { useState } from "react";
import { useExchangeRate } from "@/hooks/useExchangeRate";

export default function EditProductModal({ product, onClose, onSave }) {
  const rate = useExchangeRate();
  const [form, setForm] = useState({ ...product, price_fcfa: Math.round((product.price_ngn || 0) * rate) });
  const [saving, setSaving] = useState(false);
   const handleChange = (key, value) => {
    if (key === "price_ngn") {
      const ngn = Number(value) || 0;
      setForm((prev) => ({ ...prev, price_ngn: ngn, price_fcfa: Math.round(ngn * rate) }));
    } else {
      setForm((prev) => ({ ...prev, [key]: value }));
    }
  };
  const handleSubmit = () => {
    setSaving(true);
    onSave(form);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Modifier le produit
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 cursor-pointer">
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 block mb-1.5">Nom du produit</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#125C8D]"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 block mb-1.5">Description</label>
            <textarea
              value={form.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#125C8D] resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 block mb-1.5">Prix NGN (₦)</label>
              <input
                type="number"
                value={form.price_ngn}
                onChange={(e) => handleChange("price_ngn", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#125C8D]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 block mb-1.5">Prix FCFA (calculé)</label>
              <input
                type="text"
                value={form.price_fcfa}
                readOnly
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500 bg-gray-50 outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 block mb-1.5">Stock total</label>
              <input
                type="number"
                value={form.stock_total}
                onChange={(e) => handleChange("stock_total", Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#125C8D]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 block mb-1.5">Statut</label>
              <select
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#125C8D] bg-white"
              >
                <option value="pending_review">En révision</option>
                <option value="approved">Approuvé</option>
                <option value="rejected">Rejeté</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 block mb-1.5">Image (URL)</label>
            <input
              type="text"
              value={form.image || ""}
              onChange={(e) => handleChange("image", e.target.value)}
              placeholder="https://..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#125C8D]"
            />
            {form.image && (
              <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden border border-gray-100">
                <img src={form.image} alt="Preview" className="w-full h-full object-cover object-top" />
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 cursor-pointer whitespace-nowrap transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer whitespace-nowrap transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "#125C8D" }}
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Sauvegarde...
              </span>
            ) : (
              <><i className="ri-save-line mr-1.5"></i>Sauvegarder</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
