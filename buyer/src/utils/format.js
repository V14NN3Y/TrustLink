export const formatPrice = (price) =>
  new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';

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
