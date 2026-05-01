import { getExchangeRate, getExchangeDisplay } from '@/lib/storage';

/**
 * Format a price in XOF (FCFA) with locale formatting.
 */
export const formatPrice = (price) =>
  new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';

/**
 * Format a price in NGN with locale formatting.
 */
export const formatPriceNGN = (price) =>
  '₦' + new Intl.NumberFormat('en-NG').format(price);

/**
 * Convert a NGN amount to XOF using the shared exchange rate.
 */
export const convertToXOF = (amountNgn, rateOverride = null) => {
  const rate = rateOverride ?? getExchangeRate();
  return Math.round(amountNgn * rate);
};

/**
 * Convert a XOF amount to NGN using the shared exchange rate.
 */
export const convertToNGN = (amountXof, rateOverride = null) => {
  const rate = rateOverride ?? getExchangeRate();
  return rate > 0 ? Math.round(amountXof / rate) : 0;
};

/**
 * Get the current exchange rate display string.
 */
export const getExchangeRateDisplay = () => getExchangeDisplay();

/**
 * Render star icons for a given rating.
 */
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

/**
 * Generate a tracking number.
 */
export const generateTracking = () =>
  'TL-' + Math.random().toString(36).substring(2, 10).toUpperCase();
