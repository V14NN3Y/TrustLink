const statusConfig = {
  new:          { label: "Nouvelle",        bg: "bg-[#125C8D]/10", color: "text-[#125C8D]",  icon: "ri-add-circle-line" },
  ready:        { label: "Prete a deposer", bg: "bg-[#FF6A00]/10", color: "text-[#FF6A00]",  icon: "ri-box-3-line" },
  hub_received: { label: "Recue au Hub",    bg: "bg-violet-100",   color: "text-violet-600",  icon: "ri-store-2-line" },
  in_transit:   { label: "En transit",      bg: "bg-amber-100",    color: "text-amber-600",   icon: "ri-truck-line" },
  delivered:    { label: "Livree",          bg: "bg-[#10B981]/10", color: "text-[#10B981]",   icon: "ri-checkbox-circle-line" },
  completed:    { label: "Terminee",        bg: "bg-gray-100",     color: "text-gray-500",    icon: "ri-check-double-line" },
};

export default function OrderStatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.new;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${cfg.bg} ${cfg.color}`}>
      <i className={`${cfg.icon} text-[10px]`}></i>
      {cfg.label}
    </span>
  );
}
