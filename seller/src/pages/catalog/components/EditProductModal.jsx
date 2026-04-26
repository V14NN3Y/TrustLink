import { useState } from "react";
import { calculateFCFA } from "@/mocks/products";
import { hexToColorName } from "@/lib/utils";

export default function EditProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState({ ...product });

  const handleChange = (key, value) => {
    if (key === "price_ngn") {
      const ngn = Number(value);
      setForm((prev) => ({ ...prev, price_ngn: ngn, price_fcfa: calculateFCFA(ngn) }));
    } else {
      setForm((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleVariantChange = (idx, key, value) => {
    const updated = form.variants.map((v, i) => {
      if (i !== idx) return v;
      const newV = { ...v, [key]: value };
      if (key === "color_hex") {
        newV.color = hexToColorName(value);
      }
      return newV;
    });
    setForm((prev) => ({ ...prev, variants: updated }));
  };

  const removeVariant = (idx) => {
    setForm((prev) => ({ ...prev, variants: prev.variants.filter((_, i) => i !== idx) }));
  };

  const addVariant = () => {
    setForm((prev) => ({
      ...prev,
      variants: [...prev.variants, { size: "", color: hexToColorName("#888888"), color_hex: "#888888", stock: 0 }],
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Modifier &ldquo;{product.name}&rdquo;
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 cursor-pointer">
            <i className="ri-close-line text-lg"></i>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Image */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 block mb-2">Image URL</label>
            <div className="flex gap-3 items-start">
              <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                <img src={form.image} alt="preview" className="w-full h-full object-cover object-top" />
              </div>
              <input
                type="text"
                value={form.image}
                onChange={(e) => handleChange("image", e.target.value)}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#125C8D] transition-colors"
                style={{ fontFamily: "'Inter', sans-serif" }}
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Name + Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 block mb-2">Nom produit</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#125C8D] transition-colors"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 block mb-2">Catégorie</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => handleChange("category", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#125C8D] transition-colors"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 block mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => { if (e.target.value.length <= 500) handleChange("description", e.target.value); }}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#125C8D] transition-colors resize-none"
              style={{ fontFamily: "'Inter', sans-serif" }}
            />
            <p className="text-gray-400 text-[10px] text-right mt-1">{form.description.length}/500</p>
          </div>

          {/* Prix */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 block mb-2">Prix NGN ₦</label>
              <input
                type="number"
                value={form.price_ngn}
                onChange={(e) => handleChange("price_ngn", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-[#125C8D] outline-none focus:border-[#125C8D] transition-colors"
                style={{ fontFamily: "'Inter', sans-serif" }}
                min={0}
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 block mb-2">Prix FCFA (calculé auto)</label>
              <div className="border border-gray-100 rounded-lg px-3 py-2 bg-[#F9FAFB] text-sm font-bold text-[#10B981]">
                {form.price_fcfa.toLocaleString()} FCFA
              </div>
            </div>
          </div>

          {/* Statut */}
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 block mb-2">Statut</label>
            <select
              value={form.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#125C8D] transition-colors cursor-pointer"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
              <option value="pending">En révision</option>
            </select>
          </div>

          {/* Variantes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Variantes</label>
              <button
                onClick={addVariant}
                className="text-[10px] font-semibold text-[#125C8D] border border-[#125C8D]/30 px-2 py-1 rounded-lg hover:bg-[#125C8D]/5 cursor-pointer whitespace-nowrap transition-colors"
              >
                <i className="ri-add-line mr-1"></i>Ajouter
              </button>
            </div>
            <div className="space-y-2">
              {form.variants.map((v, idx) => (
                <div key={idx} className="flex items-center gap-2 p-3 bg-[#F9FAFB] border border-gray-100 rounded-lg hover:shadow-sm transition-shadow">
                  <input
                    type="text"
                    value={v.size}
                    onChange={(e) => handleVariantChange(idx, "size", e.target.value)}
                    placeholder="Taille"
                    className="flex-1 border border-gray-200 bg-white rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#125C8D] transition-colors"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  />
                  
                  <div className="flex items-center flex-1 gap-2 bg-white border border-gray-200 rounded-lg px-2 py-1.5 focus-within:border-[#125C8D] transition-colors">
                    <div className="w-3.5 h-3.5 rounded-full border border-gray-300 overflow-hidden relative flex-shrink-0 cursor-pointer shadow-none" title="Choisir la couleur (Hex)" style={{ outline: `1px solid ${v.color_hex || '#888888'}`, outlineOffset: '1px' }}>
                      <input type="color" value={v.color_hex || "#888888"} onChange={(e) => handleVariantChange(idx, "color_hex", e.target.value)} className="absolute -top-2 -left-2 w-8 h-8 cursor-pointer" />
                    </div>
                    <input
                      type="text"
                      value={v.color}
                      onChange={(e) => handleVariantChange(idx, "color", e.target.value)}
                      placeholder="Couleur"
                      className="w-full text-xs outline-none bg-transparent"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    />
                  </div>

                  <input
                    type="number"
                    value={v.stock}
                    onChange={(e) => handleVariantChange(idx, "stock", Number(e.target.value))}
                    placeholder="Stock"
                    className="w-16 border border-gray-200 bg-white rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#125C8D] transition-colors"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                    min={0}
                  />
                  <button
                    onClick={() => removeVariant(idx)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 cursor-pointer flex-shrink-0"
                    title="Supprimer la variante"
                  >
                    <i className="ri-close-line text-xs"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer whitespace-nowrap transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={() => onSave(form)}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer whitespace-nowrap transition-colors"
            style={{ backgroundColor: "#125C8D" }}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
