export default function StatsCard({ icon, iconBg, iconColor, badge, badgeColor, badgeBg, label, value }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <i className={`${icon} text-xl ${iconColor}`}></i>
        </div>
        {badge && (
          <span
            className="text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap"
            style={{ backgroundColor: badgeBg, color: badgeColor }}
          >
            {badge}
          </span>
        )}
      </div>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
