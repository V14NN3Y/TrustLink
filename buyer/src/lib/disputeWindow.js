// Fenêtre de litige : 48h après la livraison.
export const DISPUTE_WINDOW_MS = 48 * 60 * 60 * 1000;

export const getDisputeDeadline = (order) => {
  if (!order?.deliveredAt) return null;
  const t = new Date(order.deliveredAt).getTime();
  return Number.isNaN(t) ? null : t + DISPUTE_WINDOW_MS;
};
