import { useMemo } from 'react';

export default function DispatchSellerCard({ sellerGroup, selectedItems, onToggleItem, onSelectAll, onDispatch, dispatching }) {
  const { seller, items, totalAmount, itemCount, buyerCount } = sellerGroup;
  const sellerItemIds = useMemo(() => items.map(i => i.id), [items]);
  const allSelected = sellerItemIds.every(id => selectedItems.has(id));
  const someSelected = sellerItemIds.some(id => selectedItems.has(id));
  const selectedCount = sellerItemIds.filter(id => selectedItems.has(id)).length;

  const formatPrice = (val) => Number(val || 0).toLocaleString();

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-trustblue/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {seller?.business_logo_url ? (
                <img src={seller.business_logo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="font-bold text-trustblue text-sm">{seller?.business_name?.[0] || seller?.full_name?.[0] || '?'}</span>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">{seller?.business_name || seller?.full_name || 'Vendeur'}</h3>
              <p className="text-xs text-slate-500">{seller?.full_name || ''} · {buyerCount} acheteur(s) · {itemCount} article(s)</p>
            </div>
          </div>
          <p className="font-bold text-slate-800">{formatPrice(totalAmount)} FCFA</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={el => { if (el) el.indeterminate = someSelected && !allSelected; }}
                  onChange={() => onSelectAll(sellerItemIds, !allSelected)}
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
          onClick={() => onDispatch(seller.id, sellerItemIds.filter(id => selectedItems.has(id)))}
          disabled={selectedCount === 0 || dispatching}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-trustblue hover:bg-trustblue/90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
        >
          {dispatching ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Envoi...
            </>
          ) : (
            <>
              <i className="ri-send-plane-line text-sm" />
              Envoyer au vendeur ({selectedCount})
            </>
          )}
        </button>
      </div>
    </div>
  );
}
