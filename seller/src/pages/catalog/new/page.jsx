import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/AuthContext";

const initialForm = {
  name: "",
  category_id: "",
  description: "",
  price_ngn: 0,
  price_fcfa: 0,
  image: "",
  status: "pending_review",
  stock_total: 0,
  variants: [],
};

export default function NewProductPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(0.89);

  const [categories, setCategories] = useState([]);
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from("categories").select("id,name");
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);
  // Récupère le vrai taux au montage
  useEffect(() => {
    const fetchRate = async () => {
      const { data } = await supabase
        .from("exchange_rates")
        .select("rate")
        .eq("from_currency", "NGN")
        .eq("to_currency", "XOF")
        .maybeSingle();
      if (data?.rate) setExchangeRate(data.rate);
    };
    fetchRate();
  }, []);
  const handleChange = (key, value) => {
    if (key === "price_ngn") {
      const ngn = Number(value) || 0;
      setForm((prev) => ({
        ...prev,
        price_ngn: ngn,
        price_fcfa: Math.round(ngn * exchangeRate),
      }));
    } else {
      setForm((prev) => ({ ...prev, [key]: value }));
    }
  };

  const addVariant = () => {
    setForm((prev) => ({
      ...prev,
      variants: [...prev.variants, { name: "", price_ngn: 0, stock: 0 }],
    }));
  };

  const handleVariantChange = (idx, key, value) => {
    setForm((prev) => {
      const updated = [...prev.variants];
      updated[idx] = { ...updated[idx], [key]: key === "price_ngn" || key === "stock" ? Number(value) || 0 : value };
      return { ...prev, variants: updated };
    });
  };
  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const { data: productData, error: productError } = await supabase
        .from("products")
        .insert({
          seller_id: user.id,
          name: form.name,
          description: form.description,
          price: form.price_ngn,
          stock_quantity: form.stock_total,
          status: "pending_review",
          currency: "XOF",
          category_id: form.category_id || null,
        })
        .select()
        .single();
      if (productError) throw productError;
      // Image principale
      if (form.image && productData?.id) {
        await supabase.from("product_images").insert({
          product_id: productData.id,
          url: form.image,
          is_primary: true,
        });
      }
      setSubmitting(false);
      navigate("/catalog");
    } catch (err) {
      console.error("Erreur création produit:", err);
      alert("Erreur lors de la création du produit");
      setSubmitting(false);
    }
  };

  const canNext1 = form.name.trim() && form.category_id.trim();
  const canNext2 = form.price_ngn > 0;
  const canSubmit = canNext1 && canNext2 && form.stock_total >= 0;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Nouveau produit
          </h2>
          <p className="text-sm text-gray-400">Créez un nouveau produit pour votre catalogue</p>
        </div>
        {/* Steps */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${step >= s ? "bg-[#125C8D] text-white" : "bg-gray-100 text-gray-400"}`}>
                {s}
              </div>
              <div className="h-px flex-1 bg-gray-200"></div>
            </div>
          ))}
        </div>
        {/* Step 1 */}
        {step === 1 && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 block mb-1.5">Nom du produit *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#125C8D]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 block mb-1.5">Catégorie *</label>
              <select
                value={form.category_id}
                onChange={(e) => handleChange("category_id", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#125C8D] bg-white"
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 block mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={4}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#125C8D] resize-none"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!canNext1}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer whitespace-nowrap disabled:opacity-40 hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#125C8D" }}
              >
                Suivant <i className="ri-arrow-right-line ml-1"></i>
              </button>
            </div>
          </div>
        )}
        {/* Step 2 */}
        {step === 2 && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 block mb-1.5">Prix NGN (₦) *</label>
                <input
                  type="number"
                  value={form.price_ngn}
                  onChange={(e) => handleChange("price_ngn", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#125C8D]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 block mb-1.5">Prix FCFA (auto)</label>
                <input
                  type="text"
                  value={form.price_fcfa}
                  readOnly
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500 bg-gray-50 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 block mb-1.5">Stock total *</label>
              <input
                type="number"
                value={form.stock_total}
                onChange={(e) => handleChange("stock_total", Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#125C8D]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 block mb-1.5">Image principale (URL)</label>
              <input
                type="text"
                value={form.image}
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
            {/* Variantes optionnelles */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400">Variantes (optionnel)</label>
                <button
                  onClick={addVariant}
                  className="text-xs font-semibold text-[#125C8D] hover:underline cursor-pointer whitespace-nowrap"
                >
                  + Ajouter une variante
                </button>
              </div>
              {form.variants.map((v, idx) => (
                <div key={idx} className="grid grid-cols-3 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Nom variante"
                    value={v.name}
                    onChange={(e) => handleVariantChange(idx, "name", e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#125C8D]"
                  />
                  <input
                    type="number"
                    placeholder="Prix NGN"
                    value={v.price_ngn}
                    onChange={(e) => handleVariantChange(idx, "price_ngn", e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#125C8D]"
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    value={v.stock}
                    onChange={(e) => handleVariantChange(idx, "stock", e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#125C8D]"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 cursor-pointer whitespace-nowrap transition-colors"
              >
                <i className="ri-arrow-left-line mr-1"></i>Retour
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!canNext2}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer whitespace-nowrap disabled:opacity-40 hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#125C8D" }}
              >
                Suivant <i className="ri-arrow-right-line ml-1"></i>
              </button>
            </div>
          </div>
        )}
        {/* Step 3 — Récap */}
        {step === 3 && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Récapitulatif</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Nom</span>
                <span className="font-semibold text-gray-900">{form.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Catégorie</span>
                <span className="font-semibold text-gray-900">{form.category_id}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Prix</span>
                <span className="font-semibold text-gray-900">₦{form.price_ngn.toLocaleString()} / {form.price_fcfa.toLocaleString()} F</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Stock</span>
                <span className="font-semibold text-gray-900">{form.stock_total}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Statut initial</span>
                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-amber-50 text-amber-600">En révision</span>
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 cursor-pointer whitespace-nowrap transition-colors"
              >
                <i className="ri-arrow-left-line mr-1"></i>Retour
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !canSubmit}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer whitespace-nowrap disabled:opacity-40 hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#125C8D" }}
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Création...
                  </span>
                ) : (
                  <><i className="ri-check-line mr-1"></i>Publier le produit</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}