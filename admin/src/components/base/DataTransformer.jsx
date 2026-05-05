export function formatNGN(n) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n);
}

export function formatXOF(n) {
  return new Intl.NumberFormat('fr-BJ', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n);
}

const DEFAULT_RATE = 1.832;

export function convertNGNtoXOF(ngn, rate = DEFAULT_RATE) {
  return Math.round(ngn * rate);
}

export function convertXOFtoNGN(xof, rate = DEFAULT_RATE) {
  return Math.round(xof / rate);
}

export function formatMillions(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

export function formatDate(iso) {
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso));
}

export function formatDateTime(iso) {
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}