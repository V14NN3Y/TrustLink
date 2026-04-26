import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { submitProductToCatalog, getSharedRate } from "@/lib/sharedStorage";
import { useExchangeRate } from "@/hooks/useExchangeRate";
import { hexToColorName } from "@/lib/utils";

const PLATFORM_FEE = 0.05;
const EXCHANGE_FEE = 0.025;
const SELLER_ID = "adebayo-fashions";
const SELLER_NAME = "Adebayo Fashions";

const initialForm = {
  name: "",
  category: "",
  description: "",
  price_ngn: 0,
  price_fcfa: 0,
  image: "",
  status: "active",
  stock_total: 0,
  variants: [],
};

export default function NewProductPage() {
  const navigate = useNavigate();
  const { rate } = useExchangeRate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [saved, setSaved] = useState(false);

  // Calcul FCFA dynamique avec taux live
  function calcFcfa(ngn) {
    const { rate: storedRate } = getSharedRate();
    return Math.round(ngn * (1 + PLATFORM_FEE + EXCHANGE_FEE) * storedRate);
  }

  const handleChange = (key, value) => {
    if (key === "price_ngn") {
      const ngn = Number(value);
      setForm((prev) => ({ ...prev, price_ngn: ngn, price_fcfa: calcFcfa(ngn) }));
    } else {
      setForm((prev) => ({ ...prev, [key]: value }));
    }
  };

  const addVariant = () => {
    setForm((prev) => ({
      ...prev,
      variants: [...prev.variants, { size: "", color: hexToColorName("#888888"), color_hex: "#888888", stock: 0 }],
    }));
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

  const handleSubmit = () => {
    const { rate: storedRate } = getSharedRate();
    const sharedProduct = {
      id: `prod-seller-${Date.now()}`,
      seller_id: SELLER_ID,
      seller_name: SELLER_NAME,
      name: form.name,
      category: form.category,
      price_ngn: form.price_ngn,
      price_xof: Math.round(form.price_ngn * storedRate),
      stock: form.variants.reduce((s, v) => s + (Number(v.stock) || 0), 0) || form.stock_total,
      images: form.image ? [form.image] : [],
      description: form.description,
      submitted_at: new Date().toISOString(),
      status: "pending",
    };
    submitProductToCatalog(sharedProduct);
    setSaved(true);
    setTimeout(() => navigate("/catalog"), 2500);
  };

  const canNext1 = form.name.trim() && form.category.trim();
  const canNext2 = form.price_ngn > 0;

  if (saved) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-[#10B981]/10 mb-4">
            <i className="ri-check-double-line text-[#10B981] text-3xl"></i>
          </div>
          <h2 className="text-gray-900 font-bold text-xl mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Produit soumis !
          </h2>
          <p className="text-gray-400 text-sm text-center max-w-xs mb-4">
            Votre produit est en attente de validation par l'équipe TrustLink. Il sera visible sur la Marketplace après approbation.
          </p>
          <div className="flex items-center gap-2 bg-[#FF6A00]/10 border border-[#FF6A00]/20 rounded-xl px-4 py-3">
            <i className="ri-time-line text-[#FF6A00] text-sm"></i>
            <p className="text-[#FF6A00] text-xs font-medium">Délai de validation : 24-48h ouvrées</p>
          </div>
          <p className="text-gray-400 text-xs mt-4">Redirection vers le catalogue...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Progress */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                s < step ? "text-white" : s === step ? "text-white" : "text-gray-400 bg-gray-100"
              }`}
              style={s < step ? { backgroundColor: "#10B981" } : s === step ? { backgroundColor: "#125C8D" } : {}}
            >
              {s < step ? <i className="ri-check-line"></i> : s}
            </div>
            {s < 3 && <div className={`w-16 h-px mx-2 ${s < step ? "bg-[#10B981]" : "bg-gray-200"}`}></div>}
          </div>
        ))}
      </div>

      <div className="max-w-2xl mx-auto bg-white rounded-xl border border-gray-100 p-6">
        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Informations de base
            </h2>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 block mb-2">Nom du produit *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Ex: Agbada Premium Brodé"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#125C8D] transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 block mb-2">Catégorie *</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => handleChange("category", e.target.value)}
                placeholder="Ex: Mode, Electronique, Beauté..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#125C8D] transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 block mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => { if (e.target.value.length <= 500) handleChange("description", e.target.value); }}
                rows={4}
                placeholder="Décrivez votre produit..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#125C8D] transition-colors resize-none"
              />
              <p className="text-gray-400 text-[10px] text-right mt-1">{form.description.length}/500</p>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Prix et stock
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 block mb-2">Prix NGN ₦ *</label>
                <input
                  type="number"
                  value={form.price_ngn || ""}
                  onChange={(e) => handleChange("price_ngn", e.target.value)}
                  placeholder="0"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-bold text-[#125C8D] outline-none focus:border-[#125C8D] transition-colors"
                  min={0}
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 block mb-2">
                  Prix FCFA acheteur (taux {rate.toFixed(4)})
                </label>
                <div className="border border-gray-100 rounded-lg px-3 py-2.5 bg-[#F9FAFB] text-sm font-bold text-[#10B981]">
                  {form.price_fcfa.toLocaleString("fr-FR")} F
                </div>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 block mb-2">Stock total</label>
              <input
                type="number"
                value={form.stock_total || ""}
                onChange={(e) => handleChange("stock_total", Number(e.target.value))}
                placeholder="0"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#125C8D] transition-colors"
                min={0}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Variantes</label>
                <button onClick={addVariant} className="text-[10px] font-semibold text-[#125C8D] border border-[#125C8D]/30 px-2 py-1 rounded-lg hover:bg-[#125C8D]/5 cursor-pointer whitespace-nowrap">
                  <i className="ri-add-line mr-1"></i>Ajouter
                </button>
              </div>
              <div className="space-y-2">
                {form.variants.map((v, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-[#F9FAFB] border border-gray-100 rounded-lg hover:shadow-sm transition-shadow">
                    <input type="text" value={v.size} onChange={(e) => handleVariantChange(idx, "size", e.target.value)} placeholder="Taille" className="flex-1 border border-gray-200 bg-white rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#125C8D] transition-colors" />
                    
                    <div className="flex items-center flex-1 gap-2 bg-white border border-gray-200 rounded-lg px-2 py-1.5 focus-within:border-[#125C8D] transition-colors">
                      <div className="w-3.5 h-3.5 rounded-full border border-gray-300 overflow-hidden relative flex-shrink-0 cursor-pointer shadow-none" title="Choisir la couleur (Hex)" style={{ outline: `1px solid ${v.color_hex || '#888888'}`, outlineOffset: '1px' }}>
                        <input type="color" value={v.color_hex || "#888888"} onChange={(e) => handleVariantChange(idx, "color_hex", e.target.value)} className="absolute -top-2 -left-2 w-8 h-8 cursor-pointer" />
                      </div>
                      <input type="text" value={v.color} onChange={(e) => handleVariantChange(idx, "color", e.target.value)} placeholder="Couleur" className="w-full text-xs outline-none bg-transparent" />
                    </div>

                    <input type="number" value={v.stock} onChange={(e) => handleVariantChange(idx, "stock", Number(e.target.value))} placeholder="Stock" className="w-16 border border-gray-200 bg-white rounded-lg px-2 py-1.5 text-xs outline-none focus:border-[#125C8D] transition-colors" min={0} />
                  </div>
                ))}
                {form.variants.length === 0 && <p className="text-xs text-gray-400 text-center py-3">Aucune variante ajoutée</p>}
              </div>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Image et publication
            </h2>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 block mb-2">URL de l'image</label>
              <input
                type="text"
                value={form.image}
                onChange={(e) => handleChange("image", e.target.value)}
                placeholder="https://..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#125C8D] transition-colors"
              />
              {form.image && (
                <div className="mt-3 w-32 h-32 rounded-xl overflow-hidden border border-gray-200">
                  <img src={form.image} alt="preview" className="w-full h-full object-cover object-top" />
                </div>
              )}
            </div>
            {/* Summary */}
            <div className="bg-[#F9FAFB] rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Récapitulatif</h4>
              <div className="flex justify-between text-xs"><span className="text-gray-500">Nom</span><span className="font-semibold text-gray-900">{form.name || "—"}</span></div>
              <div className="flex justify-between text-xs"><span className="text-gray-500">Catégorie</span><span className="font-semibold text-gray-900">{form.category || "—"}</span></div>
              <div className="flex justify-between text-xs"><span className="text-gray-500">Prix NGN</span><span className="font-bold text-[#125C8D]">₦{form.price_ngn.toLocaleString()}</span></div>
              <div className="flex justify-between text-xs"><span className="text-gray-500">Prix FCFA acheteur</span><span className="font-bold text-[#10B981]">{form.price_fcfa.toLocaleString("fr-FR")} F</span></div>
              <div className="flex justify-between text-xs"><span className="text-gray-500">Stock</span><span className="font-semibold text-gray-900">{form.stock_total}</span></div>
              <div className="flex justify-between text-xs"><span className="text-gray-500">Variantes</span><span className="font-semibold text-gray-900">{form.variants.length}</span></div>
              <div className="flex justify-between text-xs"><span className="text-gray-500">Taux appliqué</span><span className="font-semibold text-[#10B981]">{rate.toFixed(4)}</span></div>
            </div>
            {/* Info admin validation */}
            <div className="flex items-start gap-2 p-3 bg-[#FF6A00]/5 border border-[#FF6A00]/20 rounded-xl">
              <i className="ri-information-line text-[#FF6A00] text-sm flex-shrink-0 mt-0.5"></i>
              <p className="text-xs text-[#FF6A00] font-medium">
                Tous les produits sont soumis à validation Admin avant publication sur la Marketplace (24-48h).
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100">
          {step > 1 && (
            <button onClick={() => setStep((s) => s - 1)} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer whitespace-nowrap transition-colors">
              Précédent
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 1 ? !canNext1 : !canNext2}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer whitespace-nowrap transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#125C8D" }}
            >
              Suivant
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer whitespace-nowrap transition-colors hover:opacity-90"
              style={{ backgroundColor: "#10B981" }}
            >
              <i className="ri-send-plane-line mr-1.5"></i>Soumettre pour validation
            </button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
