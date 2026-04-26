export const ORDERS = [
  { id: 'ord-001', ref: 'TL-2026-0001', status: 'FUNDED', journey_step: 'payment_confirmed', hub_origin: 'Lagos', seller_name: 'Chukwuemeka Obi', seller_id: 'SLR-0042', buyer_name: 'Kofi Mensah', product: 'Samsung Galaxy A54 × 3', amount_xof: 191105, amount_ngn: 462500, created_at: '2026-04-15T10:30:00Z', voyage_id: 'VY-2026-041' },
  { id: 'ord-002', ref: 'TL-2026-0002', status: 'IN_TRANSIT', journey_step: 'shipped', hub_origin: 'Lagos', seller_name: 'Adaeze Nwosu', seller_id: 'SLR-0017', buyer_name: 'Parfait Hounto', product: 'Tissus Ankara 50m', amount_xof: 73343, amount_ngn: 177500, created_at: '2026-04-14T08:15:00Z', voyage_id: 'VY-2026-041' },
  { id: 'ord-003', ref: 'TL-2026-0003', status: 'DISPUTED', journey_step: 'dispute_opened', hub_origin: 'Abuja', seller_name: 'Emeka Eze', seller_id: 'SLR-0058', buyer_name: 'Rodrigue Akplogan', product: 'MacBook Pro M3 × 1', amount_xof: 329527, amount_ngn: 797500, created_at: '2026-04-13T14:20:00Z', voyage_id: 'VY-2026-039', dispute_video_url: 'https://www.w3schools.com/html/mov_bbb.mp4', dispute_reason: 'Produit reçu endommagé — écran fissuré à la réception.' },
  { id: 'ord-004', ref: 'TL-2026-0004', status: 'CUSTOMS', journey_step: 'at_customs', hub_origin: 'Lagos', seller_name: 'Chioma Igwe', seller_id: 'SLR-0033', buyer_name: 'Gilles Ahouansou', product: 'iPhone 15 Pro × 2', amount_xof: 278319, amount_ngn: 673500, created_at: '2026-04-12T09:45:00Z', voyage_id: 'VY-2026-040' },
  { id: 'ord-005', ref: 'TL-2026-0005', status: 'DELIVERED', journey_step: 'delivered', hub_origin: 'Abuja', seller_name: 'Kelechi Amadi', seller_id: 'SLR-0071', buyer_name: 'Bertrand Dossou', product: 'Generateur 5KVA × 1', amount_xof: 126646, amount_ngn: 306500, created_at: '2026-04-11T16:00:00Z', voyage_id: 'VY-2026-038' },
  { id: 'ord-006', ref: 'TL-2026-0006', status: 'PENDING', journey_step: 'awaiting_payment', hub_origin: 'Lagos', seller_name: 'Ngozi Okeke', seller_id: 'SLR-0029', buyer_name: 'Aurélien Kpossa', product: 'Câbles électriques 100m', amount_xof: 42146, amount_ngn: 102000, created_at: '2026-04-15T14:30:00Z' },
  { id: 'ord-007', ref: 'TL-2026-0007', status: 'FUNDED', journey_step: 'ready_to_ship', hub_origin: 'Abuja', seller_name: 'Babatunde Alabi', seller_id: 'SLR-0088', buyer_name: 'Constant Agbo', product: 'Climatiseur LG 2.5T × 2', amount_xof: 156190, amount_ngn: 378000, created_at: '2026-04-15T11:00:00Z', voyage_id: 'VY-2026-042' },
  { id: 'ord-008', ref: 'TL-2026-0008', status: 'IN_TRANSIT', journey_step: 'in_transit', hub_origin: 'Lagos', seller_name: 'Funmilayo Bello', seller_id: 'SLR-0055', buyer_name: 'Jérôme Houndjago', product: 'Téléviseur Sony 55" × 1', amount_xof: 92970, amount_ngn: 225000, created_at: '2026-04-14T07:30:00Z', voyage_id: 'VY-2026-041' },
  { id: 'ord-009', ref: 'TL-2026-0009', status: 'DELIVERED', journey_step: 'delivered', hub_origin: 'Lagos', seller_name: 'Rotimi Fashola', seller_id: 'SLR-0012', buyer_name: 'Modeste Lokossou', product: 'Pompe hydraulique × 3', amount_xof: 50617, amount_ngn: 122500, created_at: '2026-04-10T13:00:00Z' },
  { id: 'ord-010', ref: 'TL-2026-0010', status: 'CUSTOMS', journey_step: 'customs_inspection', hub_origin: 'Abuja', seller_name: 'Obiageli Okonkwo', seller_id: 'SLR-0064', buyer_name: 'Prosper Adandé', product: 'Groupe électrogène 10KVA', amount_xof: 253577, amount_ngn: 613500, created_at: '2026-04-12T10:00:00Z', voyage_id: 'VY-2026-040' },
  { id: 'ord-011', ref: 'TL-2026-0011', status: 'PENDING', journey_step: 'awaiting_payment', hub_origin: 'Lagos', seller_name: 'Oluwaseun Adeyemi', seller_id: 'SLR-0091', buyer_name: 'Félicien Houénou', product: 'Laptops Dell i7 × 5', amount_xof: 422501, amount_ngn: 1022500, created_at: '2026-04-15T15:00:00Z' },
  { id: 'ord-012', ref: 'TL-2026-0012', status: 'FUNDED', journey_step: 'payment_confirmed', hub_origin: 'Lagos', seller_name: 'Amarachi Onu', seller_id: 'SLR-0037', buyer_name: 'Thierry Agossou', product: 'Moteur électrique 3HP × 2', amount_xof: 76029, amount_ngn: 184000, created_at: '2026-04-15T09:00:00Z', voyage_id: 'VY-2026-042' },
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
