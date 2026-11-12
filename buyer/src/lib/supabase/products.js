import { supabase } from '@/lib/supabaseClient';
import fallbackProducts from '@/data/scrapedProducts.json';

const PLACEHOLDER_IMAGE = '/placeholder-product.svg';

/**
 * Fetch approved products with optional category filter, search, price range, and pagination.
 * Merges Supabase live products with curated scraped catalog data.
 */
export const fetchProducts = async ({
  category,
  search,
  minPrice,
  maxPrice,
  inStockOnly,
  sortBy = 'newest',
  limit = 100,
} = {}) => {
  let dbProducts = [];
  try {
    const query = supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        price,
        stock_quantity,
        seller_id,
        category_id,
        created_at,
        delivery_min_days,
        delivery_max_days,
        product_images (
          url,
          is_primary,
          sort_order
        ),
        categories (
          id,
          name,
          slug,
          icon
        ),
        profiles!seller_id (
          full_name,
          business_name
        )
      `)
      .eq('status', 'approved');

    const { data, error } = await query;
    if (!error && Array.isArray(data)) {
      dbProducts = data.map(normalizeProduct);
    }
  } catch (err) {
    console.warn('[Supabase] Failed to fetch products, using local catalog:', err);
  }

  // Combine DB products with scraped catalog items (avoiding duplicates by name)
  const existingNames = new Set(dbProducts.map(p => (p.name || '').trim().toLowerCase()));
  const newScraped = fallbackProducts.filter(p => !existingNames.has((p.name || '').trim().toLowerCase()));

  let allProducts = [...dbProducts, ...newScraped];

  // Category filter
  if (category && category !== 'all') {
    allProducts = allProducts.filter(p =>
      p.category === category || p.category_slug === category || p.category_key === category
    );
  }

  // Search filter
  if (search) {
    const q = search.toLowerCase();
    allProducts = allProducts.filter(p =>
      (p.name || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q)
    );
  }

  // Price range filters
  if (minPrice) {
    allProducts = allProducts.filter(p => Number(p.price) >= Number(minPrice));
  }
  if (maxPrice) {
    allProducts = allProducts.filter(p => Number(p.price) <= Number(maxPrice));
  }

  // In stock filter
  if (inStockOnly) {
    allProducts = allProducts.filter(p => Number(p.stock || p.stock_quantity || 0) > 0);
  }

  // Sorting
  if (sortBy === 'price_asc') {
    allProducts.sort((a, b) => Number(a.price) - Number(b.price));
  } else if (sortBy === 'price_desc') {
    allProducts.sort((a, b) => Number(b.price) - Number(a.price));
  } else if (sortBy === 'rating') {
    allProducts.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
  }

  return allProducts.slice(0, limit);
};

/**
 * Fetch a single product by ID with all images.
 */
export const fetchProductById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        price,
        stock_quantity,
        seller_id,
        category_id,
        created_at,
        delivery_min_days,
        delivery_max_days,
        product_images (
          url,
          is_primary,
          sort_order
        ),
        categories (
          id,
          name,
          slug
        ),
        profiles!seller_id (
          full_name,
          business_name
        )
      `)
      .eq('id', id)
      .eq('status', 'approved')
      .maybeSingle();

    if (!error && data) return normalizeProduct(data);
  } catch (err) {
    console.warn('[Supabase] Failed to fetch product by id, checking scraped catalog:', err);
  }

  const found = fallbackProducts.find(p => p.id === id || p.sku === id);
  return found || null;
};

/**
 * Fetch all categories.
 */
export const fetchCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, icon')
      .is('parent_id', null)
      .order('sort_order', { ascending: true })
      .order('name');
    if (!error && data && data.length > 0) return data;
  } catch (err) {
    console.warn('[Supabase] Failed to fetch categories from DB:', err);
  }

  return [
    { id: 'cat-1', name: 'Smartphones & Tablettes', slug: 'smartphones-tablettes', icon: 'ri-smartphone-line' },
    { id: 'cat-2', name: 'Électronique & TV', slug: 'audio-casques', icon: 'ri-tv-line' },
    { id: 'cat-3', name: 'Ordinateurs & Bureautique', slug: 'ordinateurs-bureautique', icon: 'ri-laptop-line' },
    { id: 'cat-4', name: 'Mode & Vêtements', slug: 'mode-vetements', icon: 'ri-t-shirt-line' },
    { id: 'cat-5', name: 'Cuisine & Arts de la table', slug: 'cuisine-table', icon: 'ri-cup-line' },
    { id: 'cat-6', name: 'Beauté & Soins', slug: 'beaute-soins', icon: 'ri-sparkling-line' },
  ];
};

/**
 * Normalize a Supabase product row to match the shape
 * expected by ProductCard, ProductPage, etc.
 */
const normalizeProduct = (p) => {
  const sortedImages = [...(p.product_images || [])].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return (a.sort_order || 0) - (b.sort_order || 0);
  });
  const images = sortedImages.map((img) => img.url).filter(Boolean);

  const createdAt = new Date(p.created_at);
  const diffDays = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  const isNew = diffDays <= 14;

  return {
    id: p.id,
    name: p.name,
    description: p.description || '',
    price: Number(p.price),
    originalPrice: null,
    discount: null,
    isNew,
    rating: 0,
    sales: 0,
    stock: p.stock_quantity,
    seller: p.profiles?.business_name || p.profiles?.full_name || 'Vendeur TrustLink',
    seller_id: p.seller_id,
    seller_rating: 0,
    seller_sales: 0,
    delivery_min_days: p.delivery_min_days || null,
    delivery_max_days: p.delivery_max_days || null,
    category: p.categories?.slug || '',
    categoryName: p.categories?.name || '',
    images: images.length > 0 ? images : [PLACEHOLDER_IMAGE],
    variants: {
      sizes: [],
      colors: [],
    },
  };
};
