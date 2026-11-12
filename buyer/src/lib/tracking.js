// Suivi à 4 statuts (les statuts base de données restent inchangés).
export const TRACKING_STEPS = [
  { key: 'paid', label: 'Paiement sécurisé', icon: 'ri-shield-check-line', hint: 'Fonds bloqués en séquestre' },
  { key: 'inspection', label: 'Inspection à Lagos', icon: 'ri-camera-lens-line', hint: 'Photo de contrôle avant expédition' },
  { key: 'in_transit', label: 'En transit', icon: 'ri-truck-line', hint: 'Lagos → Cotonou' },
  { key: 'delivered', label: 'Livré', icon: 'ri-map-pin-line', hint: 'Remis à votre adresse' },
];

// Index de l'étape en cours (-1 = pas encore payé).
const STATUS_TO_STEP = {
  pending: -1,
  paid: 0,
  processing: 1,
  in_transit: 2,
  delivered: 3,
  confirmed: 3,
};

export const trackingIndex = (status) => STATUS_TO_STEP[status] ?? -1;
