import { getActiveSharedProducts, getExchangeRate, ngnToXof } from '@/lib/storage';

export const CATEGORIES = [
  { id: 'mode', label: 'Mode', icon: 'ri-t-shirt-line' },
  { id: 'beaute', label: 'Beauté', icon: 'ri-sparkling-line' },
  { id: 'hightech', label: 'High-Tech', icon: 'ri-smartphone-line' },
  { id: 'auto', label: 'Auto', icon: 'ri-car-line' },
  { id: 'maison', label: 'Maison', icon: 'ri-home-4-line' },
  { id: 'sport', label: 'Sport', icon: 'ri-run-line' },
];

// ─── Fallback mock products (used when localStorage is empty) ──────
const FALLBACK_PRODUCTS = [
  {
    id: 'p001',
    name: 'Robe Ankara Élégante Femme',
    category: 'mode',
    price: 28500,
    originalPrice: 35000,
    discount: 19,
    images: [
      'https://readdy.ai/api/search-image?query=African%20woman%20wearing%20colorful%20Ankara%20wrap%20dress%20Nigerian%20fashion%20vibrant%20orange%20blue%20patterns%20elegant%20portrait%20white%20background%20professional%20product%20photography%20studio%20light&width=400&height=400&seq=101&orientation=squarish',
    ],
    rating: 4.8,
    sales: 342,
    variants: {
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: [
        { name: 'Orange', hex: '#FF6A00' },
        { name: 'Bleu', hex: '#125C8D' },
        { name: 'Vert', hex: '#16A34A' },
      ],
    },
    description: 'Robe Ankara confectionnée à Lagos avec des tissus premium. Idéale pour les cérémonies et soirées élégantes.',
    seller: 'Lagos Fashion House',
    inStock: true,
    isFeatured: true,
    isNew: false,
  },
  {
    id: 'p002',
    name: 'Agbada Brodé Homme Cérémonial',
    category: 'mode',
    price: 45000,
    originalPrice: null,
    discount: null,
    images: [
      'https://readdy.ai/api/search-image?query=Nigerian%20man%20wearing%20traditional%20Agbada%20embroidered%20robe%20white%20gold%20ceremonial%20attire%20elegant%20portrait%20professional%20photography%20studio%20background&width=400&height=400&seq=102&orientation=squarish',
    ],
    rating: 4.9,
    sales: 187,
    variants: {
      sizes: ['M', 'L', 'XL', 'XXL'],
      colors: [
        { name: 'Blanc', hex: '#FFFFFF' },
        { name: 'Crème', hex: '#FDF5E6' },
        { name: 'Bleu Royal', hex: '#1E3A8A' },
      ],
    },
    description: 'Agbada traditionnel brodé à la main par des artisans nigérians. Tissu gaze de haute qualité avec broderies or.',
    seller: 'Abuja Royal Wear',
    inStock: true,
    isFeatured: true,
    isNew: true,
  },
  {
    id: 'p003',
    name: 'Dashiki Premium Mixte',
    category: 'mode',
    price: 18500,
    originalPrice: 22000,
    discount: 16,
    images: [
      'https://readdy.ai/api/search-image?query=Colorful%20African%20Dashiki%20shirt%20traditional%20Nigerian%20fashion%20unisex%20embroidered%20neckline%20vibrant%20yellow%20orange%20geometric%20patterns%20product%20photography%20white%20background&width=400&height=400&seq=103&orientation=squarish',
    ],
    rating: 4.6,
    sales: 521,
    variants: {
      sizes: ['S', 'M', 'L', 'XL'],
      colors: [
        { name: 'Jaune', hex: '#EAB308' },
        { name: 'Rouge', hex: '#DC2626' },
        { name: 'Vert', hex: '#16A34A' },
      ],
    },
    description: 'Dashiki unisexe en coton doux avec col brodé à la main. Parfait pour un look africain authentique au quotidien.',
    seller: 'Kano Textile Co',
    inStock: true,
    isNew: false,
    isFeatured: false,
  },
  {
    id: 'p004',
    name: 'Kit Soin Visage Naturel African Glow',
    category: 'beaute',
    price: 15000,
    originalPrice: 19500,
    discount: 23,
    images: [
      'https://readdy.ai/api/search-image?query=Natural%20African%20skincare%20beauty%20kit%20shea%20butter%20coconut%20oil%20serum%20glass%20bottles%20elegant%20arrangement%20white%20background%20product%20photography%20luxury%20cosmetics%20set&width=400&height=400&seq=201&orientation=squarish',
    ],
    rating: 4.7,
    sales: 298,
    variants: {
      sizes: [],
      colors: [],
    },
    description: 'Kit complet soin visage avec beurre de karité pur, huile de baobab et sérum à la vitamine C. Formulé pour les peaux africaines.',
    seller: 'Lagos Beauty Lab',
    inStock: true,
    isFeatured: true,
    isNew: true,
  },
  {
    id: 'p005',
    name: 'Huile de Coco Bio Extra Vierge',
    category: 'beaute',
    price: 8500,
    originalPrice: null,
    discount: null,
    images: [
      'https://readdy.ai/api/search-image?query=Organic%20coconut%20oil%20glass%20jar%20beauty%20product%20African%20natural%20cosmetics%20white%20background%20clean%20minimal%20product%20photography%20premium%20beauty%20care&width=400&height=400&seq=202&orientation=squarish',
    ],
    rating: 4.8,
    sales: 743,
    variants: {
      sizes: ['100ml', '250ml', '500ml'],
      colors: [],
    },
    description: 'Huile de coco pressée à froid, 100% biologique certifiée. Multipurpose : cheveux, peau, cuisine.',
    seller: 'NatureCare Nigeria',
    inStock: true,
    isNew: false,
    isFeatured: false,
  },
  {
    id: 'p006',
    name: 'iPhone 14 Pro Max 256Go',
    category: 'hightech',
    price: 485000,
    originalPrice: 520000,
    discount: 7,
    images: [
      'https://readdy.ai/api/search-image?query=iPhone%2014%20Pro%20Max%20space%20black%20deep%20purple%20smartphone%20front%20back%20view%20professional%20product%20photography%20white%20background%20clean%20minimal%20Apple%20device&width=400&height=400&seq=301&orientation=squarish',
    ],
    rating: 4.9,
    sales: 156,
    variants: {
      sizes: ['128Go', '256Go', '512Go'],
      colors: [
        { name: 'Noir Sidéral', hex: '#1C1C1E' },
        { name: 'Violet', hex: '#6B21A8' },
        { name: 'Argent', hex: '#C0C0C0' },
      ],
    },
    description: 'iPhone 14 Pro Max déverrouillé. Puce A16 Bionic, Dynamic Island, caméra 48MP ProRAW. Garantie internationale 1 an.',
    seller: 'TechHub Lagos',
    inStock: true,
    isFeatured: true,
    isNew: false,
  },
  {
    id: 'p007',
    name: 'Samsung Galaxy A54 5G',
    category: 'hightech',
    price: 185000,
    originalPrice: 210000,
    discount: 12,
    images: [
      'https://readdy.ai/api/search-image?query=Samsung%20Galaxy%20A54%20smartphone%20Android%20mobile%20phone%20awesome%20violet%20product%20photography%20white%20background%20modern%20clean%20tech%20device&width=400&height=400&seq=302&orientation=squarish',
    ],
    rating: 4.5,
    sales: 423,
    variants: {
      sizes: ['128Go', '256Go'],
      colors: [
        { name: 'Awesome Violet', hex: '#7C3AED' },
        { name: 'Awesome Graphite', hex: '#374151' },
        { name: 'Awesome White', hex: '#F3F4F6' },
      ],
    },
    description: 'Samsung Galaxy A54 5G avec écran AMOLED 6.4", triple caméra 50MP, batterie 5000mAh. Smartphone milieu de gamme premium.',
    seller: 'TechHub Lagos',
    inStock: true,
    isNew: false,
    isFeatured: false,
  },
  {
    id: 'p008',
    name: 'Écouteurs Bluetooth TWS Pro',
    category: 'hightech',
    price: 35000,
    originalPrice: 42000,
    discount: 17,
    images: [
      'https://readdy.ai/api/search-image?query=Wireless%20bluetooth%20TWS%20earbuds%20headphones%20charging%20case%20white%20product%20photography%20clean%20minimal%20tech%20gadget%20premium%20audio%20device&width=400&height=400&seq=303&orientation=squarish',
    ],
    rating: 4.6,
    sales: 612,
    variants: {
      sizes: [],
      colors: [
        { name: 'Blanc', hex: '#FFFFFF' },
        { name: 'Noir', hex: '#111827' },
        { name: 'Bleu', hex: '#125C8D' },
      ],
    },
    description: 'Écouteurs sans fil TWS avec réduction de bruit active, autonomie 30h avec boîtier, Bluetooth 5.3, résistant à l\'eau IPX5.',
    seller: 'Gadgets & Tech Abuja',
    inStock: true,
    isNew: true,
    isFeatured: false,
  },
  {
    id: 'p009',
    name: 'Tapis de Sol Voiture Premium',
    category: 'auto',
    price: 22000,
    originalPrice: 28000,
    discount: 21,
    images: [
      'https://readdy.ai/api/search-image?query=Black%20rubber%20car%20floor%20mats%20set%20universal%20fit%20premium%20product%20photography%20white%20background%20clean%20automotive%20accessory%20professional&width=400&height=400&seq=401&orientation=squarish',
    ],
    rating: 4.5,
    sales: 234,
    variants: {
      sizes: ['Universel', 'SUV'],
      colors: [
        { name: 'Noir', hex: '#111827' },
        { name: 'Gris', hex: '#6B7280' },
      ],
    },
    description: 'Jeu complet de 4 tapis en caoutchouc premium, lavables et antidérapants. Compatible avec la majorité des véhicules.',
    seller: 'AutoParts Nigeria',
    inStock: true,
    isNew: false,
    isFeatured: false,
  },
  {
    id: 'p010',
    name: 'Parfum Voiture Luxury Oud',
    category: 'auto',
    price: 8500,
    originalPrice: null,
    discount: null,
    images: [
      'https://readdy.ai/api/search-image?query=Car%20air%20freshener%20luxury%20perfume%20vent%20clip%20oud%20arabic%20fragrance%20premium%20product%20photography%20white%20background%20automotive%20accessory%20minimal%20elegant&width=400&height=400&seq=402&orientation=squarish',
    ],
    rating: 4.7,
    sales: 889,
    variants: {
      sizes: [],
      colors: [],
    },
    description: 'Diffuseur de parfum pour voiture à l\'oud nigérian. Fixation sur grille d\'aération, longue durée 60 jours.',
    seller: 'AutoParts Nigeria',
    inStock: true,
    isNew: false,
    isFeatured: false,
  },
  {
    id: 'p011',
    name: 'Coussin Décoratif Ankara Maison',
    category: 'maison',
    price: 12000,
    originalPrice: 15000,
    discount: 20,
    images: [
      'https://readdy.ai/api/search-image?query=African%20Ankara%20fabric%20decorative%20cushion%20pillow%20colorful%20traditional%20Nigerian%20patterns%20home%20decor%20product%20photography%20white%20background%20vibrant%20interior&width=400&height=400&seq=501&orientation=squarish',
    ],
    rating: 4.6,
    sales: 367,
    variants: {
      sizes: ['40x40cm', '50x50cm'],
      colors: [
        { name: 'Orange Multi', hex: '#FF6A00' },
        { name: 'Bleu Multi', hex: '#125C8D' },
      ],
    },
    description: 'Coussin décoratif en tissu Ankara authentique avec rembourrage fibre synthétique premium. Apporte une touche africaine chaleureuse.',
    seller: 'Décor Lagos Home',
    inStock: true,
    isNew: false,
    isFeatured: false,
  },
  {
    id: 'p012',
    name: 'Set Vaisselle Céramique Africaine 6 pièces',
    category: 'maison',
    price: 28000,
    originalPrice: 35000,
    discount: 20,
    images: [
      'https://readdy.ai/api/search-image?query=African%20ceramic%20dinnerware%20set%20plates%20bowls%20colorful%20traditional%20patterns%20handmade%20pottery%20home%20decor%20product%20photography%20white%20background%20artisan&width=400&height=400&seq=502&orientation=squarish',
    ],
    rating: 4.8,
    sales: 142,
    variants: {
      sizes: ['6 pièces', '12 pièces'],
      colors: [
        { name: 'Terracotta', hex: '#C2410C' },
        { name: 'Bleu Indigo', hex: '#312E81' },
      ],
    },
    description: 'Service de table artisanal en céramique peinte à la main avec motifs adinkra. 6 assiettes + 6 bols. Passe au lave-vaisselle.',
    seller: 'Craft House Lagos',
    inStock: true,
    isNew: true,
    isFeatured: false,
  },
  {
    id: 'p013',
    name: 'Sac de Sport Imperméable 40L',
    category: 'sport',
    price: 18500,
    originalPrice: 24000,
    discount: 23,
    images: [
      'https://readdy.ai/api/search-image?query=Black%20waterproof%20sports%20gym%20duffel%20bag%2040L%20product%20photography%20white%20background%20clean%20minimal%20athletic%20gear%20premium%20quality&width=400&height=400&seq=601&orientation=squarish',
    ],
    rating: 4.6,
    sales: 483,
    variants: {
      sizes: ['30L', '40L', '50L'],
      colors: [
        { name: 'Noir', hex: '#111827' },
        { name: 'Marine', hex: '#1E3A8A' },
        { name: 'Kaki', hex: '#78716C' },
      ],
    },
    description: 'Sac de sport imperméable avec compartiment chaussures séparé, poignées renforcées et bandoulière amovible. Idéal gym et voyage.',
    seller: 'SportZone Nigeria',
    inStock: true,
    isNew: false,
    isFeatured: false,
  },
  {
    id: 'p014',
    name: 'Chaussures Running Légères AirFlex',
    category: 'sport',
    price: 42000,
    originalPrice: 52000,
    discount: 19,
    images: [
      'https://readdy.ai/api/search-image?query=Lightweight%20running%20sneakers%20athletic%20shoes%20white%20blue%20orange%20product%20photography%20white%20background%20sport%20footwear%20premium%20quality%20professional&width=400&height=400&seq=602&orientation=squarish',
    ],
    rating: 4.7,
    sales: 276,
    variants: {
      sizes: ['38', '39', '40', '41', '42', '43', '44', '45'],
      colors: [
        { name: 'Blanc/Orange', hex: '#FF6A00' },
        { name: 'Noir/Bleu', hex: '#125C8D' },
      ],
    },
    description: 'Chaussures de running ultra-légères avec semelle EVA amorti et mesh respirant. Idéales pour la course sur route et trail léger.',
    seller: 'SportZone Nigeria',
    inStock: true,
    isNew: true,
    isFeatured: true,
  },
];

/**
 * Normalize a shared-format product (from Seller Hub / localStorage) 
 * into the format expected by the Marketplace UI components.
 */
function normalizeSharedProduct(sp) {
  const rate = getExchangeRate();
  const priceXof = sp.price_xof || Math.round((sp.price_ngn || 0) * rate);

  return {
    id: sp.id,
    name: sp.name,
    category: (sp.category || '').toLowerCase().replace('-', ''),
    price: priceXof,
    originalPrice: sp.original_price_xof || null,
    discount: sp.discount || null,
    images: sp.image ? [sp.image] : (sp.images || []),
    rating: sp.rating ?? 4.5,
    sales: sp.sales ?? 0,
    variants: sp.variants || { sizes: [], colors: [] },
    description: sp.description || '',
    seller: sp.seller_name || 'Vendeur TrustLink',
    inStock: (sp.stock_total ?? 1) > 0,
    isFeatured: sp.is_featured || false,
    isNew: sp.is_new || false,
    // Keep shared fields for order creation
    _price_ngn: sp.price_ngn,
    _price_xof: priceXof,
    _seller_id: sp.seller_id,
    _product_id: sp.id,
  };
}

/**
 * Get all products for the Marketplace.
 * Priority: localStorage (shared tl_products) → fallback mock data.
 * Only shows active products from shared storage.
 */
export function getProducts() {
  const shared = getActiveSharedProducts();
  if (shared && shared.length > 0) {
    return shared.map(normalizeSharedProduct);
  }
  return FALLBACK_PRODUCTS;
}

/**
 * PRODUCTS — backward-compatible static export.
 * Pages that import { PRODUCTS } will still work.
 * For reactivity, use getProducts() at render time instead.
 */
export const PRODUCTS = getProducts();
