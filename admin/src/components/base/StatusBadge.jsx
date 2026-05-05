const STATUS_CONFIG = {
  pending:        { label: 'En attente',  classes: 'bg-amber-50 text-amber-700 border border-amber-200',       icon: 'ri-time-line' },
  paid:           { label: 'Payée',       classes: 'bg-blue-50 text-blue-700 border border-blue-200',          icon: 'ri-bank-card-line' },
  processing:     { label: 'En traitement', classes: 'bg-cyan-50 text-cyan-700 border border-cyan-200',       icon: 'ri-loader-2-line' },
  in_transit:     { label: 'En transit',  classes: 'bg-blue-50 text-blue-600 border border-blue-100',          icon: 'ri-truck-line' },
  delivered:      { label: 'Livré',       classes: 'bg-green-50 text-green-700 border border-green-200',       icon: 'ri-checkbox-circle-line' },
  confirmed:      { label: 'Confirmée',   classes: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: 'ri-check-double-line' },
  disputed:       { label: 'Litige',      classes: 'bg-red-50 text-red-700 border border-red-200',             icon: 'ri-error-warning-line' },
  cancelled:      { label: 'Annulée',     classes: 'bg-slate-100 text-slate-600 border border-slate-200',      icon: 'ri-close-circle-line' },
  refunded:       { label: 'Remboursée',  classes: 'bg-teal-50 text-teal-700 border border-teal-200',          icon: 'ri-refund-line' },
  pending_review: { label: 'À réviser',   classes: 'bg-orange-50 text-orange-600 border border-orange-200',   icon: 'ri-eye-line' },
  approved:       { label: 'Approuvé',    classes: 'bg-green-50 text-green-700 border border-green-200',       icon: 'ri-check-line' },
  rejected:       { label: 'Rejeté',      classes: 'bg-red-50 text-red-600 border border-red-200',             icon: 'ri-close-line' },
  preparing:      { label: 'Préparation', classes: 'bg-amber-50 text-amber-700 border border-amber-200',       icon: 'ri-archive-line' },
  customs:        { label: 'Douane',      classes: 'bg-purple-50 text-purple-700 border border-purple-200',    icon: 'ri-building-2-line' },
  arrived:        { label: 'Arrivé',      classes: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: 'ri-map-pin-line' },
  completed:      { label: 'Complété',    classes: 'bg-green-50 text-green-700 border border-green-200',       icon: 'ri-check-double-line' },
  open:           { label: 'Ouvert',      classes: 'bg-amber-50 text-amber-700 border border-amber-200',       icon: 'ri-folder-open-line' },
  resolved_refund:    { label: 'Remboursé',   classes: 'bg-green-50 text-green-700 border border-green-200',   icon: 'ri-refund-line' },
  resolved_no_refund: { label: 'Non remboursé', classes: 'bg-red-50 text-red-600 border border-red-200',      icon: 'ri-close-circle-line' },
  active:         { label: 'Actif',       classes: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: 'ri-checkbox-circle-line' },
  inactive:       { label: 'Inactif',     classes: 'bg-slate-100 text-slate-600 border border-slate-200',      icon: 'ri-forbid-line' },
};

export default function StatusBadge({ status, size = 'sm' }) {
  const cfg = STATUS_CONFIG[status] || { label: status, classes: 'bg-slate-50 text-slate-600 border border-slate-200', icon: 'ri-question-line' };
  const sizeClass = size === 'md' ? 'px-3 py-1.5 text-xs' : 'px-2.5 py-1 text-xs';
  return (
    <span className={`inline-flex items-center gap-1.5 ${sizeClass} font-semibold rounded-full ${cfg.classes}`} style={{ fontFamily: 'Inter, sans-serif' }}>
      <i className={`${cfg.icon} text-xs`} />
      {cfg.label}
    </span>
  );
}
