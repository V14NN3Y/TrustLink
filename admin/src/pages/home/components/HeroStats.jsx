import { useState, useEffect } from 'react';
import { StorageManager } from '@/lib/storage';
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
  const [data, setData] = useState({
    total_orders: 0,
    escrow_volume_xof: 0,
    active_voyages: 0,
    sellers_active: 0,
    pending_payouts: 0,
    payouts_amount_ngn: 0,
    pending_disputes: 0,
    catalogue_pending: 0,
    success_rate: 0
  });

  useEffect(() => {
    function refreshStats() {
      const orders = StorageManager.getOrders();
      const sellers = StorageManager.getSellers();
      const products = StorageManager.getProducts();
      
      setData({
        total_orders: orders.length,
        escrow_volume_xof: orders.reduce((acc, o) => acc + (o.total_xof || 0), 0),
        active_voyages: STATS.active_voyages, // Keep mock for now or sync if logistics added later
        sellers_active: sellers.length,
        pending_payouts: STATS.pending_payouts,
        payouts_amount_ngn: STATS.payouts_amount_ngn,
        pending_disputes: STATS.pending_disputes,
        catalogue_pending: products.filter(p => p.status === 'PENDING_REVIEW').length,
        success_rate: STATS.success_rate
      });
    }

    refreshStats();
    
    const handler = (e) => {
      const keys = StorageManager.getKeys();
      if ([keys.ORDERS, keys.SELLERS, keys.PRODUCTS].includes(e.key)) {
        refreshStats();
      }
    };
    
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard icon="ri-shopping-bag-3-line text-trustblue" iconBg="bg-blue-50" label="Commandes totales" value={data.total_orders.toLocaleString('fr-FR')} delta={STATS.orders_delta} />
      <StatCard icon="ri-shield-check-line text-emerald-600" iconBg="bg-emerald-50" label="Volume Escrow" value={formatXOF(data.escrow_volume_xof)} delta={STATS.escrow_delta} accent />
      <StatCard icon="ri-truck-2-line text-blue-600" iconBg="bg-blue-50" label="Voyages actifs" value={String(data.active_voyages)} delta={STATS.voyages_delta} live />
      <StatCard icon="ri-store-2-line text-amber-600" iconBg="bg-amber-50" label="Vendeurs actifs" value={String(data.sellers_active)} delta={STATS.sellers_delta} />
      <StatCard icon="ri-bank-card-line text-purple-600" iconBg="bg-purple-50" label="Payouts en attente" value={`${data.pending_payouts} · ${formatNGN(data.payouts_amount_ngn)}`} />
      <StatCard icon="ri-error-warning-line text-red-500" iconBg="bg-red-50" label="Litiges ouverts" value={String(data.pending_disputes)} live />
      <StatCard icon="ri-eye-line text-orange-500" iconBg="bg-orange-50" label="Modération en attente" value={String(data.catalogue_pending)} />
      <StatCard icon="ri-line-chart-line text-emerald-600" iconBg="bg-emerald-50" label="Taux de succès" value={`${data.success_rate}%`} delta={STATS.success_delta} />
    </div>
  );
}
