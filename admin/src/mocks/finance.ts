export type PayoutStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'PAID';

export interface Payout {
  id: string; seller_name: string; seller_id: string;
  amount_ngn: number; amount_xof: number;
  status: PayoutStatus; orders: string[];
  requested_at: string; bank: string; account_number: string;
}

export type AuditType = 'RATE_CHANGE' | 'PAYOUT' | 'SPREAD' | 'MODERATION' | 'DISPUTE';

export interface AuditEntry {
  id: string; type: AuditType; description: string;
  user: string; timestamp: string; amount?: number; currency?: string;
}

export interface EscrowConfig {
  spread_pct: number; min_amount_xof: number;
  release_delay_hours: number; auto_release: boolean;
}

export const PAYOUTS: Payout[] = [
  { id: 'pay-001', seller_name: 'Chukwuemeka Obi', seller_id: 'SLR-0042', amount_ngn: 462500, amount_xof: 847500, status: 'PENDING_REVIEW', orders: ['TL-2024-0891'], requested_at: '2024-12-15T12:00:00Z', bank: 'Access Bank', account_number: '0123456789' },
  { id: 'pay-002', seller_name: 'Adaeze Nwosu', seller_id: 'SLR-0017', amount_ngn: 177500, amount_xof: 325000, status: 'PENDING_REVIEW', orders: ['TL-2024-0892'], requested_at: '2024-12-15T10:30:00Z', bank: 'GTBank', account_number: '0987654321' },
  { id: 'pay-003', seller_name: 'Kelechi Amadi', seller_id: 'SLR-0071', amount_ngn: 306500, amount_xof: 562500, status: 'APPROVED', orders: ['TL-2024-0895', 'TL-2024-0899'], requested_at: '2024-12-14T16:00:00Z', bank: 'UBA', account_number: '1234567890' },
  { id: 'pay-004', seller_name: 'Babatunde Alabi', seller_id: 'SLR-0088', amount_ngn: 378000, amount_xof: 693000, status: 'PAID', orders: ['TL-2024-0897'], requested_at: '2024-12-13T09:00:00Z', bank: 'Zenith Bank', account_number: '9876543210' },
  { id: 'pay-005', seller_name: 'Chioma Igwe', seller_id: 'SLR-0033', amount_ngn: 673500, amount_xof: 1235000, status: 'PENDING_REVIEW', orders: ['TL-2024-0894'], requested_at: '2024-12-15T08:00:00Z', bank: 'First Bank', account_number: '5678901234' },
];

export const AUDIT_ENTRIES: AuditEntry[] = [
  { id: 'aud-001', type: 'RATE_CHANGE', description: 'Taux NGN/XOF mis à jour : 1.820 → 1.832', user: 'Admin Principal', timestamp: '2024-12-15T09:15:00Z' },
  { id: 'aud-002', type: 'PAYOUT', description: 'Payout SLR-0071 approuvé — ₦306,500', user: 'Admin Principal', timestamp: '2024-12-15T10:05:00Z', amount: 306500, currency: 'NGN' },
  { id: 'aud-003', type: 'DISPUTE', description: 'Litige TL-2024-0893 : Remboursement acheteur validé', user: 'Admin Principal', timestamp: '2024-12-15T11:20:00Z' },
  { id: 'aud-004', type: 'MODERATION', description: 'Produit "iPhone 15 Pro" approuvé (catalogue)', user: 'Modérateur Awa', timestamp: '2024-12-15T12:00:00Z' },
  { id: 'aud-005', type: 'SPREAD', description: 'Spread commission modifié : 2.0% → 2.5%', user: 'Admin Principal', timestamp: '2024-12-14T16:30:00Z' },
  { id: 'aud-006', type: 'RATE_CHANGE', description: 'Taux NGN/XOF mis à jour : 1.810 → 1.820', user: 'Système automatique', timestamp: '2024-12-14T08:00:00Z' },
  { id: 'aud-007', type: 'PAYOUT', description: 'Payout SLR-0088 marqué comme PAYÉ — ₦378,000', user: 'Admin Principal', timestamp: '2024-12-13T14:00:00Z', amount: 378000, currency: 'NGN' },
  { id: 'aud-008', type: 'MODERATION', description: '3 produits rejetés — non conformes aux guidelines', user: 'Modérateur Awa', timestamp: '2024-12-13T11:30:00Z' },
  { id: 'aud-009', type: 'DISPUTE', description: 'Litige TL-2024-0887 : Paiement forcé vendeur', user: 'Admin Principal', timestamp: '2024-12-12T17:00:00Z' },
  { id: 'aud-010', type: 'SPREAD', description: 'Spread Abuja hub modifié : 1.8% → 2.0%', user: 'Admin Principal', timestamp: '2024-12-12T09:15:00Z' },
];

export const ESCROW_CONFIG: EscrowConfig = {
  spread_pct: 2.5, min_amount_xof: 50000, release_delay_hours: 72, auto_release: true,
};
