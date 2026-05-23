import { supabase } from '@/lib/supabaseClient';

const PLACEHOLDER_IMAGE = '/placeholder-product.svg';

/**
 * Fetch approved products with optional category filter, search, and pagination.
 * Returns an array of normalized products.
 */
export const fetchProducts = async ({ category, search, limit = 100 } = {}) => {
  let query = supabase
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
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (category) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', category)
      .maybeSingle();
    if (cat) query = query.eq('category_id', cat.id);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map(normalizeProduct);
};

/**
 * Fetch a single product by ID with all images.
 */
export const fetchProductById = async (id) => {
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
  if (error) throw error;
  if (!data) return null;
  return normalizeProduct(data);
};

/**
 * Fetch all categories.
 */
export const fetchCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, icon')
    .is('parent_id', null)
    .order('sort_order', { ascending: true })
    .order('name');
  if (error) throw error;
  return data || [];
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
