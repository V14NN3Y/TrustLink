import PriceBreakdown from '@/components/feature/PriceBreakdown';
import { computeAllInclusive } from '@/lib/pricing';
import { useEscrowConfig } from '@/hooks/useEscrowConfig';
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useCurrencyContext } from '@/lib/CurrencyContext';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useI18n } from '@/lib/I18nContext';
import { renderStars } from '@/utils/format';
import ProductCard from '@/pages/home/components/ProductCard';
import LazyImage from '@/components/base/LazyImage';

const SORT_OPTIONS = [
  { value: 'popular', label: 'Populaires' },
  { value: 'newest', label: 'Nouveautés' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
  { value: 'rating', label: 'Meilleures notes' },
];

const PRICE_PRESETS = [
  { label: 'Tous les prix', min: '', max: '' },
  { label: '< 25 000 F', min: '', max: '25000' },
  { label: '25k - 75k F', min: '25000', max: '75000' },
  { label: '75k - 150k F', min: '75000', max: '150000' },
  { label: '> 150 000 F', min: '150000', max: '' },
];

export default function CatalogPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { formatPrice } = useCurrencyContext();
  const pricingCfg = useEscrowConfig();
  const { addToCart } = useCart();
  const { toggle: toggleWishlist, isWishlisted } = useWishlist();

  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';

  // Filter states
  const [searchInput, setSearchInput] = useState(searchParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [fastDeliveryOnly, setFastDeliveryOnly] = useState(false);
  const [sort, setSort] = useState('popular');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(16);

  // Quick view modal
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickQty, setQuickQty] = useState(1);
  const [quickAdded, setQuickAdded] = useState(false);

  // Categories
  const { data: categories = [], isLoading: catLoading } = useCategories();

  // Sync state with URL params
  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  // Fetch products
  const { data: rawProducts = [], isLoading, error } = useProducts({
    category: selectedCategory,
    search: searchParam,
  });

  // Client-side filtering & sorting
  const filteredProducts = useMemo(() => {
    let result = [...rawProducts];

    if (priceMin) {
      result = result.filter(p => computeAllInclusive(p.price, pricingCfg).total >= Number(priceMin));
    }
    if (priceMax) {
      result = result.filter(p => computeAllInclusive(p.price, pricingCfg).total <= Number(priceMax));
    }
    if (minRating > 0) {
      result = result.filter(p => (p.rating || 0) >= minRating);
    }
    if (inStockOnly) {
      result = result.filter(p => (p.stock || 0) > 0);
    }
    if (fastDeliveryOnly) {
      result = result.filter(p => (p.delivery_max_days || 7) <= 4);
    }

    // Sorting
    if (sort === 'price_asc') {
      result.sort((a, b) => computeAllInclusive(a.price, pricingCfg).total - computeAllInclusive(b.price, pricingCfg).total);
    } else if (sort === 'price_desc') {
      result.sort((a, b) => computeAllInclusive(b.price, pricingCfg).total - computeAllInclusive(a.price, pricingCfg).total);
    } else if (sort === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sort === 'newest') {
      result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    }

    return result;
  }, [rawProducts, priceMin, priceMax, minRating, inStockOnly, fastDeliveryOnly, sort, pricingCfg]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredProducts.slice(start, start + itemsPerPage);
  }, [filteredProducts, page, itemsPerPage]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory) count++;
    if (searchParam) count++;
    if (priceMin || priceMax) count++;
    if (minRating > 0) count++;
    if (inStockOnly) count++;
    if (fastDeliveryOnly) count++;
    return count;
  }, [selectedCategory, searchParam, priceMin, priceMax, minRating, inStockOnly, fastDeliveryOnly]);

  const handleCategorySelect = (slug) => {
    setSelectedCategory(slug);
    setPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (slug) {
      newParams.set('category', slug);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      newParams.set('search', searchInput.trim());
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const resetAllFilters = () => {
    setSelectedCategory('');
    setSearchInput('');
    setPriceMin('');
    setPriceMax('');
    setMinRating(0);
    setInStockOnly(false);
    setFastDeliveryOnly(false);
    setSort('popular');
    setPage(1);
    setSearchParams({});
  };

  const handleApplyPreset = (preset) => {
    setPriceMin(preset.min);
    setPriceMax(preset.max);
    setPage(1);
  };

  const handleQuickAddToCart = (product, e) => {
    if (e) e.stopPropagation();
    addToCart(product, quickQty);
    setQuickAdded(true);
    setTimeout(() => setQuickAdded(false), 2000);
  };

  const currentCategoryObj = categories.find(c => c.slug === selectedCategory);

  return (
    <div className="pt-28 md:pt-24 pb-16 bg-[#F8FAFC] min-h-screen">
      {/* Top Banner / Breadcrumb */}
      <div className="bg-white border-b border-gray-100 py-4 mb-6">
        <div className="max-w-[1240px] mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-500 font-inter mb-1">
                <Link to="/" className="hover:text-[#125C8D] transition-colors">Accueil</Link>
                <i className="ri-arrow-right-s-line text-xs" />
                <span className="text-gray-900 font-medium">Catalogue</span>
                {currentCategoryObj && (
                  <>
                    <i className="ri-arrow-right-s-line text-xs" />
                    <span className="text-[#125C8D] font-medium">{currentCategoryObj.name}</span>
                  </>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold font-poppins text-gray-900 flex items-center gap-2.5">
                <span>{currentCategoryObj ? currentCategoryObj.name : 'Catalogue des Produits'}</span>
                <span className="text-xs px-2.5 py-1 bg-blue-50 text-[#125C8D] font-semibold rounded-full border border-blue-100">
                  Nigeria ➔ Bénin
                </span>
              </h1>
            </div>

            {/* In-catalog search */}
            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Chercher dans le catalogue..."
                className="w-full pl-9 pr-8 py-2 text-sm bg-gray-50 border border-gray-200 rounded-full outline-none focus:border-[#125C8D] focus:bg-white transition-all font-inter"
              />
              <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => { setSearchInput(''); handleCategorySelect(selectedCategory); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <i className="ri-close-line text-sm" />
                </button>
              )}
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 md:px-6">
        <div className="flex gap-8 items-start">
          {/* ================= DESKTOP SIDEBAR ================= */}
          <aside className="hidden lg:block w-72 flex-shrink-0 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-6 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <i className="ri-equalizer-line text-[#125C8D] text-lg" />
                <h3 className="font-poppins font-bold text-gray-900 text-base">Filtres</h3>
              </div>
              {activeFiltersCount > 0 && (
                <button
                  onClick={resetAllFilters}
                  className="text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer"
                >
                  Effacer ({activeFiltersCount})
                </button>
              )}
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">
                Catégories
              </h4>
              <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                <button
                  onClick={() => handleCategorySelect('')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    !selectedCategory
                      ? 'bg-[#125C8D] text-white font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <i className="ri-apps-line text-sm" />
                    Toutes les catégories
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${!selectedCategory ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {rawProducts.length}
                  </span>
                </button>

                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.slug)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#125C8D] text-white font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <i className={`${cat.icon || 'ri-price-tag-3-line'} text-sm`} />
                        <span className="truncate">{cat.name}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Filter */}
            <div className="pt-2 border-t border-gray-100">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">
                Prix (FCFA)
              </h4>
              {/* Presets */}
              <div className="grid grid-cols-2 gap-1.5 mb-3">
                {PRICE_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleApplyPreset(p)}
                    className={`px-2 py-1.5 text-[11px] rounded-lg border text-center transition-all cursor-pointer ${
                      priceMin === p.min && priceMax === p.max
                        ? 'border-[#125C8D] bg-blue-50/70 text-[#125C8D] font-semibold'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceMin}
                  onChange={(e) => { setPriceMin(e.target.value); setPage(1); }}
                  className="w-1/2 px-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-[#125C8D]"
                />
                <span className="text-gray-400 text-xs">—</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceMax}
                  onChange={(e) => { setPriceMax(e.target.value); setPage(1); }}
                  className="w-1/2 px-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-[#125C8D]"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div className="pt-2 border-t border-gray-100">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Évaluation client
              </h4>
              <div className="space-y-1">
                {[4, 3, 2].map((stars) => (
                  <button
                    key={stars}
                    onClick={() => { setMinRating(minRating === stars ? 0 : stars); setPage(1); }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                      minRating === stars ? 'bg-amber-50 text-amber-900 font-semibold' : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <span className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <i key={i} className={`text-xs ${i < stars ? 'ri-star-fill' : 'ri-star-line text-gray-300'}`} />
                      ))}
                      <span className="text-xs text-gray-700 ml-1.5">{stars}★ et plus</span>
                    </span>
                    {minRating === stars && <i className="ri-check-line text-amber-600 font-bold" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Availability & Options */}
            <div className="pt-2 border-t border-gray-100 space-y-2.5">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Disponibilité & Services
              </h4>
              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => { setInStockOnly(e.target.checked); setPage(1); }}
                  className="w-4 h-4 text-[#125C8D] rounded border-gray-300 focus:ring-[#125C8D]"
                />
                <span>En stock uniquement</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={fastDeliveryOnly}
                  onChange={(e) => { setFastDeliveryOnly(e.target.checked); setPage(1); }}
                  className="w-4 h-4 text-[#125C8D] rounded border-gray-300 focus:ring-[#125C8D]"
                />
                <span>Livraison express (≤ 4 jours)</span>
              </label>

              {/* Escrow badge */}
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl mt-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#125C8D] mb-1">
                  <i className="ri-shield-check-fill text-sm" />
                  Garantie TrustLink Escrow
                </div>
                <p className="text-[11px] text-gray-600 leading-tight">
                  Paiement sécurisé. Votre argent n'est remis au vendeur nigérian qu'après vérification du colis à Cotonou.
                </p>
              </div>
            </div>
          </aside>

          {/* ================= MAIN CONTENT ================= */}
          <main className="flex-1 min-w-0">
            {/* Top Toolbar */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* Mobile Filter Trigger Button */}
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3.5 py-2 bg-[#125C8D] text-white text-xs font-semibold rounded-xl cursor-pointer"
                >
                  <i className="ri-equalizer-line text-sm" />
                  Filtres
                  {activeFiltersCount > 0 && (
                    <span className="w-4 h-4 bg-white text-[#125C8D] text-[10px] font-bold rounded-full flex items-center justify-center ml-0.5">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                <p className="text-xs md:text-sm text-gray-600 font-inter">
                  <strong className="text-gray-900 font-bold">{filteredProducts.length}</strong> produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
                </p>
              </div>

              {/* Sort & View Mode */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-500 font-inter hidden sm:inline">Trier par :</span>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#125C8D] cursor-pointer"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                {/* View switcher */}
                <div className="flex items-center bg-gray-100 p-1 rounded-xl">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-all ${
                      viewMode === 'grid' ? 'bg-white text-[#125C8D] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                    title="Vue Grille"
                  >
                    <i className="ri-grid-fill text-sm" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-all ${
                      viewMode === 'list' ? 'bg-white text-[#125C8D] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                    title="Vue Liste"
                  >
                    <i className="ri-list-check text-sm" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active filter pills */}
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2 flex-wrap mb-4 px-1">
                <span className="text-xs text-gray-400 font-medium">Filtres actifs :</span>
                {selectedCategory && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#125C8D]/10 text-[#125C8D]">
                    {currentCategoryObj?.name || selectedCategory}
                    <button onClick={() => handleCategorySelect('')} className="hover:text-red-500">
                      <i className="ri-close-line" />
                    </button>
                  </span>
                )}
                {searchParam && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                    "{searchParam}"
                    <button onClick={() => { setSearchInput(''); handleSearchSubmit({ preventDefault: () => {} }); }}>
                      <i className="ri-close-line" />
                    </button>
                  </span>
                )}
                {(priceMin || priceMax) && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    Prix : {priceMin || 0} - {priceMax || '∞'} FCFA
                    <button onClick={() => { setPriceMin(''); setPriceMax(''); }}>
                      <i className="ri-close-line" />
                    </button>
                  </span>
                )}
                {minRating > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                    ≥ {minRating}★
                    <button onClick={() => setMinRating(0)}>
                      <i className="ri-close-line" />
                    </button>
                  </span>
                )}
                {inStockOnly && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                    En stock
                    <button onClick={() => setInStockOnly(false)}>
                      <i className="ri-close-line" />
                    </button>
                  </span>
                )}
                {fastDeliveryOnly && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-800 border border-purple-200">
                    Express ≤ 4j
                    <button onClick={() => setFastDeliveryOnly(false)}>
                      <i className="ri-close-line" />
                    </button>
                  </span>
                )}
                <button
                  onClick={resetAllFilters}
                  className="text-xs text-red-500 hover:underline font-semibold ml-1 cursor-pointer"
                >
                  Tout effacer
                </button>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="bg-white rounded-2xl border border-red-100 p-12 text-center my-6">
                <i className="ri-error-warning-line text-4xl text-red-500 mb-2 block" />
                <h3 className="font-poppins font-bold text-gray-900 text-lg mb-1">Erreur de chargement</h3>
                <p className="text-xs text-gray-500 mb-4">{error.message || 'Impossible de charger le catalogue.'}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-5 py-2 bg-[#125C8D] text-white text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Réessayer
                </button>
              </div>
            )}

            {/* Loading state skeletons */}
            {isLoading && (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-3 border border-gray-100 animate-pulse space-y-3">
                    <div className="h-44 bg-gray-100 rounded-xl" />
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                    <div className="h-6 bg-gray-100 rounded w-1/3" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isLoading && !error && filteredProducts.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center my-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl text-gray-400">
                  🔍
                </div>
                <h3 className="font-poppins font-bold text-gray-900 text-lg mb-1">
                  Aucun produit ne correspond à vos critères
                </h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                  Modifiez vos filtres de prix, retirez certaines catégories ou essayez un autre mot-clé.
                </p>
                <button
                  onClick={resetAllFilters}
                  className="px-6 py-2.5 bg-[#FF6A00] hover:bg-[#e55f00] text-white text-xs font-semibold rounded-full cursor-pointer transition-colors shadow-sm"
                >
                  Réinitialiser tous les filtres
                </button>
              </div>
            )}

            {/* Grid view */}
            {!isLoading && !error && viewMode === 'grid' && filteredProducts.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginatedProducts.map((product) => (
                  <div key={product.id} className="relative group">
                    <ProductCard product={product} />
                    {/* Quick view button overlay */}
                    <button
                      onClick={(e) => { e.stopPropagation(); setQuickViewProduct(product); setQuickQty(1); }}
                      className="absolute top-2 left-2 z-10 px-2 py-1 rounded-md bg-white/90 backdrop-blur-sm text-[10px] font-bold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-[#125C8D] hover:text-white cursor-pointer"
                    >
                      <i className="ri-eye-line mr-1" />Aperçu
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* List view */}
            {!isLoading && !error && viewMode === 'list' && filteredProducts.length > 0 && (
              <div className="space-y-3">
                {paginatedProducts.map((product) => {
                  const wishlisted = isWishlisted(product.id);
                  const hasRating = Number(product.rating) > 0;
                  const stars = hasRating ? renderStars(product.rating) : [];
                  return (
                    <div
                      key={product.id}
                      onClick={() => navigate(`/product/${product.id}`)}
                      className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-all flex flex-col sm:flex-row gap-4 cursor-pointer"
                    >
                      <div className="w-full sm:w-44 h-44 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 relative">
                        <LazyImage
                          src={product.images?.[0] || ''}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        {product.discount && (
                          <span className="absolute top-2 left-2 bg-[#FF6A00] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                            -{product.discount}%
                          </span>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-xs font-semibold text-[#125C8D] uppercase tracking-wide">
                              {product.categoryName || 'Catalogue'}
                            </span>
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                              className="text-gray-400 hover:text-red-500 cursor-pointer"
                            >
                              <i className={`text-lg ${wishlisted ? 'ri-heart-fill text-[#FF6A00]' : 'ri-heart-line'}`} />
                            </button>
                          </div>

                          <h3 className="font-poppins font-bold text-gray-900 text-base mb-1.5 hover:text-[#125C8D] transition-colors">
                            {product.name}
                          </h3>

                          <p className="text-xs text-gray-500 line-clamp-2 mb-2.5 font-inter">
                            {product.description || 'Produit de qualité supérieure importé du Nigeria avec garantie de conformité.'}
                          </p>

                          <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap mb-2">
                            <span className="flex items-center gap-1 text-amber-500">
                              {stars.map((cls, i) => (
                                <i key={i} className={`${cls} text-xs`} />
                              ))}
                              {hasRating
                                ? <span className="font-semibold text-gray-700 ml-1">{product.rating}</span>
                                : <span className="text-gray-400">Pas encore d'avis</span>}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-gray-600">
                              <i className="ri-store-2-line text-gray-400" />
                              {product.seller || 'Marketplace nigériane'}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-emerald-600 font-medium">
                              <i className="ri-truck-line" />
                              Livraison {product.delivery_min_days || 2}-{product.delivery_max_days || 5} jours
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
                          <div>
                            <div className="flex items-baseline gap-2">
                              <PriceBreakdown price={product.price} compact />
                              {product.originalPrice && (
                                <span className="text-xs text-gray-400 line-through">
                                  {formatPrice(product.originalPrice)}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-400">Paiement protégé par Escrow</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); setQuickViewProduct(product); }}
                              className="px-3 py-1.5 border border-gray-200 text-xs font-semibold text-gray-700 rounded-xl hover:bg-gray-50 cursor-pointer"
                            >
                              Aperçu
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); addToCart(product, 1); }}
                              className="px-4 py-1.5 bg-[#125C8D] hover:bg-[#0e4870] text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm"
                            >
                              <i className="ri-shopping-cart-2-line" />
                              Ajouter
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Sourcing par lien */}
            <div className="mt-8 p-4 rounded-xl border border-dashed border-[#125C8D]/40 bg-[#E1F0F9]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-poppins font-semibold text-gray-900">Vous ne trouvez pas votre produit ?</p>
                <p className="text-xs font-inter text-gray-600">Collez le lien d'un site nigérian, nous le sourçons pour vous.</p>
              </div>
              <Link to="/sourcing" className="px-4 py-2 text-xs font-poppins font-semibold rounded-lg text-white whitespace-nowrap" style={{ backgroundColor: '#125C8D' }}>
                Sourcing par lien
              </Link>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Afficher par page :</span>
                  {[12, 16, 24, 48].map((size) => (
                    <button
                      key={size}
                      onClick={() => { setItemsPerPage(size); setPage(1); }}
                      className={`px-2.5 py-1 rounded-lg border text-xs cursor-pointer ${
                        itemsPerPage === size ? 'border-[#125C8D] bg-[#125C8D] text-white font-bold' : 'border-gray-200 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-sm disabled:opacity-30 hover:bg-gray-50 cursor-pointer"
                  >
                    <i className="ri-arrow-left-s-line" />
                  </button>

                  {Array.from({ length: totalPages }).map((_, i) => {
                    const p = i + 1;
                    if (totalPages > 7 && Math.abs(page - p) > 2 && p !== 1 && p !== totalPages) {
                      return null;
                    }
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          page === p ? 'bg-[#125C8D] text-white shadow-sm' : 'border border-gray-200 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-sm disabled:opacity-30 hover:bg-gray-50 cursor-pointer"
                  >
                    <i className="ri-arrow-right-s-line" />
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ================= MOBILE FILTERS DRAWER ================= */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[60] flex lg:hidden">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileFiltersOpen(false)} />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl p-5 overflow-y-auto z-10 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-poppins font-bold text-gray-900 text-base">Filtres du catalogue</h3>
                <button onClick={() => setMobileFiltersOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
                  <i className="ri-close-line text-xl" />
                </button>
              </div>

              {/* Categories */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Catégories</h4>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  <button
                    onClick={() => { handleCategorySelect(''); setMobileFiltersOpen(false); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold ${!selectedCategory ? 'bg-[#125C8D] text-white' : 'text-gray-700'}`}
                  >
                    Toutes les catégories
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => { handleCategorySelect(c.slug); setMobileFiltersOpen(false); }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs ${selectedCategory === c.slug ? 'bg-[#125C8D] text-white font-semibold' : 'text-gray-700'}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Prix (FCFA)</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="w-1/2 p-2 text-xs border rounded-lg"
                  />
                  <span>—</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="w-1/2 p-2 text-xs border rounded-lg"
                  />
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs text-gray-700">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                  />
                  <span>En stock uniquement</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-gray-700">
                  <input
                    type="checkbox"
                    checked={fastDeliveryOnly}
                    onChange={(e) => setFastDeliveryOnly(e.target.checked)}
                  />
                  <span>Livraison express (≤ 4 jours)</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex gap-2">
              <button
                onClick={() => { resetAllFilters(); setMobileFiltersOpen(false); }}
                className="flex-1 py-2 text-xs font-semibold text-gray-600 border border-gray-200 rounded-xl"
              >
                Réinitialiser
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 py-2 text-xs font-semibold bg-[#125C8D] text-white rounded-xl"
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= QUICK VIEW MODAL ================= */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4" onClick={() => setQuickViewProduct(null)}>
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-2xl max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto shadow-2xl p-4 sm:p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 cursor-pointer"
            >
              <i className="ri-close-line text-xl" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Image */}
              <div className="h-48 sm:h-64 md:h-80 bg-gray-50 rounded-2xl overflow-hidden relative">
                <LazyImage
                  src={quickViewProduct.images?.[0] || ''}
                  alt={quickViewProduct.name}
                  className="w-full h-full object-cover"
                />
                {quickViewProduct.discount && (
                  <span className="absolute top-3 left-3 bg-[#FF6A00] text-white text-xs font-bold px-2.5 py-1 rounded-md">
                    -{quickViewProduct.discount}%
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col justify-between h-full space-y-4">
                <div>
                  <span className="text-xs font-semibold text-[#125C8D] uppercase tracking-wider">
                    {quickViewProduct.categoryName || 'Catalogue'}
                  </span>
                  <h2 className="text-lg md:text-xl font-bold font-poppins text-gray-900 mt-1 mb-2">
                    {quickViewProduct.name}
                  </h2>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex items-center gap-1 text-amber-500">
                      {(Number(quickViewProduct.rating) > 0 ? renderStars(quickViewProduct.rating) : []).map((cls, i) => (
                        <i key={i} className={`${cls} text-xs`} />
                      ))}
                    </span>
                    <span className="text-xs text-gray-500">
                      {Number(quickViewProduct.rating) > 0 ? `${quickViewProduct.rating} · ` : ''}Vendu par <strong className="text-gray-700">{quickViewProduct.seller}</strong>
                    </span>
                  </div>

                  <PriceBreakdown price={quickViewProduct.price} size="text-2xl" />

                  <p className="text-xs text-gray-600 line-clamp-3 mb-4 leading-relaxed font-inter">
                    {quickViewProduct.description || 'Produit de qualité supérieure importé du Nigeria sous protection TrustLink Escrow.'}
                  </p>

                  <div className="p-3 bg-gray-50 rounded-xl text-xs space-y-1 mb-4">
                    <div className="flex items-center gap-2 text-emerald-700 font-medium">
                      <i className="ri-checkbox-circle-line" />
                      {quickViewProduct.stock > 0 ? `En stock (${quickViewProduct.stock} disponibles)` : 'Sur commande'}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <i className="ri-truck-line" />
                      Délai de livraison estimé : {quickViewProduct.delivery_min_days || 2} à {quickViewProduct.delivery_max_days || 5} jours
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setQuickQty(q => Math.max(1, q - 1))}
                        className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 text-gray-600 font-bold"
                      >
                        -
                      </button>
                      <span className="w-10 text-center text-sm font-semibold">{quickQty}</span>
                      <button
                        onClick={() => setQuickQty(q => q + 1)}
                        className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 text-gray-600 font-bold"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={(e) => handleQuickAddToCart(quickViewProduct, e)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                        quickAdded ? 'bg-emerald-600 text-white' : 'bg-[#125C8D] hover:bg-[#0e4870] text-white'
                      }`}
                    >
                      <i className={quickAdded ? 'ri-check-line text-sm' : 'ri-shopping-cart-2-line text-sm'} />
                      {quickAdded ? 'Ajouté au panier !' : 'Ajouter au panier'}
                    </button>
                  </div>

                  <Link
                    to={`/product/${quickViewProduct.id}`}
                    className="block text-center text-xs text-[#125C8D] hover:underline font-semibold pt-1"
                  >
                    Voir la fiche produit complète →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
