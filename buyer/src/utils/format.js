export const formatPrice = (price) =>
  new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';

export const formatPriceNGN = (price) =>
  '₦' + new Intl.NumberFormat('en-NG').format(price);

export const convertToXOF = (amountNgn, rate) => {
  return Math.round(amountNgn * rate);
};

export const convertToNGN = (amountXof, rate) => {
  return rate > 0 ? Math.round(amountXof / rate) : 0;
};

export const getExchangeRateDisplay = (rate) => `1 NGN ≈ ${rate} FCFA`;

export const renderStars = (rating) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.3 ? 1 : 0;
  const empty = 5 - full - half;
  return [
    ...Array(full).fill('ri-star-fill'),
    ...Array(half).fill('ri-star-half-line'),
    ...Array(empty).fill('ri-star-line'),
  ];
};

export const generateTracking = () =>
  'TL-' + Math.random().toString(36).substring(2, 10).toUpperCase();

export const formatRelative = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `Il y a ${days}j`;
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
};
