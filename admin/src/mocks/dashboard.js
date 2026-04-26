export const STATS = {
  total_orders: 1247, orders_delta: 12.4,
  escrow_volume_xof: 36155000, escrow_delta: 8.7,
  active_voyages: 4, voyages_delta: -1,
  sellers_active: 156, sellers_delta: 5.2,
  pending_payouts: 3, payouts_amount_ngn: 1313500,
  pending_disputes: 2, catalogue_pending: 5,
  success_rate: 94.2, success_delta: 1.8,
  exchange_rate_ngn_xof: 0.4132,
};

export const VOLUME_DATA = [
  { month: 'Juil', xof: 17360000, ngn: 42000000 },
  { month: 'Août', xof: 22715000, ngn: 55000000 },
  { month: 'Sep', xof: 19834000, ngn: 48000000 },
  { month: 'Oct', xof: 27684000, ngn: 67000000 },
  { month: 'Nov', xof: 32230000, ngn: 78000000 },
  { month: 'Déc', xof: 36155000, ngn: 87500000 },
];

export const ACTIVITY_FEED = [
  { id: 'act-001', type: 'ORDER', title: 'Commande TL-2026-0012 créée', sub: 'MacBook Pro M3 — SLR-0064', time: '2026-04-15T15:45:00Z' },
  { id: 'act-002', type: 'PAYOUT', title: 'Payout SLR-0042 demandé', sub: '₦462,500 — Chukwuemeka Obi', time: '2026-04-15T15:30:00Z' },
  { id: 'act-003', type: 'VOYAGE', title: 'VY-2026-041 en transit', sub: 'Lagos → Cotonou — 8 colis', time: '2026-04-15T14:00:00Z' },
  { id: 'act-004', type: 'DISPUTE', title: 'Litige TL-2026-0003 ouvert', sub: 'Tissus non conformes — FCFA 73,343', time: '2026-04-15T09:05:00Z' },
  { id: 'act-005', type: 'ORDER', title: 'Commande TL-2026-0005 livrée', sub: 'Générateur 5KVA — Bertrand Dossou', time: '2026-04-11T14:00:00Z' },
  { id: 'act-006', type: 'PAYOUT', title: 'Payout SLR-0088 payé', sub: '₦378,000 — Babatunde Alabi', time: '2026-04-13T14:00:00Z' },
  { id: 'act-007', type: 'VOYAGE', title: 'VY-2026-039 arrivé', sub: 'Abuja → Cotonou — 7 colis', time: '2026-04-13T15:30:00Z' },
  { id: 'act-008', type: 'ORDER', title: 'Commande TL-2026-0006 en attente', sub: 'Câbles électriques — Aurélien Kpossa', time: '2026-04-15T14:30:00Z' },
];

export const HUB_STATS = {
  Lagos: { orders: 782, volume_xof: 22445960, on_time_pct: 92 },
  Abuja: { orders: 465, volume_xof: 13720040, on_time_pct: 96 },
};
