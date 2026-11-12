import { useCurrencyContext } from '@/lib/CurrencyContext';
import { computeAllInclusive } from '@/lib/pricing';
import { useEscrowConfig } from '@/hooks/useEscrowConfig';

// compact : une ligne de détail sous le total. Sinon : tableau détaillé.
export default function PriceBreakdown({ price, compact = false, size = 'text-lg' }) {
  const { formatPrice } = useCurrencyContext();
  const cfg = useEscrowConfig();
  const p = computeAllInclusive(price, cfg);

  if (compact) {
    return (
      <div>
        <span className={`${size} font-bold font-poppins text-[#125C8D]`}>{formatPrice(p.total)}</span>
        <p className="sm:hidden text-[10px] text-gray-400 leading-tight">
          Tout compris : transport/douane et séquestre inclus
        </p>
        <p className="hidden sm:block text-[10px] text-gray-400 leading-tight">
          Tout compris : article {formatPrice(p.item)} + transport/douane {formatPrice(p.transportCustoms)} + séquestre {formatPrice(p.escrow)}
        </p>
      </div>
    );
  }
  return (
    <div>
      <div className={`${size} font-bold font-poppins text-[#125C8D] mb-2`}>{formatPrice(p.total)}</div>
      <div className="text-xs space-y-1 p-3 bg-gray-50 rounded-xl mb-3">
        <div className="flex justify-between"><span className="text-gray-500">Prix de l'article</span><span className="font-semibold text-gray-800">{formatPrice(p.item)}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Transport / douane</span><span className="font-semibold text-gray-800">{formatPrice(p.transportCustoms)}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Séquestre (Escrow)</span><span className="font-semibold text-gray-800">{formatPrice(p.escrow)}</span></div>
        <div className="flex justify-between border-t border-gray-200 pt-1"><span className="font-semibold text-gray-700">Total tout compris</span><span className="font-bold text-[#125C8D]">{formatPrice(p.total)}</span></div>
      </div>
    </div>
  );
}

// Total seul (pour les en-têtes de prix)
export function PriceTotal({ price, className = '', style }) {
  const { formatPrice } = useCurrencyContext();
  const cfg = useEscrowConfig();
  return <span className={className} style={style}>{formatPrice(computeAllInclusive(price, cfg).total)}</span>;
}

// Détail seul (article + transport/douane + séquestre)
export function PriceDetails({ price }) {
  const { formatPrice } = useCurrencyContext();
  const cfg = useEscrowConfig();
  const p = computeAllInclusive(price, cfg);
  return (
    <div className="text-xs space-y-1 p-3 bg-gray-50 rounded-xl mb-3">
      <div className="flex justify-between gap-3"><span className="text-gray-500">Prix de l'article</span><span className="font-semibold text-gray-800 whitespace-nowrap">{formatPrice(p.item)}</span></div>
      <div className="flex justify-between gap-3"><span className="text-gray-500">Transport / douane</span><span className="font-semibold text-gray-800 whitespace-nowrap">{formatPrice(p.transportCustoms)}</span></div>
      <div className="flex justify-between gap-3"><span className="text-gray-500">Séquestre (Escrow)</span><span className="font-semibold text-gray-800 whitespace-nowrap">{formatPrice(p.escrow)}</span></div>
      <div className="flex justify-between gap-3 border-t border-gray-200 pt-1"><span className="font-semibold text-gray-700">Total tout compris</span><span className="font-bold text-[#125C8D] whitespace-nowrap">{formatPrice(p.total)}</span></div>
    </div>
  );
}
