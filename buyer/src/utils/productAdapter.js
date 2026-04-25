// Centralise la conversion SharedProduct → Product
// Importé par home/page et product/page pour éviter la duplication

export function sharedProductToProduct(sp) {
  return {
    id: sp.id,
    name: sp.name,
    category: sp.category,
    price: sp.price_xof,
    originalPrice: null,
    discount: null,
    images:
      sp.images && sp.images.length > 0
        ? sp.images
        : [
            'https://readdy.ai/api/search-image?query=product placeholder clean white background minimal&width=400&height=400&seq=placeholder&orientation=squarish',
          ],
    rating: 4.5,
    sales: 0,
    variants: { sizes: [], colors: [] },
    description: sp.description,
    seller: sp.seller_name,
    inStock: sp.stock > 0,
    isNew: true,
    isFeatured: false,
  };
}
