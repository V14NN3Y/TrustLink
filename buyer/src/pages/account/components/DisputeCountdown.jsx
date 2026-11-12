import { useCountdown } from '@/hooks/useCountdown';
import { getDisputeDeadline } from '@/lib/disputeWindow';

const pad = (n) => String(n).padStart(2, '0');

export function formatRemaining(ms) {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${pad(h)}h ${pad(m)}min ${pad(s)}s`;
}

export default function DisputeCountdown({ order, className = '' }) {
  const deadline = getDisputeDeadline(order);
  const remaining = useCountdown(deadline);
  if (remaining === null) return null;
  const expired = remaining === 0;
  const urgent = !expired && remaining < 6 * 60 * 60 * 1000;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-poppins font-semibold px-2.5 py-1 rounded-full ${className}`}
      style={expired
        ? { backgroundColor: '#F1F5F9', color: '#6B7280' }
        : urgent ? { backgroundColor: '#FEE2E2', color: '#DC2626' } : { backgroundColor: '#FFFBEB', color: '#B45309' }}
    >
      <i className="ri-timer-line" />
      {expired ? 'Délai de litige expiré' : `Litige possible encore ${formatRemaining(remaining)}`}
    </span>
  );
}
