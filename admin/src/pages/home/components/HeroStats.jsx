import { STATS } from '@/mocks/dashboard';
import { formatXOF, formatNGN } from '@/components/base/DataTransformer';

function StatCard({ icon, iconBg, label, value, delta, accent, live }) {
  return (
    <div className={`relative bg-white rounded-2xl p-5 border card-hover ${accent ? 'border-orange-100 border-2' : 'border-slate-100'}`}>
      {live && (
        <span className="absolute top-3 right-3 flex items-center gap-1.5">
          <span className="live-dot" />
          <span className="text-xs text-emerald-600 font-medium">Live</span>
        </span>
      )}
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-3 ${iconBg}`}>
        <i className={`${icon} text-lg`} />
      </div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="font-bold text-2xl text-slate-800 leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>{value}</p>
      {delta !== undefined && (
        <p className={`text-xs font-medium mt-1.5 flex items-center gap-1 ${delta >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
          <i className={delta >= 0 ? 'ri-arrow-up-line' : 'ri-arrow-down-line'} />
          {Math.abs(delta)}% ce mois
        </p>
      )}
    </div>
  );
}

export default function HeroStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard icon="ri-shopping-bag-3-line text-trustblue" iconBg="bg-blue-50" label="Commandes totales" value={STATS.total_orders.toLocaleString('fr-FR')} delta={STATS.orders_delta} />
      <StatCard icon="ri-shield-check-line text-emerald-600" iconBg="bg-emerald-50" label="Volume Escrow" value={formatXOF(STATS.escrow_volume_xof)} delta={STATS.escrow_delta} accent />
      <StatCard icon="ri-truck-2-line text-blue-600" iconBg="bg-blue-50" label="Voyages actifs" value={String(STATS.active_voyages)} delta={STATS.voyages_delta} live />
      <StatCard icon="ri-store-2-line text-amber-600" iconBg="bg-amber-50" label="Vendeurs actifs" value={String(STATS.sellers_active)} delta={STATS.sellers_delta} />
      <StatCard icon="ri-bank-card-line text-purple-600" iconBg="bg-purple-50" label="Payouts en attente" value={`${STATS.pending_payouts} · ${formatNGN(STATS.payouts_amount_ngn)}`} />
      <StatCard icon="ri-error-warning-line text-red-500" iconBg="bg-red-50" label="Litiges ouverts" value={String(STATS.pending_disputes)} live />
      <StatCard icon="ri-eye-line text-orange-500" iconBg="bg-orange-50" label="Modération en attente" value={String(STATS.catalogue_pending)} />
      <StatCard icon="ri-line-chart-line text-emerald-600" iconBg="bg-emerald-50" label="Taux de succès" value={`${STATS.success_rate}%`} delta={STATS.success_delta} />
    </div>
  );
}
