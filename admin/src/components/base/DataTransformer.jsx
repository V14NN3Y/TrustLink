export const NGN_TO_XOF_RATE = 0.4132; // 1 NGN = 0.4132 FCFA
export const XOF_TO_NGN_RATE = 2.42;   // 1 FCFA = 2.42 NGN

export function formatNGN(n) {
  return `₦${Number(n).toLocaleString('en-NG')}`;
}

export function formatXOF(n) {
  return `FCFA ${Number(n).toLocaleString('fr-FR')}`;
}

export function convertNGNtoXOF(ngn, rate = NGN_TO_XOF_RATE) {
  return Math.round(ngn * rate);
}

export function convertXOFtoNGN(xof, rate = XOF_TO_NGN_RATE) {
  return Math.round(xof * rate);
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
