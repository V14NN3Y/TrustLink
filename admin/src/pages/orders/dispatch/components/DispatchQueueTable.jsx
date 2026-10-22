import { useMemo } from 'react';

export default function DispatchQueueTable({ items, selectedItems, onToggleItem, onSelectAll, onDispatch, dispatching }) {
  const itemIds = useMemo(() => items.map(i => i.id), [items]);
  const allSelected = itemIds.length > 0 && itemIds.every(id => selectedItems.has(id));
  const someSelected = itemIds.some(id => selectedItems.has(id));
  const selectedCount = itemIds.filter(id => selectedItems.has(id)).length;

  const formatPrice = (val) => Number(val || 0).toLocaleString();

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={el => { if (el) el.indeterminate = someSelected && !allSelected; }}
                  onChange={() => onSelectAll(itemIds, !allSelected)}
                  className="w-4 h-4 rounded border-slate-300 text-trustblue focus:ring-trustblue cursor-pointer"
                />
              </th>
              <th className="text-left px-3 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Acheteur</th>
              <th className="text-left px-3 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Produit</th>
              <th className="text-center px-3 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Qté</th>
              <th className="text-right px-3 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Prix unit.</th>
              <th className="text-right px-3 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item.id)}
                    onChange={() => onToggleItem(item.id)}
                    className="w-4 h-4 rounded border-slate-300 text-trustblue focus:ring-trustblue cursor-pointer"
                  />
                </td>
                <td className="px-3 py-3">
                  <p className="font-medium text-slate-700 text-xs">{item.order?.buyer?.full_name || '—'}</p>
                  {item.order?.shipping_city && (
                    <p className="text-[10px] text-slate-400">{item.order.shipping_city}</p>
                  )}
                </td>
                <td className="px-3 py-3">
                  <p className="font-medium text-slate-700 text-xs">{item.product_name || item.product?.name || '—'}</p>
                </td>
                <td className="px-3 py-3 text-center text-slate-700 text-xs">{item.quantity}</td>
                <td className="px-3 py-3 text-right text-slate-700 text-xs">{formatPrice(item.product_price)} F</td>
                <td className="px-3 py-3 text-right font-semibold text-slate-800 text-xs">{formatPrice(item.subtotal || item.product_price * item.quantity)} F</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
        <span className="text-xs text-slate-500">
          {allSelected
            ? 'Tous les articles sélectionnés'
            : `${selectedCount}/${items.length} article(s) sélectionné(s)`
          }
        </span>
        <button
          onClick={() => onDispatch(itemIds.filter(id => selectedItems.has(id)))}
          disabled={selectedCount === 0 || dispatching}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-trustblue hover:bg-trustblue/90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
        >
          {dispatching ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Traitement...
            </>
          ) : (
            <>
              <i className="ri-send-plane-line text-sm" />
              Marquer en traitement ({selectedCount})
            </>
          )}
        </button>
      </div>
    </div>
  );
}
