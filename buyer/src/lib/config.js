export const STATUS_CONFIG = {
  all:        { label: 'Toutes',        color: '#111827', bg: '#F8FAFC' },
  pending:    { label: 'En attente',    color: '#B45309', bg: '#FEF3C7' },
  paid:       { label: 'Payée',         color: '#2563EB', bg: '#EFF6FF' },
  processing: { label: 'En cours de traitement', color: '#125C8D', bg: '#E1F0F9' },
  in_transit: { label: 'En cours de livraison',  color: '#7C3AED', bg: '#F5F3FF' },
  delivered:  { label: 'Livrée',        color: '#15803D', bg: '#DCFCE7' },
  confirmed:  { label: 'Confirmée',     color: '#15803D', bg: '#DCFCE7' },
  disputed:   { label: 'Litige',        color: '#DC2626', bg: '#FEE2E2' },
  cancelled:  { label: 'Annulée',       color: '#6B7280', bg: '#F1F5F9' },
  refunded:   { label: 'Remboursée',    color: '#0891B2', bg: '#ECFEFF' },
};

export const STATUS_PRIORITY = {
  disputed: 0, cancelled: 1, pending: 2, paid: 3,
  processing: 4, in_transit: 5, delivered: 6, confirmed: 7, refunded: 8,
};
