export type OrderStatus = 'PENDING' | 'FUNDED' | 'IN_TRANSIT' | 'CUSTOMS' | 'DELIVERED' | 'DISPUTED';

export interface Order {
  id: string; ref: string; status: OrderStatus;
  journey_step: string; hub_origin: 'Lagos' | 'Abuja';
  seller_name: string; seller_id: string;
  buyer_name: string; product: string;
  amount_xof: number; amount_ngn: number; created_at: string;
  voyage_id?: string; delivery_proof?: string;
  dispute_video_url?: string; dispute_reason?: string;
}

export const ORDERS: Order[] = [
  { id: 'ord-001', ref: 'TL-2024-0891', status: 'FUNDED', journey_step: 'payment_confirmed', hub_origin: 'Lagos', seller_name: 'Chukwuemeka Obi', seller_id: 'SLR-0042', buyer_name: 'Kofi Mensah', product: 'Samsung Galaxy A54 × 3', amount_xof: 847500, amount_ngn: 462500, created_at: '2024-12-15T10:30:00Z', voyage_id: 'VY-2024-041' },
  { id: 'ord-002', ref: 'TL-2024-0892', status: 'IN_TRANSIT', journey_step: 'shipped', hub_origin: 'Lagos', seller_name: 'Adaeze Nwosu', seller_id: 'SLR-0017', buyer_name: 'Parfait Hounto', product: 'Tissus Ankara 50m', amount_xof: 325000, amount_ngn: 177500, created_at: '2024-12-14T08:15:00Z', voyage_id: 'VY-2024-041' },
  { id: 'ord-003', ref: 'TL-2024-0893', status: 'DISPUTED', journey_step: 'dispute_opened', hub_origin: 'Abuja', seller_name: 'Emeka Eze', seller_id: 'SLR-0058', buyer_name: 'Rodrigue Akplogan', product: 'MacBook Pro M3 × 1', amount_xof: 1462500, amount_ngn: 797500, created_at: '2024-12-13T14:20:00Z', voyage_id: 'VY-2024-039', dispute_video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', dispute_reason: 'Produit reçu endommagé — écran fissuré à la réception.' },
  { id: 'ord-004', ref: 'TL-2024-0894', status: 'CUSTOMS', journey_step: 'at_customs', hub_origin: 'Lagos', seller_name: 'Chioma Igwe', seller_id: 'SLR-0033', buyer_name: 'Gilles Ahouansou', product: 'iPhone 15 Pro × 2', amount_xof: 1235000, amount_ngn: 673500, created_at: '2024-12-12T09:45:00Z', voyage_id: 'VY-2024-040' },
  { id: 'ord-005', ref: 'TL-2024-0895', status: 'DELIVERED', journey_step: 'delivered', hub_origin: 'Abuja', seller_name: 'Kelechi Amadi', seller_id: 'SLR-0071', buyer_name: 'Bertrand Dossou', product: 'Generateur 5KVA × 1', amount_xof: 562500, amount_ngn: 306500, created_at: '2024-12-11T16:00:00Z', voyage_id: 'VY-2024-038' },
  { id: 'ord-006', ref: 'TL-2024-0896', status: 'PENDING', journey_step: 'awaiting_payment', hub_origin: 'Lagos', seller_name: 'Ngozi Okeke', seller_id: 'SLR-0029', buyer_name: 'Aurélien Kpossa', product: 'Câbles électriques 100m', amount_xof: 187500, amount_ngn: 102000, created_at: '2024-12-15T14:30:00Z' },
  { id: 'ord-007', ref: 'TL-2024-0897', status: 'FUNDED', journey_step: 'ready_to_ship', hub_origin: 'Abuja', seller_name: 'Babatunde Alabi', seller_id: 'SLR-0088', buyer_name: 'Constant Agbo', product: 'Climatiseur LG 2.5T × 2', amount_xof: 693000, amount_ngn: 378000, created_at: '2024-12-15T11:00:00Z', voyage_id: 'VY-2024-042' },
  { id: 'ord-008', ref: 'TL-2024-0898', status: 'IN_TRANSIT', journey_step: 'in_transit', hub_origin: 'Lagos', seller_name: 'Funmilayo Bello', seller_id: 'SLR-0055', buyer_name: 'Jérôme Houndjago', product: 'Téléviseur Sony 55" × 1', amount_xof: 412500, amount_ngn: 225000, created_at: '2024-12-14T07:30:00Z', voyage_id: 'VY-2024-041' },
  { id: 'ord-009', ref: 'TL-2024-0899', status: 'DELIVERED', journey_step: 'delivered', hub_origin: 'Lagos', seller_name: 'Rotimi Fashola', seller_id: 'SLR-0012', buyer_name: 'Modeste Lokossou', product: 'Pompe hydraulique × 3', amount_xof: 225000, amount_ngn: 122500, created_at: '2024-12-10T13:00:00Z', voyage_id: 'VY-2024-037' },
  { id: 'ord-010', ref: 'TL-2024-0900', status: 'CUSTOMS', journey_step: 'customs_inspection', hub_origin: 'Abuja', seller_name: 'Obiageli Okonkwo', seller_id: 'SLR-0064', buyer_name: 'Prosper Adandé', product: 'Groupe électrogène 10KVA', amount_xof: 1125000, amount_ngn: 613500, created_at: '2024-12-12T10:00:00Z', voyage_id: 'VY-2024-040' },
  { id: 'ord-011', ref: 'TL-2024-0901', status: 'PENDING', journey_step: 'awaiting_payment', hub_origin: 'Lagos', seller_name: 'Oluwaseun Adeyemi', seller_id: 'SLR-0091', buyer_name: 'Félicien Houénou', product: 'Laptops Dell i7 × 5', amount_xof: 1875000, amount_ngn: 1022500, created_at: '2024-12-15T15:00:00Z' },
  { id: 'ord-012', ref: 'TL-2024-0902', status: 'FUNDED', journey_step: 'payment_confirmed', hub_origin: 'Lagos', seller_name: 'Amarachi Onu', seller_id: 'SLR-0037', buyer_name: 'Thierry Agossou', product: 'Moteur électrique 3HP × 2', amount_xof: 337500, amount_ngn: 184000, created_at: '2024-12-15T09:00:00Z', voyage_id: 'VY-2024-042' },
];

export const JOURNEY_STEPS = [
  { key: 'awaiting_payment', label: 'Paiement escrow' },
  { key: 'payment_confirmed', label: 'Paiement confirmé' },
  { key: 'ready_to_ship', label: 'Prêt à expédier' },
  { key: 'shipped', label: 'Expédié' },
  { key: 'in_transit', label: 'En transit' },
  { key: 'at_customs', label: 'Douane' },
  { key: 'customs_inspection', label: 'Inspection douane' },
  { key: 'delivered', label: 'Livré' },
  { key: 'dispute_opened', label: 'Litige ouvert' },
];
