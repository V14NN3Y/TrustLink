import { useLocale } from "@/lib/i18n";

const statusKeys = {
  pending:    { key: "orders.statusPending",    bg: "bg-gray-100",     color: "text-gray-500",    icon: "ri-time-line" },
  paid:       { key: "orders.stepPaid",         bg: "bg-[#125C8D]/10", color: "text-[#125C8D]",  icon: "ri-check-line" },
  processing: { key: "orders.statusProcessing", bg: "bg-amber-100",    color: "text-amber-600",   icon: "ri-loader-2-line" },
  in_transit: { key: "orders.statusInTransit",  bg: "bg-violet-100",   color: "text-violet-600",  icon: "ri-truck-line" },
  delivered:  { key: "orders.stepDelivered",    bg: "bg-[#10B981]/10", color: "text-[#10B981]",   icon: "ri-checkbox-circle-line" },
  confirmed:  { key: "orders.stepConfirmed",    bg: "bg-green-100",    color: "text-green-700",   icon: "ri-check-double-line" },
  disputed:   { key: "orders.statusDisputed",   bg: "bg-red-100",      color: "text-red-600",     icon: "ri-error-warning-line" },
  cancelled:  { key: "orders.stepCancelled",    bg: "bg-red-50",       color: "text-red-500",     icon: "ri-close-circle-line" },
  refunded:   { key: "orders.statusRefunded",   bg: "bg-gray-100",     color: "text-gray-400",    icon: "ri-refund-line" },
};

export default function OrderStatusBadge({ status }) {
  const { t } = useLocale();
  const cfg = statusKeys[status] || statusKeys.pending;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${cfg.bg} ${cfg.color}`}>
      <i className={`${cfg.icon} text-[10px]`}></i>
      {t(cfg.key)}
    </span>
  );
}
