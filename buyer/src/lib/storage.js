const LS_RATE_KEY = 'trustlink_exchange_rate';
const LS_RATE_DISPLAY_KEY = 'trustlink_exchange_display';
export const initDefaults = () => {
  if (!localStorage.getItem(LS_RATE_KEY)) {
    localStorage.setItem(LS_RATE_KEY, '0.89');
    localStorage.setItem(LS_RATE_DISPLAY_KEY, '1 NGN = 0.89 FCFA');
  }
};
export const getExchangeRate = () => {
  return parseFloat(localStorage.getItem(LS_RATE_KEY) || '0.89');
};
export const getExchangeDisplay = () => {
  return localStorage.getItem(LS_RATE_DISPLAY_KEY) || '1 NGN = 0.89 FCFA';
};
export const setExchangeRate = (rate) => {
  localStorage.setItem(LS_RATE_KEY, String(rate));
  localStorage.setItem(LS_RATE_DISPLAY_KEY, `1 NGN = ${rate} FCFA`);
};