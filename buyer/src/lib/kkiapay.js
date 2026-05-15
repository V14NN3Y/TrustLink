const PUBLIC_KEY = import.meta.env.VITE_KKIAPAY_PUBLIC_KEY;
const SANDBOX = import.meta.env.VITE_KKIAPAY_SANDBOX !== 'false';

export const openKkiapayPayment = ({ amount, email, phone, name, orderId }) => {
  return new Promise((resolve, reject) => {
    if (typeof KKIAPAY === 'undefined') {
      reject(new Error('KkiaPay SDK non chargé. Vérifiez votre connexion internet.'));
      return;
    }

    if (!PUBLIC_KEY) {
      reject(new Error('Clé publique KkiaPay non configurée. Contactez un administrateur.'));
      return;
    }

    const callbackUrl = `${window.location.origin}/account?payment=success&order=${orderId}`;

    KKIAPAY.configure({
      amount: Math.round(amount),
      callback: callbackUrl,
      position: 'right',
      key: PUBLIC_KEY,
      sandbox: SANDBOX,
      email: email || '',
      phone: phone || '',
      name: name || 'Client TrustLink',
      reason: `Commande TrustLink ${orderId?.substring(0, 8).toUpperCase() || ''}`,
    });

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
