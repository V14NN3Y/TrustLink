export const PAYOUTS = [
  { id: 'P-2026-001', seller_name: 'Chukwuemeka Obi', seller_id: 'SLR-0042', amount_ngn: 462500, amount_xof: 191105, status: 'PENDING_REVIEW', orders: ['TL-2026-0001'], requested_at: '2026-04-15T12:00:00Z', bank: 'Access Bank', account_number: '0123456789' },
  { id: 'P-2026-002', seller_name: 'Adaeze Nwosu', seller_id: 'SLR-0017', amount_ngn: 177500, amount_xof: 73343, status: 'PENDING_REVIEW', orders: ['TL-2026-0002'], requested_at: '2026-04-15T10:30:00Z', bank: 'GTBank', account_number: '0987654321' },
  { id: 'P-2026-003', seller_name: 'Kelechi Amadi', seller_id: 'SLR-0071', amount_ngn: 306500, amount_xof: 126646, status: 'APPROVED', orders: ['TL-2026-0005', 'TL-2026-0009'], requested_at: '2026-04-14T16:00:00Z', bank: 'UBA', account_number: '1234567890' },
  { id: 'P-2026-004', seller_name: 'Babatunde Alabi', seller_id: 'SLR-0088', amount_ngn: 378000, amount_xof: 156190, status: 'PAID', orders: ['TL-2026-0007'], requested_at: '2026-04-13T09:00:00Z', bank: 'Zenith Bank', account_number: '9876543210' },
  { id: 'P-2026-005', seller_name: 'Chioma Igwe', seller_id: 'SLR-0033', amount_ngn: 673500, amount_xof: 278319, status: 'PENDING_REVIEW', orders: ['TL-2026-0004'], requested_at: '2026-04-15T08:00:00Z', bank: 'First Bank', account_number: '5678901234' },
];

export const AUDIT_ENTRIES = [
  { id: 'aud-001', type: 'RATE_CHANGE', description: 'Taux NGN/FCFA mis à jour : 0.4110 → 0.4132', user: 'Admin Principal', timestamp: '2026-04-15T09:15:00Z' },
  { id: 'aud-002', type: 'PAYOUT', description: 'Payout SLR-0071 approuvé — ₦306,500', user: 'Admin Principal', timestamp: '2026-04-15T10:05:00Z', amount: 306500, currency: 'NGN' },
  { id: 'aud-003', type: 'DISPUTE', description: 'Litige TL-2026-0003 : Remboursement acheteur validé', user: 'Admin Principal', timestamp: '2026-04-15T11:20:00Z' },
  { id: 'aud-004', type: 'MODERATION', description: 'Produit "iPhone 15 Pro" approuvé (catalogue)', user: 'Modérateur Awa', timestamp: '2026-04-15T12:00:00Z' },
  { id: 'aud-005', type: 'SPREAD', description: 'Spread commission modifié : 2.0% → 2.5%', user: 'Admin Principal', timestamp: '2026-04-14T16:30:00Z' },
  { id: 'aud-006', type: 'RATE_CHANGE', description: 'Taux NGN/FCFA mis à jour : 0.4090 → 0.4110', user: 'Système automatique', timestamp: '2026-04-14T08:00:00Z' },
  { id: 'aud-007', type: 'PAYOUT', description: 'Payout SLR-0088 marqué comme PAYÉ — ₦378,000', user: 'Admin Principal', timestamp: '2026-04-13T14:00:00Z', amount: 378000, currency: 'NGN' },
  { id: 'aud-008', type: 'MODERATION', description: '3 produits rejetés — non conformes', user: 'Modérateur Awa', timestamp: '2026-04-13T11:30:00Z' },
  { id: 'aud-009', type: 'DISPUTE', description: 'Litige TL-2026-0010 : Paiement forcé vendeur', user: 'Admin Principal', timestamp: '2026-04-12T17:00:00Z' },
  { id: 'aud-010', type: 'SPREAD', description: 'Spread Abuja hub modifié : 1.8% → 2.0%', user: 'Admin Principal', timestamp: '2026-04-12T09:15:00Z' },
];

export const ESCROW_CONFIG = {
  spread_pct: 2.5, min_amount_xof: 50000, release_delay_hours: 72, auto_release: true,
};
