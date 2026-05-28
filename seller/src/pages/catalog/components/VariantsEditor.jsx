import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useLocale } from "@/lib/i18n";

const PRESET_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "Unique"];
const PRESET_MATERIALS = ["Coton", "Polyester", "Lin", "Soie", "Laine", "Cuir", "Jean"];
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

function SizeChip({ value, selected, onClick, onRemove, isCustom }) {
  return (
    <div className="relative group">
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
      {isCustom && selected && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove?.(); }}
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
        >
          ×
        </button>
      )}
    </div>
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
        className={`w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center ${
          selected ? "border-[#125C8D] scale-110 shadow-md" : "border-gray-200 hover:border-gray-400"
        }`}
        style={{ backgroundColor: color.hex }}
      >
        {isLight && <div className="w-full h-full rounded-full border border-gray-300" />}
        {selected && (
          <i className={`ri-check-line text-[10px] font-bold ${isLight ? "text-gray-700" : "text-white"}`}></i>
        )}
      </div>
      <span className="text-[9px] text-gray-400 group-hover:text-gray-600 max-w-[36px] text-center leading-tight">{color.name}</span>
    </button>
  );
}

export default function VariantsEditor({ productId, onVariantsChange }) {
  const { t } = useLocale();
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(!!productId);
  const [selectedValues, setSelectedValues] = useState({ size: [], color: [], material: [] });
  const [customSizes, setCustomSizes] = useState([]);
  const [customColors, setCustomColors] = useState([]);
  const [customMaterials, setCustomMaterials] = useState([]);
  const [customInputs, setCustomInputs] = useState({ size: "", color: "", material: "" });
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
      const cs = rows.filter(v => v.type === "size" && !PRESET_SIZES.includes(v.value)).map(v => v.value);
      const cc = rows.filter(v => v.type === "color" && !PRESET_COLORS.find(c => c.name === v.value)).map(v => v.value);
      const cm = rows.filter(v => v.type === "material" && !PRESET_MATERIALS.includes(v.value)).map(v => v.value);
      if (cs.length) setCustomSizes([...new Set(cs)]);
      if (cc.length) setCustomColors([...new Set(cc)]);
      if (cm.length) setCustomMaterials([...new Set(cm)]);
      setLoading(false);
    });
  }, [productId]);

  const toggleValue = (type, value, newSel) => {
    const base = newSel || selectedValues;
    const current = base[type] || [];
    const next = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
    const updated = { ...base, [type]: next };
    setSelectedValues(updated);
    emitChange(updated, stockMap, modifierMap);
    return updated;
  };

  const addCustom = (type) => {
    const val = customInputs[type].trim();
    if (!val) return;
    if (type === "size" && !PRESET_SIZES.includes(val) && !customSizes.includes(val)) setCustomSizes(p => [...p, val]);
    if (type === "color" && !PRESET_COLORS.find(c => c.name === val) && !customColors.includes(val)) setCustomColors(p => [...p, val]);
    if (type === "material" && !PRESET_MATERIALS.includes(val) && !customMaterials.includes(val)) setCustomMaterials(p => [...p, val]);
    setCustomInputs(p => ({ ...p, [type]: "" }));
    const current = selectedValues[type] || [];
    if (!current.includes(val)) {
      const updated = { ...selectedValues, [type]: [...current, val] };
      setSelectedValues(updated);
      emitChange(updated, stockMap, modifierMap);
    }
  };

  const removeCustom = (type, value) => {
    if (type === "size") setCustomSizes(p => p.filter(v => v !== value));
    if (type === "color") setCustomColors(p => p.filter(v => v !== value));
    if (type === "material") setCustomMaterials(p => p.filter(v => v !== value));
    const current = selectedValues[type] || [];
    const updated = { ...selectedValues, [type]: current.filter(v => v !== value) };
    setSelectedValues(updated);
    emitChange(updated, stockMap, modifierMap);
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
    if (existing && productId) {
      await supabase.from("product_variants").delete().eq("id", existing.id);
      setVariants(v => v.filter(x => x.id !== existing.id));
    }
    const updated = { ...selectedValues, [type]: selectedValues[type].filter(v => v !== value) };
    setSelectedValues(updated);
    emitChange(updated, stockMap, modifierMap);
  };

  const totalSelected = Object.values(selectedValues).flat().length;

  if (loading) return <div className="animate-pulse h-24 bg-gray-100 rounded-xl" />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
          {t('catalog.variantsTitle')}
        </p>
        {totalSelected > 0 && (
          <span className="px-2 py-0.5 rounded-full text-[#125C8D] bg-[#125C8D]/10 text-[10px] font-bold">
            {totalSelected} {totalSelected > 1 ? t('catalog.variantPlural') : t('catalog.variantSingular')}
          </span>
        )}
      </div>

      {/* Couleurs */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <i className="ri-palette-line text-gray-400 text-sm"></i>
          <p className="text-xs font-semibold text-gray-700">{t('catalog.sectionColors')}</p>
          {selectedValues.color.length > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#125C8D]/10 text-[#125C8D]">
              {selectedValues.color.length}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          {PRESET_COLORS.map(c => (
            <ColorSwatch
              key={c.name}
              color={c}
              selected={selectedValues.color.includes(c.name)}
              onClick={() => toggleValue("color", c.name)}
            />
          ))}
          {customColors.map(name => (
            <ColorSwatch
              key={name}
              color={{ name, hex: "#888" }}
              selected={selectedValues.color.includes(name)}
              onClick={() => toggleValue("color", name)}
            />
          ))}
        </div>
        <div className="flex gap-1.5">
          <input
            value={customInputs.color}
            onChange={e => setCustomInputs(p => ({ ...p, color: e.target.value }))}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustom("color"); } }}
            placeholder={t('catalog.otherColor')}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#125C8D]"
          />
          <button type="button" onClick={() => addCustom("color")} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200 cursor-pointer whitespace-nowrap">
            {t('catalog.add')}
          </button>
        </div>
      </div>

      <div className="border-t border-gray-100"></div>

      {/* Tailles */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <i className="ri-ruler-line text-gray-400 text-sm"></i>
          <p className="text-xs font-semibold text-gray-700">{t('catalog.sectionSizes')}</p>
          {selectedValues.size.length > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#125C8D]/10 text-[#125C8D]">
              {selectedValues.size.length}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESET_SIZES.map(s => (
            <SizeChip
              key={s}
              value={s}
              selected={selectedValues.size.includes(s)}
              onClick={() => toggleValue("size", s)}
            />
          ))}
          {customSizes.map(s => (
            <SizeChip
              key={s}
              value={s}
              selected={selectedValues.size.includes(s)}
              onClick={() => toggleValue("size", s)}
              onRemove={() => removeCustom("size", s)}
              isCustom
            />
          ))}
        </div>
        <div className="flex gap-1.5">
          <input
            value={customInputs.size}
            onChange={e => setCustomInputs(p => ({ ...p, size: e.target.value }))}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustom("size"); } }}
            placeholder={t('catalog.otherSize')}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#125C8D]"
          />
          <button type="button" onClick={() => addCustom("size")} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200 cursor-pointer whitespace-nowrap">
            {t('catalog.add')}
          </button>
        </div>
      </div>

      <div className="border-t border-gray-100"></div>

      {/* Matériaux */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <i className="ri-t-shirt-line text-gray-400 text-sm"></i>
          <p className="text-xs font-semibold text-gray-700">{t('catalog.sectionMaterials')}</p>
          {selectedValues.material.length > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#125C8D]/10 text-[#125C8D]">
              {selectedValues.material.length}
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESET_MATERIALS.map(s => (
            <SizeChip
              key={s}
              value={s}
              selected={selectedValues.material.includes(s)}
              onClick={() => toggleValue("material", s)}
            />
          ))}
          {customMaterials.map(s => (
            <SizeChip
              key={s}
              value={s}
              selected={selectedValues.material.includes(s)}
              onClick={() => toggleValue("material", s)}
              onRemove={() => removeCustom("material", s)}
              isCustom
            />
          ))}
        </div>
        <div className="flex gap-1.5">
          <input
            value={customInputs.material}
            onChange={e => setCustomInputs(p => ({ ...p, material: e.target.value }))}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustom("material"); } }}
            placeholder={t('catalog.otherMaterial')}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#125C8D]"
          />
          <button type="button" onClick={() => addCustom("material")} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-200 cursor-pointer whitespace-nowrap">
            {t('catalog.add')}
          </button>
        </div>
      </div>

      {/* Stock table */}
      {totalSelected > 0 && (
        <>
          <div className="border-t border-gray-100"></div>
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-3 py-2 border-b border-gray-100 flex items-center justify-between">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">{t('catalog.stockPriceHeader')}</p>
              <p className="text-[10px] text-gray-400">{totalSelected} {totalSelected > 1 ? t('catalog.variantPlural') : t('catalog.variantSingular')}</p>
            </div>
            <div className="divide-y divide-gray-50">
              {Object.entries(selectedValues).flatMap(([type, values]) =>
                values.map(value => {
                  const key = `${type}:${value}`;
                  const typeLabel = type === "size" ? t('catalog.typeSize') : type === "color" ? t('catalog.typeColor') : t('catalog.typeMaterial');
                  const colorHex = type === "color"
                    ? (PRESET_COLORS.find(c => c.name === value)?.hex || "#888")
                    : null;
                  return (
                    <div key={key} className="flex items-center gap-3 px-3 py-2.5">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {colorHex ? (
                          <div className="w-5 h-5 rounded-full border border-gray-200 flex-shrink-0" style={{ backgroundColor: colorHex }} />
                        ) : (
                          <div className="w-5 h-5 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-[8px] font-bold text-gray-400">{value.slice(0, 2).toUpperCase()}</span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">{value}</p>
                          <p className="text-[10px] text-gray-400">{typeLabel}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="flex flex-col items-center gap-0.5">
                          <label className="text-[9px] text-gray-400 uppercase tracking-widest">{t('catalog.stockCol')}</label>
                          <input
                            type="number"
                            min="0"
                            value={stockMap[key] ?? 0}
                            onChange={e => setStock(type, value, e.target.value)}
                            onBlur={() => productId && saveVariant(type, value)}
                            className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-xs outline-none focus:border-[#125C8D] text-center"
                          />
                        </div>
                        <div className="flex flex-col items-center gap-0.5">
                          <label className="text-[9px] text-gray-400 uppercase tracking-widest">{t('catalog.modifierCol')}</label>
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
                          onClick={() => productId ? removeVariant(type, value) : (() => {
                            const updated = { ...selectedValues, [type]: selectedValues[type].filter(v => v !== value) };
                            setSelectedValues(updated);
                            emitChange(updated, stockMap, modifierMap);
                          })()}
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
        </>
      )}

      {totalSelected === 0 && (
        <p className="text-xs text-gray-400 text-center py-3 bg-gray-50 rounded-xl">
          {t('catalog.selectHint')}
        </p>
      )}
    </div>
  );
}
