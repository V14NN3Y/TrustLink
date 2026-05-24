import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

const PRESET_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "Unique"];
const PRESET_COLORS = [
  { name: "Noir", hex: "#111827" },
  { name: "Blanc", hex: "#F9FAFB" },
  { name: "Rouge", hex: "#EF4444" },
  { name: "Bleu", hex: "#3B82F6" },
  { name: "Vert", hex: "#10B981" },
  { name: "Jaune", hex: "#F59E0B" },
  { name: "Rose", hex: "#EC4899" },
  { name: "Orange", hex: "#F97316" },
  { name: "Gris", hex: "#6B7280" },
  { name: "Beige", hex: "#D4B896" },
  { name: "Marron", hex: "#92400E" },
  { name: "Violet", hex: "#8B5CF6" },
];

const VARIANT_TYPES = [
  { key: "size", label: "Taille", icon: "ri-ruler-line" },
  { key: "color", label: "Couleur", icon: "ri-palette-line" },
  { key: "material", label: "Matériau", icon: "ri-t-shirt-line" },
];

function SizeChip({ value, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
        selected
          ? "border-[#125C8D] bg-[#125C8D] text-white"
          : "border-gray-200 text-gray-600 hover:border-gray-400"
      }`}
    >
      {value}
    </button>
  );
}

function ColorSwatch({ color, selected, onClick }) {
  const isLight = color.hex === "#F9FAFB" || color.hex === "#D4B896";
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex flex-col items-center gap-1 cursor-pointer group"
      title={color.name}
    >
      <div
        className={`w-8 h-8 rounded-full border-2 transition-all ${
          selected ? "border-[#125C8D] scale-110 shadow-md" : "border-gray-200 hover:border-gray-400"
        }`}
        style={{ backgroundColor: color.hex }}
      >
        {isLight && (
          <div className="w-full h-full rounded-full border border-gray-300" />
        )}
        {selected && (
          <div className="absolute inset-0 flex items-center justify-center">
            <i className={`ri-check-line text-[10px] font-bold ${isLight ? "text-gray-700" : "text-white"}`}></i>
          </div>
        )}
      </div>
      <span className="text-[9px] text-gray-400 group-hover:text-gray-600 max-w-[36px] text-center leading-tight">{color.name}</span>
    </button>
  );
}

export default function VariantsEditor({ productId, onVariantsChange }) {
  const [activeType, setActiveType] = useState("size");
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(!!productId);
  const [selectedValues, setSelectedValues] = useState({ size: [], color: [], material: [] });
  const [customInput, setCustomInput] = useState("");
  const [stockMap, setStockMap] = useState({});
  const [modifierMap, setModifierMap] = useState({});

  useEffect(() => {
    if (!productId) { setLoading(false); return; }
    supabase.from("product_variants").select("*").eq("product_id", productId).order("sort_order").then(({ data }) => {
      const rows = data || [];
      setVariants(rows);
      const sel = { size: [], color: [], material: [] };
      const sMap = {};
      const mMap = {};
      rows.forEach(v => {
        if (sel[v.type] !== undefined && !sel[v.type].includes(v.value)) sel[v.type].push(v.value);
        sMap[`${v.type}:${v.value}`] = v.stock_quantity;
        mMap[`${v.type}:${v.value}`] = v.price_modifier;
      });
      setSelectedValues(sel);
      setStockMap(sMap);
      setModifierMap(mMap);
      setLoading(false);
    });
  }, [productId]);

  const toggleValue = (type, value) => {
    setSelectedValues(prev => {
      const current = prev[type] || [];
      const next = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
      const newSel = { ...prev, [type]: next };
      emitChange(newSel, stockMap, modifierMap);
      return newSel;
    });
  };

  const addCustom = () => {
    const val = customInput.trim();
    if (!val) return;
    toggleValue(activeType, val);
    setCustomInput("");
  };

  const setStock = (type, value, stock) => {
    const key = `${type}:${value}`;
    const newMap = { ...stockMap, [key]: Number(stock) || 0 };
    setStockMap(newMap);
    emitChange(selectedValues, newMap, modifierMap);
  };

  const setModifier = (type, value, mod) => {
    const key = `${type}:${value}`;
    const newMap = { ...modifierMap, [key]: Number(mod) || 0 };
    setModifierMap(newMap);
    emitChange(selectedValues, stockMap, newMap);
  };

  const emitChange = (sel, sMap, mMap) => {
    if (!onVariantsChange) return;
    const rows = [];
    Object.entries(sel).forEach(([type, values]) => {
      values.forEach((value, idx) => {
        rows.push({
          type,
          value,
          stock_quantity: sMap[`${type}:${value}`] ?? 0,
          price_modifier: mMap[`${type}:${value}`] ?? 0,
          sort_order: idx,
        });
      });
    });
    onVariantsChange(rows);
  };

  const saveVariant = async (type, value) => {
    if (!productId) return;
    const key = `${type}:${value}`;
    const existing = variants.find(v => v.type === type && v.value === value);
    if (existing) {
      await supabase.from("product_variants").update({
        stock_quantity: stockMap[key] ?? 0,
        price_modifier: modifierMap[key] ?? 0,
      }).eq("id", existing.id);
    } else {
      const { data } = await supabase.from("product_variants").insert({
        product_id: productId, type, value,
        stock_quantity: stockMap[key] ?? 0,
        price_modifier: modifierMap[key] ?? 0,
      }).select().single();
      if (data) setVariants(v => [...v, data]);
    }
  };

  const removeVariant = async (type, value) => {
    const existing = variants.find(v => v.type === type && v.value === value);
    if (existing) {
      await supabase.from("product_variants").delete().eq("id", existing.id);
      setVariants(v => v.filter(x => x.id !== existing.id));
    }
    toggleValue(type, value);
  };

  const totalSelected = Object.values(selectedValues).flat().length;

  if (loading) return <div className="animate-pulse h-20 bg-gray-100 rounded-xl" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
          Variantes produit
          {totalSelected > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded-full text-[#125C8D] bg-[#125C8D]/10 text-[10px] font-bold">
              {totalSelected} sélectionnée{totalSelected > 1 ? "s" : ""}
            </span>
          )}
        </p>
      </div>

      {/* Type tabs */}
      <div className="flex gap-1">
        {VARIANT_TYPES.map(t => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveType(t.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeType === t.key
                ? "bg-[#125C8D] text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            <i className={t.icon}></i>{t.label}
            {selectedValues[t.key]?.length > 0 && (
              <span className={`text-[9px] font-bold px-1.5 rounded-full ${activeType === t.key ? "bg-white/20 text-white" : "bg-[#125C8D]/15 text-[#125C8D]"}`}>
                {selectedValues[t.key].length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Taille presets */}
      {activeType === "size" && (
        <div>
          <p className="text-[10px] text-gray-400 mb-2">Sélectionnez les tailles disponibles</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {PRESET_SIZES.map(s => (
              <SizeChip
                key={s}
                value={s}
                selected={selectedValues.size.includes(s)}
                onClick={() => toggleValue("size", s)}
              />
            ))}
          </div>
          <div className="flex gap-1.5">
            <input
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }}
              placeholder="Autre taille (ex: 38, 40...)"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#125C8D]"
            />
            <button
              type="button"
              onClick={addCustom}
              className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200 cursor-pointer"
            >
              Ajouter
            </button>
          </div>
        </div>
      )}

      {/* Couleur presets */}
      {activeType === "color" && (
        <div>
          <p className="text-[10px] text-gray-400 mb-2">Sélectionnez les couleurs disponibles</p>
          <div className="flex flex-wrap gap-3 mb-3">
            {PRESET_COLORS.map(c => (
              <ColorSwatch
                key={c.name}
                color={c}
                selected={selectedValues.color.includes(c.name)}
                onClick={() => toggleValue("color", c.name)}
              />
            ))}
          </div>
          <div className="flex gap-1.5">
            <input
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }}
              placeholder="Autre couleur"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#125C8D]"
            />
            <button type="button" onClick={addCustom} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200 cursor-pointer">
              Ajouter
            </button>
          </div>
        </div>
      )}

      {/* Matériau */}
      {activeType === "material" && (
        <div>
          <p className="text-[10px] text-gray-400 mb-2">Ajoutez les matériaux disponibles</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {["Coton", "Polyester", "Lin", "Soie", "Laine", "Cuir", "Jean"].map(s => (
              <SizeChip
                key={s}
                value={s}
                selected={selectedValues.material.includes(s)}
                onClick={() => toggleValue("material", s)}
              />
            ))}
          </div>
          <div className="flex gap-1.5">
            <input
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }}
              placeholder="Autre matériau"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#125C8D]"
            />
            <button type="button" onClick={addCustom} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200 cursor-pointer">
              Ajouter
            </button>
          </div>
        </div>
      )}

      {/* Stock & modifier per selected variant */}
      {totalSelected > 0 && (
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <div className="bg-gray-50 px-3 py-2 border-b border-gray-100">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Stock par variante</p>
          </div>
          <div className="divide-y divide-gray-50">
            {Object.entries(selectedValues).flatMap(([type, values]) =>
              values.map(value => {
                const key = `${type}:${value}`;
                const typeCfg = VARIANT_TYPES.find(t => t.key === type);
                return (
                  <div key={key} className="flex items-center gap-3 px-3 py-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {type === "color" && (
                        <div
                          className="w-4 h-4 rounded-full border border-gray-200 flex-shrink-0"
                          style={{ backgroundColor: PRESET_COLORS.find(c => c.name === value)?.hex || "#888" }}
                        />
                      )}
                      {type !== "color" && (
                        <i className={`${typeCfg?.icon} text-gray-400 text-xs flex-shrink-0`}></i>
                      )}
                      <span className="text-xs font-semibold text-gray-700 truncate">{value}</span>
                      <span className="text-[10px] text-gray-400 capitalize">({type === "size" ? "taille" : type === "color" ? "couleur" : "matériau"})</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1">
                        <label className="text-[10px] text-gray-400">Stock</label>
                        <input
                          type="number"
                          min="0"
                          value={stockMap[key] ?? 0}
                          onChange={e => setStock(type, value, e.target.value)}
                          onBlur={() => productId && saveVariant(type, value)}
                          className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none focus:border-[#125C8D] text-center"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <label className="text-[10px] text-gray-400">+NGN</label>
                        <input
                          type="number"
                          value={modifierMap[key] ?? 0}
                          onChange={e => setModifier(type, value, e.target.value)}
                          onBlur={() => productId && saveVariant(type, value)}
                          className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none focus:border-[#125C8D] text-center"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => productId ? removeVariant(type, value) : toggleValue(type, value)}
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <i className="ri-close-line text-sm"></i>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {totalSelected === 0 && (
        <p className="text-xs text-gray-400 text-center py-3 bg-gray-50 rounded-xl">
          Aucune variante sélectionnée — les variantes sont optionnelles
        </p>
      )}
    </div>
  );
}
