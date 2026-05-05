const STATUS_CONFIG = {
  PENDING:        { label: 'En attente',  classes: 'bg-amber-50 text-amber-700 border border-amber-200',       icon: 'ri-time-line' },
  FUNDED:         { label: 'Financé',     classes: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: 'ri-shield-check-line' },
  IN_TRANSIT:     { label: 'En transit',  classes: 'bg-blue-50 text-blue-600 border border-blue-100',          icon: 'ri-truck-line' },
  CUSTOMS:        { label: 'Douane',      classes: 'bg-purple-50 text-purple-700 border border-purple-200',    icon: 'ri-building-2-line' },
  DELIVERED:      { label: 'Livré',       classes: 'bg-green-50 text-green-700 border border-green-200',       icon: 'ri-checkbox-circle-line' },
  DISPUTED:       { label: 'Litige',      classes: 'bg-red-50 text-red-700 border border-red-200',             icon: 'ri-error-warning-line' },
  PENDING_REVIEW: { label: 'À réviser',   classes: 'bg-orange-50 text-orange-600 border border-orange-200',   icon: 'ri-eye-line' },
  PREPARING:      { label: 'Préparation', classes: 'bg-amber-50 text-amber-700 border border-amber-200',       icon: 'ri-archive-line' },
  ARRIVED:        { label: 'Arrivé',      classes: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: 'ri-map-pin-line' },
  COMPLETED:      { label: 'Complété',    classes: 'bg-green-50 text-green-700 border border-green-200',       icon: 'ri-check-double-line' },
  active:         { label: 'Actif',       classes: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: 'ri-checkbox-circle-line' },
  inactive:       { label: 'Inactif',     classes: 'bg-slate-100 text-slate-600 border border-slate-200',      icon: 'ri-forbid-line' },
  pending:        { label: 'En attente',  classes: 'bg-orange-50 text-orange-600 border border-orange-200',   icon: 'ri-time-line' },
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
