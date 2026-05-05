/**
 * KkiaPay payment integration helper.
 * Uses the KkiaPay Web SDK loaded from https://cdn.kkiapay.me/k.js
 */

const API_KEY = import.meta.env.VITE_KKIAPAY_API_KEY;
const SANDBOX = import.meta.env.VITE_KKIAPAY_SANDBOX !== 'false';

/**
 * Initialise et ouvre la modale de paiement KkiaPay.
 * Retourne une Promise qui résout avec les données de paiement ou rejecte en cas d'erreur/annulation.
 */
export const openKkiapayPayment = ({ amount, email, phone, name, orderId }) => {
  return new Promise((resolve, reject) => {
    if (typeof KKIAPAY === 'undefined') {
      reject(new Error('KkiaPay SDK non chargé. Vérifiez votre connexion internet.'));
      return;
    }

    if (!API_KEY) {
      reject(new Error('Clé API KkiaPay non configurée. Contactez un administrateur.'));
      return;
    }

    const callbackUrl = `${window.location.origin}/account?payment=success&order=${orderId}`;

    KKIAPAY.configure({
      amount: Math.round(amount),
      callback: callbackUrl,
      position: 'right',
      key: API_KEY,
      sandbox: SANDBOX,
      email: email || '',
      phone: phone || '',
      name: name || 'Client TrustLink',
      reason: `Commande TrustLink ${orderId?.substring(0, 8).toUpperCase() || ''}`,
    });

    // Écouter les événements KkiaPay
    const handleSuccess = (data) => {
      KKIAPAY.removeEvent('success', handleSuccess);
      KKIAPAY.removeEvent('closed', handleClosed);
      KKIAPAY.removeEvent('error', handleError);
      resolve({
        success: true,
        transactionId: data?.transaction_id || data?.id || null,
        reference: data?.reference || null,
        data,
      });
    };

    const handleClosed = () => {
      KKIAPAY.removeEvent('success', handleSuccess);
      KKIAPAY.removeEvent('closed', handleClosed);
      KKIAPAY.removeEvent('error', handleError);
      resolve({ success: false, cancelled: true });
    };

    const handleError = (error) => {
      KKIAPAY.removeEvent('success', handleSuccess);
      KKIAPAY.removeEvent('closed', handleClosed);
      KKIAPAY.removeEvent('error', handleError);
      reject(new Error(error?.message || 'Erreur de paiement KkiaPay'));
    };

    KKIAPAY.on('success', handleSuccess);
    KKIAPAY.on('closed', handleClosed);
    KKIAPAY.on('error', handleError);

    KKIAPAY.open();
  });
};

/**
 * Vérifie le statut d'un paiement KkiaPay via l'API.
 * Nécessite un backend pour cacher la clé API secrète.
 */
export const verifyKkiapayPayment = async (transactionId) => {
  const response = await fetch(`https://api.kkiapay.me/api/v1/transactions/${transactionId}/verify`, {
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': API_KEY,
    },
  });
  return response.json();
};
