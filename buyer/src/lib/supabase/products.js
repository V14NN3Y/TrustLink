import { supabase } from '@/lib/supabaseClient';
/**
 * Fetch all approved products with their primary image.
 * Supports optional category filter and search.
 */
export const fetchProducts = async ({ category, search } = {}) => {
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
    .order('created_at', { ascending: false });
  if (category) {
    // On filtre par slug de catégorie
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', category)
      .maybeSingle();
    if (cat) query = query.eq('category_id', cat.id);
  }
  if (search) {
    query = query.ilike('name', `%${search}%`);
  }
  const { data, error } = await query;
  if (error) throw error;
  // Normaliser pour correspondre à la structure attendue par les composants
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
    .select('id, name, slug, image_url')
    .order('name');
  if (error) throw error;
  return data || [];
};
/**
 * Normalize a Supabase product row to match the shape
 * expected by ProductCard, ProductPage, etc.
 */
const normalizeProduct = (p) => {
  // Trier les images : primary d'abord, puis par sort_order
  const sortedImages = [...(p.product_images || [])].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return (a.sort_order || 0) - (b.sort_order || 0);
  });
  const images = sortedImages.map((img) => img.url);
  return {
    id: p.id,
    name: p.name,
    description: p.description || '',
    price: Number(p.price),
    originalPrice: null,       // pas dans le schéma, à ajouter plus tard si besoin
    discount: null,            // idem
    isNew: false,              // idem
    rating: 0,                 // sera calculé depuis reviews plus tard
    sales: 0,                  // idem
    stock: p.stock_quantity,
    seller: p.profiles?.business_name || p.profiles?.full_name || 'Vendeur TrustLink',
    seller_id: p.seller_id,
    category: p.categories?.slug || '',
    categoryName: p.categories?.name || '',
    images: images.length > 0 ? images : ['https://readdy.ai/api/search-image?query=product+placeholder+clean+white+background+minimal&width=400&height=400&seq=placeholder1&orientation=squarish'],
    variants: {
      sizes: [],   // à implémenter avec une table product_variants plus tard
      colors: [],
    },
  };
};
