import { base44 } from '@/api/base44Client';

const STATUS_LABELS = {
  new: 'Nouvelle',
  ready_for_hub: 'Prête pour Hub',
  received_at_hub: 'Reçue au Hub',
  in_transit: 'En Transit',
  delivered: 'Livrée',
  completed: 'Terminée',
  disputed: 'En Litige',
};

const STATUS_MESSAGES = {
  ready_for_hub: (order) => `Votre commande ${order.order_number} est prête — déposez-la au hub TrustLink.`,
  received_at_hub: (order) => `La commande ${order.order_number} a été reçue au hub. En route vers le Bénin !`,
  in_transit: (order) => `La commande ${order.order_number} est en transit vers ${order.buyer_location || 'l\'acheteur'}.`,
  delivered: (order) => `La commande ${order.order_number} a été livrée à ${order.buyer_name}. En attente de confirmation.`,
  completed: (order) => `Commande ${order.order_number} terminée ! Les fonds ont été libérés vers votre solde.`,
  disputed: (order) => `Un litige a été ouvert sur la commande ${order.order_number}. Notre équipe vous contactera.`,
};

export async function createOrderStatusNotification(order, newStatus, sellerId) {
  const messageFn = STATUS_MESSAGES[newStatus];
  if (!messageFn) return;

  await base44.entities.Notification.create({
    title: `Commande ${STATUS_LABELS[newStatus] || newStatus}`,
    message: messageFn(order),
    type: 'order_status',
    order_id: order.id,
    order_number: order.order_number,
    read: false,
    seller_id: sellerId || order.seller_id || '',
  });
}
