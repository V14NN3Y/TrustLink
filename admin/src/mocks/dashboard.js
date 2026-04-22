export const STATS = {
  total_orders: 1247, orders_delta: 12.4,
  escrow_volume_xof: 87500000, escrow_delta: 8.7,
  active_voyages: 4, voyages_delta: -1,
  sellers_active: 156, sellers_delta: 5.2,
  pending_payouts: 3, payouts_amount_ngn: 1313500,
  pending_disputes: 2, catalogue_pending: 5,
  success_rate: 94.2, success_delta: 1.8,
};

export const VOLUME_DATA = [
  { month: 'Juil', xof: 42000000, ngn: 22900000 },
  { month: 'Août', xof: 55000000, ngn: 29900000 },
  { month: 'Sep', xof: 48000000, ngn: 26200000 },
  { month: 'Oct', xof: 67000000, ngn: 36500000 },
  { month: 'Nov', xof: 78000000, ngn: 42500000 },
  { month: 'Déc', xof: 87500000, ngn: 47700000 },
];

export const ACTIVITY_FEED = [
  { id: 'act-001', type: 'ORDER', title: 'Commande TL-2024-0912 créée', sub: 'MacBook Pro M3 — SLR-0064', time: '2024-12-15T15:45:00Z' },
  { id: 'act-002', type: 'PAYOUT', title: 'Payout SLR-0042 demandé', sub: '₦462,500 — Chukwuemeka Obi', time: '2024-12-15T15:30:00Z' },
  { id: 'act-003', type: 'VOYAGE', title: 'VY-2024-041 en transit', sub: 'Lagos → Cotonou — 8 colis', time: '2024-12-15T14:00:00Z' },
  { id: 'act-004', type: 'DISPUTE', title: 'Litige TL-2024-0878 ouvert', sub: 'Tissus non conformes — 275,000 XOF', time: '2024-12-15T09:05:00Z' },
  { id: 'act-005', type: 'ORDER', title: 'Commande TL-2024-0895 livrée', sub: 'Générateur 5KVA — Bertrand Dossou', time: '2024-12-11T14:00:00Z' },
  { id: 'act-006', type: 'PAYOUT', title: 'Payout SLR-0088 payé', sub: '₦378,000 — Babatunde Alabi', time: '2024-12-13T14:00:00Z' },
  { id: 'act-007', type: 'VOYAGE', title: 'VY-2024-039 arrivé', sub: 'Abuja → Cotonou — 7 colis', time: '2024-12-13T15:30:00Z' },
  { id: 'act-008', type: 'ORDER', title: 'Commande TL-2024-0896 en attente', sub: 'Câbles électriques — Aurélien Kpossa', time: '2024-12-15T14:30:00Z' },
];

export const HUB_STATS = {
  Lagos: { orders: 782, volume_xof: 54300000, on_time_pct: 92 },
  Abuja: { orders: 465, volume_xof: 33200000, on_time_pct: 96 },
};
