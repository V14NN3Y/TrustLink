import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import VariantsEditor from "../components/VariantsEditor";

const initialForm = {
  name: "",
  category_id: "",
  description: "",
  price_ngn: 0,
  price_fcfa: 0,
  image: "",
  imageFile: null,
  imagePreview: "",
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
  const [error, setError] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(1);
  const [categories, setCategories] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    supabase.from("categories").select("id, name").order("name").then(({ data }) => { if (data) setCategories(data); });
    supabase.from("exchange_rates").select("rate").eq("from_currency", "NGN").eq("to_currency", "XOF").maybeSingle()
      .then(({ data }) => { if (data?.rate) setExchangeRate(data.rate); });
  }, []);

  const getCatName = (id) => categories.find(c => c.id === id)?.name || id;

  const handleChange = (key, value) => {
    if (key === "price_ngn") {
      const ngn = Number(value) || 0;
      setForm(prev => ({ ...prev, price_ngn: ngn, price_fcfa: Math.round(ngn * exchangeRate) }));
    } else {
      setForm(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Veuillez sélectionner un fichier image valide");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 5 Mo");
      return;
    }
    const preview = URL.createObjectURL(file);
    setForm(prev => ({ ...prev, imageFile: file, imagePreview: preview, image: "" }));
    setError(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageFile(file);
  };

  const uploadImageToStorage = async (file, productId) => {
    const ext = file.name.split(".").pop();
    const path = `products/${user.id}/${productId}_${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from("product-images").upload(path, file, { upsert: true, contentType: file.type });
    if (uploadErr) {
      const { error: uploadErr2 } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
      if (uploadErr2) throw new Error("Impossible d'uploader l'image. Vérifiez les permissions du bucket.");
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      return publicUrl;
    }
    const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(path);
    return publicUrl;
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const { data: productData, error: productError } = await supabase
        .from("products")
        .insert({
          seller_id: user.id,
          name: form.name,
          description: form.description,
          price: form.price_fcfa,
          stock_quantity: form.stock_total,
          status: "pending_review",
          currency: "XOF",
          category_id: form.category_id || null,
        })
        .select()
        .single();
      if (productError) throw productError;

      let imageUrl = form.image;

      if (form.imageFile && productData?.id) {
        setUploadingImage(true);
        try {
          imageUrl = await uploadImageToStorage(form.imageFile, productData.id);
        } catch (imgErr) {
          console.warn("Image upload failed:", imgErr.message);
        } finally {
          setUploadingImage(false);
        }
      }

      if (imageUrl && productData?.id) {
        await supabase.from("product_images").insert({
          product_id: productData.id,
          url: imageUrl,
          is_primary: true,
        });
      }

      if (form.variants?.length > 0 && productData?.id) {
        const variantRows = form.variants.map((v, idx) => ({
          product_id: productData.id,
          type: v.type,
          value: v.value,
          stock_quantity: v.stock_quantity || 0,
          price_modifier: v.price_modifier || 0,
          sort_order: idx,
        }));
        await supabase.from("product_variants").insert(variantRows);
      }

      navigate("/catalog");
    } catch (err) {
      setError(err.message || "Erreur lors de la création du produit");
    } finally {
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

        {/* Steps indicator */}
        <div className="flex items-center mb-6">
          {[
            { num: 1, label: "Informations" },
            { num: 2, label: "Prix & Stock" },
            { num: 3, label: "Confirmation" },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${step >= s.num ? "bg-[#125C8D] text-white" : "bg-gray-100 text-gray-400"}`}>
                  {step > s.num ? <i className="ri-check-line"></i> : s.num}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${step >= s.num ? "text-[#125C8D]" : "text-gray-400"}`}>{s.label}</span>
              </div>
              {i < 2 && <div className="flex-1 h-px bg-gray-200 mx-3"></div>}
            </div>
          ))}
        </div>

        {/* Step 1 — Informations */}
        {step === 1 && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 block mb-1.5">Nom du produit *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Ex : Robe africaine brodée en coton"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#125C8D] transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 block mb-1.5">Catégorie *</label>
              <select
                value={form.category_id}
                onChange={(e) => handleChange("category_id", e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#125C8D] bg-white"
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 block mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={4}
                placeholder="Décrivez votre produit : matières, utilisation, caractéristiques..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#125C8D] resize-none transition-colors"
              />
            </div>

            {/* Image upload */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 block mb-1.5">Photo principale</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => handleImageFile(e.target.files?.[0])}
              />
              {form.imagePreview ? (
                <div className="relative">
                  <img src={form.imagePreview} alt="Preview" className="w-full max-h-48 object-cover object-top rounded-xl border border-gray-200" />
                  <button
                    type="button"
                    onClick={() => { setForm(prev => ({ ...prev, imageFile: null, imagePreview: "", image: "" })); }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white shadow border border-gray-200 flex items-center justify-center text-gray-500 hover:text-red-500 cursor-pointer"
                  >
                    <i className="ri-close-line text-sm"></i>
                  </button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-[#125C8D] transition-colors group"
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={e => e.preventDefault()}
                >
                  <i className="ri-image-add-line text-3xl text-gray-300 group-hover:text-[#125C8D] transition-colors mb-2 block"></i>
                  <p className="text-sm font-medium text-gray-500 group-hover:text-[#125C8D]">Cliquez ou glissez une image ici</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP · Max 5 Mo</p>
                </div>
              )}
            </div>

            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                <i className="ri-error-warning-line mr-1"></i>{error}
              </div>
            )}
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

        {/* Step 2 — Prix, Stock & Variantes */}
        {step === 2 && (
          <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 block mb-1.5">Prix NGN (₦) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">₦</span>
                  <input
                    type="number"
                    min="0"
                    value={form.price_ngn || ""}
                    onChange={(e) => handleChange("price_ngn", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#125C8D]"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 block mb-1.5">Prix FCFA (calculé)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">F</span>
                  <input
                    type="text"
                    value={form.price_fcfa ? form.price_fcfa.toLocaleString() : ""}
                    readOnly
                    className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2.5 text-sm text-gray-500 bg-gray-50 outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 block mb-1.5">Stock total *</label>
              <input
                type="number"
                min="0"
                value={form.stock_total || ""}
                onChange={(e) => handleChange("stock_total", Number(e.target.value))}
                placeholder="Ex : 50"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#125C8D]"
              />
            </div>

            {/* Shein-like Variants */}
            <div className="border border-gray-100 rounded-xl p-4">
              <VariantsEditor
                onVariantsChange={(variants) => setForm(prev => ({ ...prev, variants }))}
              />
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

        {/* Step 3 — Récapitulatif */}
        {step === 3 && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Récapitulatif</h3>

            {/* Image preview */}
            {form.imagePreview && (
              <div className="mb-4 w-full h-40 rounded-xl overflow-hidden border border-gray-100">
                <img src={form.imagePreview} alt="Produit" className="w-full h-full object-cover object-top" />
              </div>
            )}

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Nom</span>
                <span className="font-semibold text-gray-900 text-right max-w-xs truncate">{form.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Catégorie</span>
                <span className="font-semibold text-gray-900">{getCatName(form.category_id)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Prix</span>
                <span className="font-semibold text-gray-900">₦{form.price_ngn.toLocaleString()} / {form.price_fcfa.toLocaleString()} F</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Stock</span>
                <span className="font-semibold text-gray-900">{form.stock_total} unités</span>
              </div>
              {form.variants?.length > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Variantes</span>
                  <span className="font-semibold text-gray-900">{form.variants.length} variante(s)</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-500">Statut initial</span>
                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-amber-50 text-amber-600">En révision</span>
              </div>
            </div>

            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-4">
                <i className="ri-error-warning-line mr-1"></i>{error}
              </div>
            )}

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
                    {uploadingImage ? "Upload image..." : "Création..."}
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
