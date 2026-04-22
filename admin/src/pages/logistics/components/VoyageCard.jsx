const PROGRESS = { PREPARING: 10, IN_TRANSIT: 50, CUSTOMS: 75, ARRIVED: 90, COMPLETED: 100 };
const STATUS_COLORS = {
  PREPARING: 'bg-amber-50 text-amber-700 border-amber-200',
  IN_TRANSIT: 'bg-blue-50 text-blue-600 border-blue-100',
  CUSTOMS: 'bg-purple-50 text-purple-700 border-purple-200',
  ARRIVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  COMPLETED: 'bg-green-50 text-green-700 border-green-200',
};

export default function VoyageCard({ voyage, selected, onClick, onEdit }) {
  const pct = PROGRESS[voyage.status] || 0;
  return (
    <div onClick={onClick} className={`bg-white rounded-2xl p-4 card-hover cursor-pointer transition-all border-2 ${selected ? 'border-trustblue' : 'border-slate-100'}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-bold text-slate-800 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>{voyage.voyage_id}</h4>
          <p className="text-xs text-slate-500">{voyage.hub_origin} → Cotonou</p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_COLORS[voyage.status] || ''}`}>{voyage.status}</span>
      </div>
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <span className="text-xs text-slate-500">Progression</span>
          <span className="text-xs font-semibold text-trustblue">{pct}%</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-1.5 bg-trustblue rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
        <div><span className="text-slate-400">Colis</span><p className="font-semibold text-slate-700">{voyage.orders_count}</p></div>
        <div><span className="text-slate-400">Chauffeur</span><p className="font-semibold text-slate-700 truncate">{voyage.driver_name}</p></div>
      </div>
      <button onClick={e => { e.stopPropagation(); onEdit(); }} className="w-full py-2 border border-trustblue text-trustblue rounded-xl text-xs font-semibold cursor-pointer hover:bg-blue-50">
        <i className="ri-edit-line mr-1" />Mettre à jour
      </button>
    </div>
  );
}
