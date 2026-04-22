export type ProductStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
export type DisputeStatus = 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
export type MessageRole = 'BUYER' | 'SELLER' | 'ADMIN';

export interface Product {
  id: string; name: string; category: string;
  seller_name: string; seller_id: string;
  price_ngn: number; price_xof: number;
  images: string[]; description: string;
  status: ProductStatus; submitted_at: string; reject_reason?: string;
}

export interface DisputeMessage {
  id: number; role: MessageRole; author: string;
  content: string; timestamp: string;
}

export interface Dispute {
  id: string; order_ref: string; buyer_name: string; seller_name: string;
  reason: string; status: DisputeStatus; amount_xof: number;
  created_at: string; video_url?: string;
  messages: DisputeMessage[]; resolution?: string;
}

export const PRODUCTS: Product[] = [
  { id: 'prod-001', name: 'iPhone 15 Pro 256GB Titane', category: 'Électronique', seller_name: 'Emeka Tech Store', seller_id: 'SLR-0058', price_ngn: 895000, price_xof: 1639940, images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400', 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400'], description: 'iPhone 15 Pro neuf, scellé, garantie 1 an. Déverrouillé tout opérateur.', status: 'PENDING_REVIEW', submitted_at: '2024-12-15T08:00:00Z' },
  { id: 'prod-002', name: 'Tissus Wax Holland — 12 yards', category: 'Textile', seller_name: 'Lagos Fabric House', seller_id: 'SLR-0029', price_ngn: 45000, price_xof: 82440, images: ['https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400'], description: 'Tissus Holland authentique, motifs exclusifs. 100% coton.', status: 'PENDING_REVIEW', submitted_at: '2024-12-15T09:30:00Z' },
  { id: 'prod-003', name: 'Groupe électrogène Sumec 7.5KVA', category: 'Énergie', seller_name: 'Power Solutions NG', seller_id: 'SLR-0091', price_ngn: 285000, price_xof: 522420, images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'], description: 'Groupe électrogène 7.5 KVA, démarrage automatique. Garantie 18 mois.', status: 'PENDING_REVIEW', submitted_at: '2024-12-15T10:00:00Z' },
  { id: 'prod-004', name: 'Climatiseur Samsung WindFree 18000 BTU', category: 'Électroménager', seller_name: 'Cool Tech Lagos', seller_id: 'SLR-0037', price_ngn: 195000, price_xof: 357240, images: ['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400'], description: 'Climatiseur Inverter classe A++. Économie énergie maximale.', status: 'PENDING_REVIEW', submitted_at: '2024-12-15T11:00:00Z' },
  { id: 'prod-005', name: 'MacBook Pro M3 Pro 14" 18GB', category: 'Informatique', seller_name: 'Apple Reseller ABJ', seller_id: 'SLR-0064', price_ngn: 1450000, price_xof: 2657600, images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400'], description: 'MacBook Pro M3 Pro neuf scellé, facture originale Apple.', status: 'PENDING_REVIEW', submitted_at: '2024-12-14T15:00:00Z' },
];

export const DISPUTES: Dispute[] = [
  {
    id: 'disp-001', order_ref: 'TL-2024-0893', buyer_name: 'Rodrigue Akplogan', seller_name: 'Emeka Eze',
    reason: 'Produit reçu avec écran fissuré — dommage survenu pendant le transport.',
    status: 'INVESTIGATING', amount_xof: 1462500, created_at: '2024-12-13T16:00:00Z',
    video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    messages: [
      { id: 1, role: 'BUYER', author: 'Rodrigue Akplogan', content: "J'ai reçu mon MacBook Pro avec l'écran complètement fissuré. Je veux un remboursement immédiat.", timestamp: '2024-12-13T16:05:00Z' },
      { id: 2, role: 'SELLER', author: 'Emeka Eze', content: 'Le produit était en parfait état à expédition. La dégradation vient du transport, pas de moi.', timestamp: '2024-12-13T16:45:00Z' },
      { id: 3, role: 'ADMIN', author: 'Admin TrustLink', content: 'Nous avons ouvert une investigation. Les fonds restent bloqués en escrow.', timestamp: '2024-12-13T17:00:00Z' },
      { id: 4, role: 'BUYER', author: 'Rodrigue Akplogan', content: "J'ai envoyé la vidéo in-app prouvant l'état du colis à l'ouverture.", timestamp: '2024-12-14T09:00:00Z' },
      { id: 5, role: 'SELLER', author: 'Emeka Eze', content: "Je suis prêt à rembourser 50% si l'admin constate que le dommage n'est pas lié à mon packaging.", timestamp: '2024-12-14T10:30:00Z' },
    ]
  },
  {
    id: 'disp-002', order_ref: 'TL-2024-0878', buyer_name: 'Aurélien Kpossa', seller_name: 'Ngozi Fashion',
    reason: 'Tissus reçus mais couleurs totalement différentes de la photo annonce.',
    status: 'OPEN', amount_xof: 275000, created_at: '2024-12-15T09:00:00Z',
    messages: [
      { id: 1, role: 'BUYER', author: 'Aurélien Kpossa', content: 'Les tissus reçus ne correspondent pas aux photos. Les couleurs sont complètement différentes !', timestamp: '2024-12-15T09:05:00Z' },
      { id: 2, role: 'SELLER', author: 'Ngozi Fashion', content: 'Les couleurs peuvent légèrement varier selon les écrans. Produit conforme au stock.', timestamp: '2024-12-15T10:00:00Z' },
    ]
  },
  {
    id: 'disp-003', order_ref: 'TL-2024-0855', buyer_name: 'Félix Adandé', seller_name: 'Power Solutions NG',
    reason: 'Générateur livré mais ne démarre pas. Défaut électrique dès la première mise en marche.',
    status: 'RESOLVED', amount_xof: 562500, created_at: '2024-12-10T14:00:00Z',
    resolution: 'Remboursement total accordé à l\'acheteur. Vendeur responsable défaut produit.',
    messages: [
      { id: 1, role: 'BUYER', author: 'Félix Adandé', content: 'Le générateur ne démarre pas du tout. Défaut d\'usine confirmé par un électricien.', timestamp: '2024-12-10T14:05:00Z' },
      { id: 2, role: 'ADMIN', author: 'Admin TrustLink', content: 'Défaut d\'usine confirmé. Remboursement total initié.', timestamp: '2024-12-12T11:00:00Z' },
    ]
  },
];
