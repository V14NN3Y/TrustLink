const statusConfig = {
  pending:    { label: "En attente",      bg: "bg-gray-100",     color: "text-gray-500",    icon: "ri-time-line" },
  paid:       { label: "Payée",           bg: "bg-[#125C8D]/10", color: "text-[#125C8D]",  icon: "ri-check-line" },
  processing: { label: "En traitement",   bg: "bg-amber-100",    color: "text-amber-600",   icon: "ri-loader-2-line" },
  in_transit: { label: "En livraison",    bg: "bg-violet-100",   color: "text-violet-600",  icon: "ri-truck-line" },
  delivered:  { label: "Livrée",           bg: "bg-[#10B981]/10", color: "text-[#10B981]",   icon: "ri-checkbox-circle-line" },
  confirmed:  { label: "Confirmée",       bg: "bg-green-100",    color: "text-green-700",   icon: "ri-check-double-line" },
  disputed:   { label: "En litige",       bg: "bg-red-100",      color: "text-red-600",     icon: "ri-error-warning-line" },
  cancelled:  { label: "Annulée",         bg: "bg-red-50",       color: "text-red-500",     icon: "ri-close-circle-line" },
  refunded:   { label: "Remboursée",      bg: "bg-gray-100",     color: "text-gray-400",    icon: "ri-refund-line" },
};

export default function OrderStatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.pending;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${cfg.bg} ${cfg.color}`}>
      <i className={`${cfg.icon} text-[10px]`}></i>
      {cfg.label}
    </span>
  );
}
