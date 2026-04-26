const STATUS_MAP = {
  // Statuts existants
  PENDING:           { bg: '#FFFBEB', text: '#92400E', label: 'En attente',         icon: 'ri-time-line' },
  FUNDED:            { bg: '#ECFDF5', text: '#065F46', label: 'Financé',            icon: 'ri-shield-check-line' },
  IN_TRANSIT:        { bg: '#E8F4FD', text: '#125C8D', label: 'En transit',         icon: 'ri-truck-line' },
  CUSTOMS:           { bg: '#F5F3FF', text: '#5B21B6', label: 'Douane',             icon: 'ri-building-2-line' },
  DELIVERED:         { bg: '#F0FDF4', text: '#166534', label: 'Livré',              icon: 'ri-checkbox-circle-line' },
  DISPUTED:          { bg: '#FEF2F2', text: '#991B1B', label: 'Litige',             icon: 'ri-error-warning-line' },
  PENDING_REVIEW:    { bg: '#FFF7ED', text: '#C2410C', label: 'À réviser',          icon: 'ri-eye-line' },
  PREPARING:         { bg: '#FFFBEB', text: '#92400E', label: 'Préparation',        icon: 'ri-archive-line' },
  ARRIVED:           { bg: '#ECFDF5', text: '#065F46', label: 'Arrivé',             icon: 'ri-map-pin-line' },
  COMPLETED:         { bg: '#F0FDF4', text: '#166534', label: 'Terminée',           icon: 'ri-check-double-line' },
  active:            { bg: '#ECFDF5', text: '#065F46', label: 'Actif',              icon: 'ri-checkbox-circle-line' },
  inactive:          { bg: '#F1F5F9', text: '#475569', label: 'Inactif',            icon: 'ri-forbid-line' },
  pending:           { bg: '#FFF7ED', text: '#C2410C', label: 'En attente',         icon: 'ri-time-line' },
  APPROVED:          { bg: '#ECFDF5', text: '#065F46', label: 'Approuvé',           icon: 'ri-checkbox-circle-line' },
  PAID:              { bg: '#F0FDF4', text: '#166534', label: 'Payé',               icon: 'ri-bank-card-line' },
  REJECTED:          { bg: '#FEF2F2', text: '#991B1B', label: 'Rejeté',             icon: 'ri-close-circle-line' },
  OPEN:              { bg: '#FEF2F2', text: '#991B1B', label: 'Ouvert',             icon: 'ri-error-warning-line' },
  UNDER_REVIEW:      { bg: '#FFF7ED', text: '#C2410C', label: 'En révision',        icon: 'ri-eye-line' },
  INVESTIGATING:     { bg: '#FFF7ED', text: '#C2410C', label: 'Investigation',      icon: 'ri-search-eye-line' },
  RESOLVED:          { bg: '#F0FDF4', text: '#166534', label: 'Résolu',             icon: 'ri-check-double-line' },
  RESOLVED_REFUND:   { bg: '#F0FDF4', text: '#166534', label: 'Remboursé',          icon: 'ri-refund-2-line' },
  RESOLVED_PAYMENT:  { bg: '#F0FDF4', text: '#166534', label: 'Paiement forcé',     icon: 'ri-bank-card-line' },
  // Nouveaux statuts SharedOrderStatus
  pending_admin:          { bg: '#EDE9FE', text: '#5B21B6', label: 'En attente validation', icon: 'ri-time-line' },
  validated:              { bg: '#ECFDF5', text: '#065F46', label: 'Validée',                icon: 'ri-checkbox-circle-line' },
  dispatched_to_seller:   { bg: '#E8F4FD', text: '#125C8D', label: 'Dispatched',             icon: 'ri-send-plane-line' },
  seller_confirmed:       { bg: '#F0FDF4', text: '#166534', label: 'Confirmée seller',       icon: 'ri-user-received-line' },
  hub_received:           { bg: '#FFF7ED', text: '#9A3412', label: 'Hub reçu',               icon: 'ri-inbox-archive-line' },
  in_transit:             { bg: '#E8F4FD', text: '#125C8D', label: 'En transit',             icon: 'ri-truck-line' },
  completed:              { bg: '#F0FDF4', text: '#166534', label: 'Terminée',               icon: 'ri-check-double-line' },
  customs:                { bg: '#F5F3FF', text: '#5B21B6', label: 'Douane',                 icon: 'ri-building-2-line' },
  delivered:              { bg: '#F0FDF4', text: '#166534', label: 'Livré',                  icon: 'ri-checkbox-circle-line' },
  disputed:               { bg: '#FEF2F2', text: '#991B1B', label: 'Litige',                 icon: 'ri-error-warning-line' },
};

export default function StatusBadge({ status, size = 'sm' }) {
  const cfg = STATUS_MAP[status] ?? { bg: '#F1F5F9', text: '#475569', label: status, icon: 'ri-question-line' };
  const pad = size === 'md' ? 'px-3 py-1.5' : 'px-2.5 py-1';
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${pad} text-xs font-semibold rounded-full whitespace-nowrap`}
      style={{ backgroundColor: cfg.bg, color: cfg.text }}
      aria-label={cfg.label}
    >
      <i className={`${cfg.icon} text-[11px]`} />
      {cfg.label}
    </span>
  );
}
